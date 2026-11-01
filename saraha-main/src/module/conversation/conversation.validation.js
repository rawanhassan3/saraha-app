
import { z } from "zod";
import { Types } from "mongoose";

const objectId = z.string().refine(
    (value) => Types.ObjectId.isValid(value),
    "Invalid conversation ID"
);

export const conversationIdSchema = z.object({
    params: z.object({
        conversationId: objectId
    })
});

export const sendConversationMessageSchema = z.object({
    params: z.object({
        conversationId: objectId
    }),
    body: z.object({
        content: z.string().trim().min(1).max(5000)
    })
});

export const getConversationMessagesSchema = z.object({
    params: z.object({
        conversationId: objectId
    }),
    query: z.object({
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional()
    })
});
