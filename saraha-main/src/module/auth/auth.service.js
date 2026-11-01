
import { OAuth2Client } from "google-auth-library";
import crypto from "node:crypto";

import configService from "../../config/config.service.js";

import userModel from "../../db/model/user.model.js";

import { findOne } from "../../db/repository/base.repo.js";

import * as exceptions from "../../common/exceptions/index.js";

import {
    myHash,
    myCompare
} from "../../common/utils/security.js";

import { encrypting } from "../../common/utils/encrypting.js";

import {
    createTokens,
    verifyToken,
    revokeToken,
    getPrefixRevoke,
    getUserKey
} from "../../common/utils/token.service.js";

import {
    providerEnum,
    tokenTypesEnum,
    logoutTypeEnum,
    eventsEnum
} from "../../common/enum/index.js";

import {
    set,
    get,
    exists,
    ttl,
    del,
    keys,
    delMany
} from "../../common/services/cache.service.js";

import { eventEmitter } from "../../common/events/index.js";


const client = new OAuth2Client();


// ==========================================
// Redis Keys
// ==========================================

const getUserOTPKey = (userId) =>
    `OTP:${getUserKey(userId)}`;

const getUserSendKey = (userId) =>
    `send:${getUserKey(userId)}`;

const getUserOTPRetriesKey = (userId) =>
    `tries:${getUserKey(userId)}`;

const getUserOTPForgetKey = (userId) =>
    `OTP_FORGET:${getUserKey(userId)}`;


// ==========================================
// Signup
// ==========================================

export const createUser = async (data) => {
    const existsUser = await findOne({
        model: userModel,
        where: {
            email: data.email
        }
    });

    if (existsUser) {
        exceptions.ConflictException(
            "This user already exists"
        );
    }

    const user = await userModel.create({
        ...data,

        password: await myHash(data.password),

        phone: data.phone
            ? encrypting(data.phone)
            : undefined,

        DOB: data.DOB
            ? new Date(data.DOB)
            : undefined,

        confirmEmail: null,

        isEmailConfirmed: false,

        provider: providerEnum.system
    });

    const otp = crypto.randomInt(100000, 1000000);

    await set({
        key: getUserOTPKey(user._id.toString()),
        value: otp,
        ttl: 5 * 60
    });

    eventEmitter.emit(eventsEnum.signup, {
        recipients: {
            to: data.email
        },
        otp
    });

    return user;
};


// ==========================================
// Login
// ==========================================

export const login = async (
    data,
    issuer = "Saraha"
) => {
    const {
        email,
        password
    } = data;

    const user = await findOne({
        model: userModel,
        where: {
            email
        }
    });

    if (
        !user ||
        !user.password ||
        !(await myCompare(password, user.password))
    ) {
        exceptions.NotFoundException(
            "user not found"
        );
    }

    return createTokens({
        userId: user._id.toString(),
        role: user.role,
        issuer
    });
};


// ==========================================
// Refresh Token
// ==========================================

export const rotateToken = async (
    refreshToken,
    issuer = "Saraha"
) => {
    const user = await verifyToken(
        refreshToken,
        tokenTypesEnum.refresh
    );

    return createTokens({
        userId: user._id.toString(),
        role: user.role,
        issuer
    });
};


// ==========================================
// Google Login
// ==========================================

const verifyGoogleId = async (idToken) => {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: configService.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (!payload?.email_verified) {
        exceptions.BadRequestException(
            "email is not verified"
        );
    }

    return payload;
};


export const loginWithGmail = async (
    { idToken },
    issuer = "Saraha"
) => {
    const payload = await verifyGoogleId(idToken);

    const {
        email,
        given_name,
        family_name,
        picture
    } = payload;

    let user = await findOne({
        model: userModel,
        where: {
            email
        }
    });

    if (user) {
        if (user.provider !== providerEnum.google) {
            exceptions.ConflictException(
                "This email is already registered with another provider"
            );
        }
    } else {
        user = await userModel.create({
            email,
            firstName: given_name,
            lastName: family_name,
            image: picture,
            provider: providerEnum.google,
            isEmailConfirmed: true,
            confirmEmail: new Date()
        });
    }

    return createTokens({
        userId: user._id.toString(),
        role: user.role,
        issuer
    });
};


// ==========================================
// Logout
// ==========================================

export const logout = async (
    authorization,
    type = logoutTypeEnum.current
) => {
    if (!authorization) {
        exceptions.UnauthorizedException(
            "Authorization header is required"
        );
    }

    const [prefix, token] = authorization.split(" ");

    if (prefix !== "Bearer" || !token) {
        exceptions.UnauthorizedException(
            "Invalid authorization header"
        );
    }

    const user = await verifyToken(
        token,
        tokenTypesEnum.access
    );

    if (type === logoutTypeEnum.all) {
        const changedAt = Math.ceil(
            Date.now() / 1000
        );

        await userModel.updateOne(
            {
                _id: user._id
            },
            {
                $set: {
                    changedAt
                }
            }
        );

        await del({
            key: getUserKey(user._id.toString())
        });

        const revokedKeys = await keys({
            prefix: getPrefixRevoke(
                user._id.toString()
            )
        });

        await delMany({
            keys: revokedKeys
        });

        return {
            message: "Logged out from all devices"
        };
    }

    await revokeToken(token);

    return {
        message: "Logged out successfully"
    };
};


// ==========================================
// OTP Attempt Blocking
// ==========================================

const blockUser = async (
    userId,
    otpKey = getUserOTPKey(userId)
) => {
    const triesKey = getUserOTPRetriesKey(userId);

    const userOTPRetries = Number(
        await get({
            key: triesKey
        }) || 0
    );

    if (
        userOTPRetries >=
        configService.MAX_OTP_RETRIES
    ) {
        const remainingTime = await ttl({
            key: triesKey
        });

        await del({
            key: otpKey
        });

        exceptions.BadRequestException(
            `Too many attempts. Try again after ${Math.ceil(remainingTime / 60)} minutes`
        );
    }
};


// ==========================================
// Resend OTP
// ==========================================

export const resendOTP = async (
    email,
    topic = "signup"
) => {
    const user = await findOne({
        model: userModel,
        where: {
            email
        }
    });

    if (!user) {
        exceptions.NotFoundException(
            "User not found"
        );
    }

    const userId = user._id.toString();

    if (
        topic === "signup" &&
        user.isEmailConfirmed
    ) {
        exceptions.BadRequestException(
            "Email is already confirmed"
        );
    }

    const otpKey = topic === "signup"
        ? getUserOTPKey(userId)
        : getUserOTPForgetKey(userId);

    if (
        topic === "signup" &&
        await exists({
            key: otpKey
        })
    ) {
        exceptions.BadRequestException(
            "Can't send new OTP while the old one is active"
        );
    }

    const sendKey = getUserSendKey(userId);

    const sendRetries = Number(
        await get({
            key: sendKey
        }) || 0
    );

    if (
        sendRetries >=
        configService.MAX_SEND_RETRIES
    ) {
        const remainingTime = await ttl({
            key: sendKey
        });

        exceptions.BadRequestException(
            `You reached your limit. Please try again after ${Math.ceil(remainingTime / 60)} minutes`
        );
    }

    const otp = crypto.randomInt(100000, 1000000);

    await set({
        key: otpKey,
        value: otp,
        ttl: 5 * 60
    });

    const eventName = topic === "signup"
        ? eventsEnum.resendOtp
        : eventsEnum.forgetPassword;

    eventEmitter.emit(eventName, {
        recipients: {
            to: email
        },
        otp
    });

    await set({
        key: sendKey,
        value: sendRetries + 1,
        ttl: 60 * 60
    });

    return "OTP sent successfully";
};


// ==========================================
// Confirm Email
// ==========================================

export const confirmEmail = async ({
    email,
    otp
}) => {
    const user = await findOne({
        model: userModel,
        where: {
            email
        }
    });

    if (!user) {
        exceptions.NotFoundException(
            "User not found"
        );
    }

    if (user.isEmailConfirmed) {
        exceptions.BadRequestException(
            "Email is already confirmed"
        );
    }

    const userId = user._id.toString();

    const otpKey = getUserOTPKey(userId);

    await blockUser(userId, otpKey);

    const savedOTP = await get({
        key: otpKey
    });

    if (savedOTP === null) {
        exceptions.NotFoundException(
            "OTP not found or expired"
        );
    }

    if (String(savedOTP) !== String(otp)) {
        const triesKey = getUserOTPRetriesKey(userId);

        const currentTries = Number(
            await get({
                key: triesKey
            }) || 0
        );

        await set({
            key: triesKey,
            value: currentTries + 1,
            ttl: 5 * 60
        });

        await blockUser(userId, otpKey);

        exceptions.BadRequestException(
            "Invalid OTP"
        );
    }

    await userModel.updateOne(
        {
            _id: user._id
        },
        {
            $set: {
                isEmailConfirmed: true,
                confirmEmail: new Date()
            }
        }
    );

    await del({
        key: otpKey
    });

    await del({
        key: getUserOTPRetriesKey(userId)
    });

    return "Email confirmed successfully";
};


// ==========================================
// Forgot Password
// ==========================================

export const forgotPassword = async (email) => {
    const user = await findOne({
        model: userModel,
        where: {
            email
        }
    });

    if (!user) {
        exceptions.NotFoundException(
            "User not found"
        );
    }

    return await resendOTP(
        email,
        "forgotPassword"
    );
};


// ==========================================
// Reset Password
// ==========================================

export const resetPassword = async ({
    email,
    otp,
    newPassword
}) => {
    const user = await findOne({
        model: userModel,
        where: {
            email
        }
    });

    if (!user) {
        exceptions.NotFoundException(
            "User not found"
        );
    }

    const userId = user._id.toString();

    const otpKey = getUserOTPForgetKey(userId);

    await blockUser(userId, otpKey);

    const savedOTP = await get({
        key: otpKey
    });

    if (savedOTP === null) {
        exceptions.NotFoundException(
            "OTP not found or expired"
        );
    }

    if (String(savedOTP) !== String(otp)) {
        const triesKey = getUserOTPRetriesKey(userId);

        const currentTries = Number(
            await get({
                key: triesKey
            }) || 0
        );

        await set({
            key: triesKey,
            value: currentTries + 1,
            ttl: 5 * 60
        });

        await blockUser(userId, otpKey);

        exceptions.BadRequestException(
            "Invalid OTP"
        );
    }

    await userModel.updateOne(
        {
            _id: user._id
        },
        {
            $set: {
                password: await myHash(newPassword),
                changedAt: Math.ceil(Date.now() / 1000)
            }
        }
    );

    await del({
        key: otpKey
    });

    await del({
        key: getUserOTPRetriesKey(userId)
    });

    await del({
        key: getUserKey(userId)
    });

    return "Password reset successfully";
};
