import { Router } from "express";

import {
    response
} from "../../common/utils/index.js";

import {
    middleware
} from "../../common/index.js";

import * as authService from "./auth.service.js";

import * as authValidation from "./auth.validation.js";

const {
    validator
} = middleware;

const authRouter = Router();


authRouter.post(
    "/signup",
    validator(authValidation.signupSchema),
    async (req, res, next) => {
        try {
            const user = await authService.createUser(
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
            const result = await authService.loginWithGmail(
                req.body
            );

            return response({
                res,
                data: result,
                status: 200,
                message: "user login with gmail"
            });
        } catch (error) {
            next(error);
        }
    }
);


authRouter.post(
    "/login",
    validator(authValidation.loginSchema),
    async (req, res, next) => {
        try {
            const result = await authService.login(
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
    validator(authValidation.rotateTokenSchema),
    async (req, res, next) => {
        try {
            const authorization =
                req.validated.headers.authorization;

            const [, refreshToken] =
                authorization.split(" ");

            const result = await authService.rotateToken(
                refreshToken
            );

            return response({
                res,
                data: result,
                status: 200,
                message: "token rotated"
            });
        } catch (error) {
            next(error);
        }
    }
);


authRouter.post(
    "/log-out",
    validator(authValidation.logoutSchema),
    async (req, res, next) => {
        try {
            const result = await authService.logout(
                req.validated.headers.authorization,
                req.validated.body.type
            );

            return response({
                res,
                data: result,
                status: 200,
                message: "logout"
            });
        } catch (error) {
            next(error);
        }
    }
);
// Confirm Email
authRouter.post(
    "/confirmEmail",
    validator(authValidation.confirmEmailSchema),
    async (req, res, next) => {
        try {
            const result = await authService.confirmEmail(
                req.validated.body
            );

            return response({
                res,
                data: result,
                status: 200,
                message: "Email confirmed"
            });
        } catch (error) {
            next(error);
        }
    }
);


// Resend OTP
authRouter.post(
    "/resendOtp",
    validator(authValidation.resendOtpSchema),
    async (req, res, next) => {
        try {
            const { email, topic } = req.validated.body;

            const result = await authService.resendOTP(
                email,
                topic
            );

            return response({
                res,
                data: result,
                status: 200,
                message: "OTP sent"
            });
        } catch (error) {
            next(error);
        }
    }
);


// Forgot Password
authRouter.post(
    "/forgotPassword",
    validator(authValidation.forgotPasswordSchema),
    async (req, res, next) => {
        try {
            const result = await authService.forgotPassword(
                req.validated.body.email
            );

            return response({
                res,
                data: result,
                status: 200,
                message: "Password reset OTP sent"
            });
        } catch (error) {
            next(error);
        }
    }
);


// Reset Password
authRouter.post(
    "/resetPassword",
    validator(authValidation.resetPasswordSchema),
    async (req, res, next) => {
        try {
            const result = await authService.resetPassword(
                req.validated.body
            );

            return response({
                res,
                data: result,
                status: 200,
                message: "Password reset successfully"
            });
        } catch (error) {
            next(error);
        }
    }
);

export default authRouter;