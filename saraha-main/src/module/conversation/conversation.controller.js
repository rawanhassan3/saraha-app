
import { Router } from "express";
import { response, middleware } from "../../common/index.js";
import * as service from "./conversation.service.js";
import * as validation from "./conversation.validation.js";

export const conversationRouter = Router();

// Get conversations belonging to the logged-in user.
conversationRouter.get(
    "/",
    middleware.auth,
    async (req, res, next) => {
        try {
            const data = await service.getMyConversations(
                req.user._id
            );

            response({
                res,
                data,
                status: 200,
                message: "Conversations fetched"
            });
        } catch (error) {
            next(error);
        }
    }
);

// Send a message inside a conversation.
conversationRouter.post(
    "/:conversationId/messages",
    middleware.auth,
    middleware.validator(validation.sendConversationMessageSchema),
    async (req, res, next) => {
        try {
            const data = await service.sendConversationMessage(
                req.user._id,
                req.params.conversationId,
                req.body.content
            );

            response({
                res,
                data,
                status: 201,
                message: "Conversation message sent"
            });
        } catch (error) {
            next(error);
        }
    }
);

// Get messages inside a conversation.
conversationRouter.get(
    "/:conversationId/messages",
    middleware.auth,
    middleware.validator(validation.getConversationMessagesSchema),
    async (req, res, next) => {
        try {
            const data = await service.getConversationMessages(
                req.user._id,
                req.params.conversationId,
                req.query
            );

            response({
                res,
                data,
                status: 200,
                message: "Conversation messages fetched"
            });
        } catch (error) {
            next(error);
        }
    }
);
