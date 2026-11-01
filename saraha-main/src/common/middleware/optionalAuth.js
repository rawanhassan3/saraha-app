
import { verifyToken } from "../utils/token.service.js";
import { tokenTypesEnum } from "../enum/tokenTypes.enum.js";
import { findOne } from "../../db/repository/base.repo.js";
import userModel from "../../db/model/user.model.js";
import { myCompare } from "../utils/index.js";

import {
    BadRequestException,
    UnauthorizedException
} from "../exceptions/index.js";

export const optionalAuth = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;

        // No authorization header: continue as guest
        if (!authorization) {
            req.user = null;
            return next();
        }

        const [prefix, token] = authorization.split(" ");

        if (!prefix || !token) {
            UnauthorizedException("Invalid authorization header");
        }

        // Bearer Authentication
        if (prefix === "Bearer") {
            req.user = await verifyToken(
                token,
                tokenTypesEnum.access
            );

            return next();
        }

        // Basic Authentication
        if (prefix === "Basic") {
            let credentials;

            try {
                credentials = Buffer
                    .from(token, "base64")
                    .toString();
            } catch {
                UnauthorizedException("Invalid credentials");
            }

            const [email, password] = credentials.split(":");

            if (!email || !password) {
                UnauthorizedException("Invalid credentials");
            }

            const user = await findOne({
                model: userModel,
                where: { email },
                check: true
            });

            if (!user) {
                UnauthorizedException("Invalid credentials");
            }

            const isMatch = myCompare({
                plainText: password,
                hashedText: user.password
            });

            if (!isMatch) {
                UnauthorizedException("Invalid credentials");
            }

            req.user = user;
            return next();
        }

        BadRequestException("Unsupported authorization type");

    } catch (error) {
        next(error);
    }
};
