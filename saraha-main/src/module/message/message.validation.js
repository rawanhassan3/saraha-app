
import { z } from "zod";
import { Types } from "mongoose";

export const sendMessageSchema = z.object({
    body: z.object({
        receiverId: z
            .string()
            .refine(
                (value) => Types.ObjectId.isValid(value),
                "Invalid receiver ID"
            ),

        content: z
            .string()
            .min(5)
            .max(5000)
            .optional()
    })
});

export const getMessagesSchema = z.object({
    query: z.object({
        type: z.coerce.number().int().min(0).max(2).optional(),
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional()
    })
});

export const deleteMessageSchema = z.object({
    params: z.object({
        id: z
            .string()
            .refine(
                (value) => Types.ObjectId.isValid(value),
                "Invalid message ID"
            )
    })
});
