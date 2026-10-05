import { Router } from "express";

import {
    response
} from "../../common/utils/index.js";

import {
    middleware
} from "../../common/index.js";

import * as authService
    from "./auth.service.js";

import * as authValidation
    from "./auth.validation.js";

const {
    validator
} = middleware;

const authRouter = Router();

authRouter.post(
    "/signup",
    validator(
        authValidation.signupSchema
    ),
    async (req, res, next) => {
        try {
            const user =
                await authService.createUser(
                    req.validated.body
                );

            return response({
                res,
                data: user,
                status: 201,
                message: "user created"
            });
        } catch (error) {
            next(error);
        }
    }
);

authRouter.post(
    "/loginWithGmail",
    async (req, res, next) => {
        try {
            const result =
                await authService.loginWithGmail(
                    req.body
                );

            return response({
                res,
                data: result,
                status: 200,
                message:
                    "user login with gmail"
            });
        } catch (error) {
            next(error);
        }
    }
);

authRouter.post(
    "/login",
    validator(
        authValidation.loginSchema
    ),
    async (req, res, next) => {
        try {
            const result =
                await authService.login(
                    req.validated.body
                );

            return response({
                res,
                data: result,
                status: 200,
                message: "user login"
            });
        } catch (error) {
            next(error);
        }
    }
);

authRouter.get(
    "/rotate-token",
    validator(
        authValidation.rotateTokenSchema
    ),
    async (req, res, next) => {
        try {
            const authorization =
                req.validated.headers
                    .authorization;

            const [, refreshToken] =
                authorization.split(" ");

            const result =
                await authService.rotateToken(
                    refreshToken
                );

            return response({
                res,
                data: result,
                status: 200,
                message: "token refreshed"
            });
        } catch (error) {
            next(error);
        }
    }
);

export default authRouter;