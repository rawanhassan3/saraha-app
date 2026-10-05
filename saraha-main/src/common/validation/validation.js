import { z } from "zod";

import {
    genderEnum
} from "../enum/index.js";

export const generalFields = {
    email: z.email(),

    password: z
        .string()
        .min(5)
        .max(20),

    phone: z
        .string()
        .regex(
            /^\+[1-9]\d{7,14}$/,
            "Invalid phone number"
        ),

    fullName: z
        .string()
        .min(3)
        .max(50)
        .regex(
            /^[A-Za-z]+(?:\s+[A-Za-z]+)+$/,
            "Full name must contain letters and spaces only"
        ),

    gender: z
        .number()
        .refine(
            (value) =>
                Object.values(genderEnum).includes(value),
            {
                message: "Invalid gender"
            }
        ),

    DOB: z.coerce.date(),

    userId: z
        .string()
        .regex(
            /^[0-9a-fA-F]{24}$/,
            "Invalid user id"
        ),

    page: z.coerce
        .number()
        .int()
        .min(1)
        .default(1),

    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(10)
};