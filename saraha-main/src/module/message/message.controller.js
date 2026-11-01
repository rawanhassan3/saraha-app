
import { Router } from "express";
import {
    response,
    middleware
} from "../../common/index.js";
import {
    fileTypes,
    multerMemory,
    processFiles
} from "../../common/middleware/multer.local.js";

import * as ms from "./message.service.js";
import * as mv from "./message.validation.js";

export const messageRouter = Router();

messageRouter.post(
    "/",
    middleware.optionalAuth,
    multerMemory({
        filetype: fileTypes.images
    }).array("images", 5),
    processFiles({
        filetype: fileTypes.images
    }),
    middleware.validator(mv.sendMessageSchema),
    async (req, res, next) => {
        try {
            const data = await ms.sendMessage(
                req.body,
                req.files || [],
                req.user?._id
            );

            response({
                res,
                data,
                status: 201,
                message: "message sent"
            });
        } catch (error) {
            next(error);
        }
    }
);

messageRouter.get(
    "/",
    middleware.auth,
    middleware.validator(mv.getMessagesSchema),
    async (req, res, next) => {
        try {
            const data = await ms.getMessages(
                req.user._id,
                req.query
            );

            response({
                res,
                data,
                status: 200,
                message: "Messages fetched"
            });
        } catch (error) {
            next(error);
        }
    }
);

messageRouter.delete(
    "/:id",
    middleware.auth,
    middleware.validator(mv.deleteMessageSchema),
    async (req, res, next) => {
        try {
            const data = await ms.deleteMessage(
                req.user._id,
                req.params.id
            );

            response({
                res,
                data,
                status: 200,
                message: "Message deleted"
            });
        } catch (error) {
            next(error);
        }
    }
);
