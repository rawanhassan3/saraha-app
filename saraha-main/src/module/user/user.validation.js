import { z } from "zod";

import {
    GF
} from "../../common/index.js";

export const getUserByIdSchema = (
    lang = "en"
) =>
    z.object({
        params: z.strictObject({
            userId: GF.id(lang)
        }),

        query: z.strictObject({
            phone: GF
                .stringBool(lang)
                .optional()
        })
    });

export const paginationSchema = (
    lang = "en"
) =>
    z.object({
        query: z.strictObject({
            page: GF.page(lang),

            limit: GF.limit(lang)
        })
    });

export const updateSchema = (
    lang = "en"
) =>
    z.object({
        params: z.strictObject({
            id: GF.id(lang)
        }),

        body: z.strictObject({
            phone:
                GF.phone(lang)
                    .optional(),

            fullName:
                GF.fullName(lang)
                    .optional(),

            gender:
                GF.gender(lang)
                    .optional(),

            DOB:
                GF.DOB(lang)
                    .optional()
        })
    });