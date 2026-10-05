import { OAuth2Client } from "google-auth-library";
import configService from "../../config/config.service.js";
import userModel from "../../db/model/user.model.js";
import { findOne } from "../../db/repository/base.repo.js";
import * as exceptions from "../../common/exceptions/index.js";
import { myHash, myCompare } from "../../common/utils/security.js";
import { encrypting } from "../../common/utils/encrypting.js";
import {
    createTokens,
    verifyToken
} from "../../common/utils/token.service.js";

import { providerEnum } from "../../common/enum/provider.enum.js";
const client = new OAuth2Client();
export const createUser = async (data) => {
    const exists = await findOne({
        model: userModel,
        where: {
            email: data.email
        }
    });
    if (exists) {
        exceptions.ConflictException("This user already exists");
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
        confirmEmail: new Date(),
        provider: providerEnum.system
    });

    return user;
};

export const login = async (
    data,
    issuer = "Saraha"
) => {
    const { email, password } = data;

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
        exceptions.NotFoundException("user not found");
    }
    return createTokens({
        userId: user._id.toString(),
        role: user.role,
        issuer
    });
};

export const rotateToken = async (
    refreshToken,
    issuer = "Saraha"
) => {
    const user = await verifyToken(
        refreshToken,
        "refresh"
    );

    return createTokens({
        userId: user._id.toString(),
        role: user.role,
        issuer
    });
};

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
        if (
            user.provider !== providerEnum.google
        ) {
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
            provider: providerEnum.google
        });
    }
    return createTokens({
        userId: user._id.toString(),
        role: user.role,
        issuer
    });
};