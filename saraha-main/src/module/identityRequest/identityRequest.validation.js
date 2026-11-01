
import { z } from "zod";
import { Types } from "mongoose";

const objectId = z.string().refine(
    (value) => Types.ObjectId.isValid(value),
    "Invalid ID"
);

export const createIdentityRequestSchema = z.object({
    params: z.object({
        messageId: objectId
    })
});

export const getIdentityRequestsSchema = z.object({
    query: z.object({
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional()
    })
});

export const respondIdentityRequestSchema = z.object({
    params: z.object({
        requestId: objectId
    }),
    body: z.object({
        decision: z.enum(["accepted", "rejected"])
    })
});
