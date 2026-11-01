import { z } from "zod";

import {
    GF,
    enums
} from "../../common/index.js";

import {
    logoutTypeEnum
} from "../../common/enum/index.js";


const loginBody = (lang = "en") =>
    z.strictObject({
        email: GF.email(lang),

        password: GF.password(lang)
    });


const signupBody = (lang = "en") =>
    loginBody(lang)
        .safeExtend({
            confirmPassword: GF.password(lang),

            phone: GF.phone(lang),

            fullName: GF.fullName(lang),

            gender: GF.gender(lang),

            DOB: GF.DOB(lang)
        })
        .superRefine((data, ctx) => {
            if (
                data.password !== data.confirmPassword
            ) {
                ctx.addIssue({
                    code: "custom",
                    path: ["confirmPassword"],
                    message: "Password doesn't match confirm password"
                });
            }

            if (data.fullName.toLowerCase() === "admin") {
                ctx.addIssue({
                    code: "custom",
                    path: ["fullName"],
                    message: "Full name cannot be admin"
                });
            }
        })
        .transform((data) => {
            const {
                confirmPassword,
                ...rest
            } = data;

            return rest;
        });


export const loginSchema = (lang = "en") =>
    z.object({
        body: loginBody(lang)
    });


export const signupSchema = (lang = "en") =>
    z.object({
        body: signupBody(lang)
    });


export const rotateTokenSchema = (lang = "en") =>
    z.object({
        headers: GF.headers(lang)
    });


export const logoutSchema = (lang = "en") =>
    z.object({
        body: z.object({
            type: z
                .enum(Object.values(logoutTypeEnum))
                .default(logoutTypeEnum.current)
        }).default({}),

        headers: GF.headers(lang)
    });

export const confirmEmailSchema = (lang = "en") =>
    z.object({
        body: z.strictObject({
            email: GF.email(lang),

            otp: z.string().length(6)
        })
    });


export const resendOtpSchema = (lang = "en") =>
    z.object({
        body: z.strictObject({
            email: GF.email(lang),

            topic: z
                .enum(["signup", "forgotPassword"])
                .default("signup")
        })
    });


export const forgotPasswordSchema = (lang = "en") =>
    z.object({
        body: z.strictObject({
            email: GF.email(lang)
        })
    });


export const resetPasswordSchema = (lang = "en") =>
    z.object({
        body: z.strictObject({
            email: GF.email(lang),

            otp: z.string().length(6),

            newPassword: GF.password(lang)
        })
    });    