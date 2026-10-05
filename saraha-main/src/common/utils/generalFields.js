import { z } from "zod";

import { enums } from "../index.js";

import {
    getErrorMessage
} from "./validationErrors.js";

export const generalFields = {
    phone: (lang = "en") =>
        z
            .string()
            .regex(
                /^(?:01[0-25]\d{8}|\+201[0-25]\d{8})$/,
                {
                    error: getErrorMessage(
                        "wrongPhoneNumber",
                        lang
                    )
                }
            ),

    email: (lang = "en") =>
        z.email({
            error: getErrorMessage(
                "invalidEmail",
                lang
            )
        }),

    password: (lang = "en") =>
        z
            .string()
            .max(20, {
                error:
                    lang === "ar"
                        ? "كلمة السر طويلة جدًا"
                        : "Password is too long"
            })
            .min(5, {
                error:
                    lang === "ar"
                        ? "كلمة السر قصيرة جدًا"
                        : "Password is too short"
            }),

    fullName: (lang = "en") =>
        z
            .string()
            .regex(
                /^[A-Za-z]{3,20}\s[A-Za-z]{3,20}$/,
                {
                    error: getErrorMessage(
                        "fullName",
                        lang
                    )
                }
            ),

    gender: (lang = "en") =>
        z.union(
            [
                z.literal(
                    enums.genderEnum.male
                ),

                z.literal(
                    enums.genderEnum.female
                )
            ],
            {
                error: getErrorMessage(
                    "invalidGender",
                    lang
                )
            }
        ),

    DOB: (lang = "en") =>
        z.string(),

    page: (lang = "en") =>
        z.coerce
            .number()
            .int()
            .gte(1, {
                error:
                    lang === "ar"
                        ? "رقم الصفحة يجب أن يكون أكبر من أو يساوي 1"
                        : "Page must be greater than or equal to 1"
            }),

    limit: (lang = "en") =>
        z.coerce
            .number()
            .int()
            .gte(1, {
                error:
                    lang === "ar"
                        ? "الحد الأدنى يجب أن يكون 1"
                        : "Limit must be greater than or equal to 1"
            }),

    id: (lang = "en") =>
        z
            .string()
            .regex(
                /^[0-9a-fA-F]{24}$/,
                {
                    error: getErrorMessage(
                        "invalidObjectId",
                        lang
                    )
                }
            ),

    headers: (lang = "en") =>
        z.object({
            authorization: z.string(),

            "accept-language": z
                .enum(["ar", "en"])
                .optional()
                .default("en")
        }),

    stringBool: (lang = "en") =>
        z.stringbool({
            truthy: ["true"],
            falsy: ["false"],
            case: "sensitive",
            error:
                lang === "ar"
                    ? "القيمة يجب أن تكون true أو false"
                    : "This value must be true or false"
        })
};

export const GF = generalFields;

export default generalFields;