import jwt from "jsonwebtoken";
import configService from "../../config/config.service.js";
import { findOne } from "../../db/repository/base.repo.js";
import userModel from "../../db/model/user.model.js";
import { tokenTypesEnum } from "../enum/tokenTypes.enum.js";
import { roleEnum } from "../enum/role.enum.js";

const getTokenSecrets = (role) => {
    switch (role) {
        case roleEnum.admin:
            return {
                access:
                    configService.ADMIN_ACCESS_SECRET_KEY,
                refresh:
                    configService.ADMIN_REFRESH_SECRET_KEY
            };

        case roleEnum.user:
        default:
            return {
                access:
                    configService.USER_ACCESS_SECRET_KEY,
                refresh:
                    configService.USER_REFRESH_SECRET_KEY
            };
    }
};

export const createTokens = ({
    userId,
    issuer,
    role = roleEnum.user
}) => {
    const secrets = getTokenSecrets(role);

    const accessToken = jwt.sign(
        {
            sub: userId
        },
        secrets.access,
        {
            expiresIn: "1d",
            issuer,
            audience: [role]
        }
    );

    const refreshToken = jwt.sign(
        {
            sub: userId
        },
        secrets.refresh,
        {
            expiresIn: "7d",
            issuer,
            audience: [role]
        }
    );

    return {
        accessToken,
        refreshToken
    };
};

export const verifyToken = async (
    token,
    tokenType
) => {
    const decoded = jwt.decode(token);

    if (!decoded) {
        throw new Error("Invalid token");
    }
    const role = Array.isArray(decoded.aud)
        ? decoded.aud[0]
        : decoded.aud;

    const secrets = getTokenSecrets(role);
    const secret =
        tokenType === tokenTypesEnum.access
            ? secrets.access
            : secrets.refresh;

    const verified = jwt.verify(
        token,
        secret
    );
    const user = await findOne({
        model: userModel,
        where: {
            _id: verified.sub
        }
    });
    if (!user) {
        throw new Error("User not found");
    }

    return user;
};