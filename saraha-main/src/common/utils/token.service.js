import jwt from "jsonwebtoken";
import crypto from "node:crypto";

import configService from "../../config/config.service.js";

import {
    findOne
} from "../../db/repository/base.repo.js";

import userModel from "../../db/model/user.model.js";

import {
    tokenTypesEnum,
    roleEnum
} from "../enum/index.js";

import {
    UnauthorizedException,
    NotFoundException
} from "../exceptions/index.js";

import {
    exists,
    get,
    set
} from "../services/cache.service.js";


const getTokenSecrets = (role) => {
    switch (role) {
        case roleEnum.admin:
            return {
                access: configService.ADMIN_ACCESS_SECRET_KEY,
                refresh: configService.ADMIN_REFRESH_SECRET_KEY
            };

        case roleEnum.user:
            return {
                access: configService.USER_ACCESS_SECRET_KEY,
                refresh: configService.USER_REFRESH_SECRET_KEY
            };

        default:
            UnauthorizedException("Unhandled role");
    }
};


// Redis keys

export const getRevokeKey = (userId, jti) => {
    return `revokeToken:${userId}:${jti}`;
};

export const getPrefixRevoke = (userId) => {
    return `revokeToken:${userId}:`;
};

export const getUserKey = (userId) => {
    return `user:${userId}`;
};


// Create access and refresh tokens

export const createTokens = ({
    userId,
    issuer = "Saraha",
    role = roleEnum.user
}) => {
    const secrets = getTokenSecrets(role);

    const jti = crypto.randomUUID();

    return {
        accessToken: jwt.sign(
            {
                sub: userId
            },
            secrets.access,
            {
                expiresIn: "1d",
                issuer,
                audience: [role],
                jwtid: jti
            }
        ),

        refreshToken: jwt.sign(
            {
                sub: userId
            },
            secrets.refresh,
            {
                expiresIn: "7d",
                issuer,
                audience: [role],
                jwtid: jti
            }
        )
    };
};


// Revoke one token

export const revokeToken = async (token) => {
    const decoded = jwt.decode(token);

    if (!decoded?.sub || !decoded?.jti || !decoded?.exp) {
        UnauthorizedException("Invalid token");
    }

    const remainingTime = Math.ceil(
        decoded.exp - Date.now() / 1000
    );

    if (remainingTime <= 0) {
        return false;
    }

    return await set({
        key: getRevokeKey(
            decoded.sub,
            decoded.jti
        ),
        value: 1,
        ttl: remainingTime
    });
};


// Verify access or refresh token

export const verifyToken = async (
    token,
    tokenType = tokenTypesEnum.access
) => {
    const decoded = jwt.decode(token);

    if (!decoded || !decoded.sub) {
        UnauthorizedException("Invalid token");
    }

    const role = Array.isArray(decoded.aud)
        ? decoded.aud[0]
        : decoded.aud;

    const secrets = getTokenSecrets(role);

    const secret =
        tokenType === tokenTypesEnum.access
            ? secrets.access
            : secrets.refresh;

    const verified = jwt.verify(token, secret);

    // Check if this token was revoked

    if (
        verified.jti &&
        await exists({
            key: getRevokeKey(
                verified.sub,
                verified.jti
            )
        })
    ) {
        UnauthorizedException("You are already logged out");
    }

    // Get user from Redis first

    const userKey = getUserKey(verified.sub);

    let user = await get({
        key: userKey
    });

    if (!user) {
        user = await findOne({
            model: userModel,
            where: {
                _id: verified.sub
            }
        });

        if (!user) {
            NotFoundException("User not found");
        }

        user = user.toObject();

        await set({
            key: userKey,
            value: user,
            ttl: 30
        });
    }

    // Check if user logged out from all devices

    if (
        user.changedAt &&
        verified.iat <= user.changedAt
    ) {
        UnauthorizedException("You are already logged out");
    }

    return user;
};