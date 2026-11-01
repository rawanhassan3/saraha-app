
import { Router } from "express";
import { response, middleware } from "../../common/index.js";
import * as service from "./identityRequest.service.js";
import * as validation from "./identityRequest.validation.js";

export const identityRequestRouter = Router();

// Receiver requests the sender's identity.
identityRequestRouter.post(
    "/message/:messageId",
    middleware.auth,
    middleware.validator(validation.createIdentityRequestSchema),
    async (req, res, next) => {
        try {
            const data = await service.createRequest(
                req.user._id,
                req.params.messageId
            );

            response({
                res,
                data,
                status: 201,
                message: "Identity request created"
            });
        } catch (error) {
            next(error);
        }
    }
);

// Original sender gets requests received.
identityRequestRouter.get(
    "/",
    middleware.auth,
    middleware.validator(validation.getIdentityRequestsSchema),
    async (req, res, next) => {
        try {
            const data = await service.getReceivedRequests(
                req.user._id,
                req.query
            );

            response({
                res,
                data,
                status: 200,
                message: "Identity requests fetched"
            });
        } catch (error) {
            next(error);
        }
    }
);

// Receiver checks their sent requests.
identityRequestRouter.get(
    "/sent",
    middleware.auth,
    middleware.validator(validation.getIdentityRequestsSchema),
    async (req, res, next) => {
        try {
            const data = await service.getSentRequests(
                req.user._id,
                req.query
            );

            response({
                res,
                data,
                status: 200,
                message: "Sent identity requests fetched"
            });
        } catch (error) {
            next(error);
        }
    }
);

// Original sender accepts or rejects.
identityRequestRouter.patch(
    "/:requestId",
    middleware.auth,
    middleware.validator(validation.respondIdentityRequestSchema),
    async (req, res, next) => {
        try {
            const data = await service.respondToRequest(
                req.user._id,
                req.params.requestId,
                req.body.decision
            );

            response({
                res,
                data,
                status: 200,
                message: `Identity request ${req.body.decision}`
            });
        } catch (error) {
            next(error);
        }
    }
);
