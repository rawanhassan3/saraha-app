import { findOne } from "../../db/repository/base.repo.js";
import userModel from "../../db/model/user.model.js";
import {
    myCompare,
    verifyToken
} from "../utils/index.js";

import {
    BadRequestException,
    NotFoundException
} from "../exceptions/index.js";

import { authEnum } from "../enum/auth.enum.js";
import { tokenTypesEnum } from "../enum/tokenTypes.enum.js";
export default async (req, res, next) => {
    try {
        const authorization =
            req.headers.authorization;

        if (!authorization) {
            BadRequestException(
                "Authorization header is required"
            );
        }

        const [prefix, token] =
            authorization.split(" ");

        switch (prefix) {
            case authEnum.Basic: {
                if (!token) {
                    BadRequestException(
                        "Basic credentials are required"
                    );
                }
                const data = Buffer.from(
                    token,
                    "base64"
                ).toString();

                const [email, password] =
                    data.split(":");

                const user = await findOne({
                    model: userModel,
                    where: {
                        email
                    }
                });
                if (
                    !user ||
                    !user.password ||
                    !(await myCompare(
                        password,
                        user.password
                    ))
                ) {
                    NotFoundException(
                        "user not found"
                    );
                }

                req.user = user;

                break;
            }
            case authEnum.Bearer: {
                if (!token) {
                    BadRequestException(
                        "Bearer token is required"
                    );
                }
                req.user =
                    await verifyToken(
                        token,
                        tokenTypesEnum.access
                    );

                break;
            }
            default:
                BadRequestException(
                    "invalid auth type"
                );
        }
        next();
    } catch (error) {
        next(error);
    }
};