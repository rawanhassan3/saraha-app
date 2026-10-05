import { z } from "zod";

import {
    GF
} from "../../common/index.js";

const loginBody = (lang = "en") =>
    z.strictObject({
        email: GF.email(lang),

        password: GF.password(lang)
    });

const signupBody = (lang = "en") =>
    loginBody(lang)
        .safeExtend({
            confirmPassword:
                GF.password(lang),

            phone:
                GF.phone(lang),

            fullName:
                GF.fullName(lang),

            gender:
                GF.gender(lang),

            DOB:
                GF.DOB(lang)
        })
        .superRefine((data, ctx) => {
            if (
                data.password !==
                data.confirmPassword
            ) {
                ctx.addIssue({
                    code: "custom",
                    path: [
                        "confirmPassword"
                    ],
                    message:
                        lang === "ar"
                            ? "كلمة السر غير متطابقة"
                            : "Password doesn't match confirm password"
                });
            }

            if (
                data.fullName.toLowerCase() ===
                "admin"
            ) {
                ctx.addIssue({
                    code: "custom",
                    path: ["fullName"],
                    message:
                        lang === "ar"
                            ? "الاسم لا يمكن أن يكون admin"
                            : "Full name cannot be admin"
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

export const rotateTokenSchema = (
    lang = "en"
) =>
    z.object({
        headers: GF.headers(lang)
    });