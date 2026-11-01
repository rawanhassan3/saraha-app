import { Router } from "express";

import {
    response
} from "../../common/utils/response.js";

import {
    auth,
    authorization,
    validator
} from "../../common/middleware/index.js";

import {
    getUserById,
    getAllUsers
} from "./user.service.js";

import {
    decrypting
} from "../../common/utils/encrypting.js";

import {
    roleEnum
} from "../../common/enum/role.enum.js";

import {
    getUserByIdSchema,
    paginationSchema
} from "./user.validation.js";

import {
    get,
    set
} from "../../common/services/cache.service.js";

const userRouter = Router();

userRouter.get(
    "/all",
    auth,
    authorization(roleEnum.admin),
    validator(paginationSchema),
    async (req, res, next) => {
        try {
            const users = await getAllUsers(
                req.validated.query
            );

            return response({
                res,
                data: users,
                status: 200,
                message: "users fetched"
            });
        } catch (error) {
            next(error);
        }
    }
);

userRouter.get(
    "/:userId",
    auth,
    validator(getUserByIdSchema),
    async (req, res, next) => {
        try {
            const userId =
                req.validated.params.userId;

            const cacheKey = `user:${userId}`;

            let user = await get({
                key: cacheKey
            });

            if (user) {
                console.log("User fetched from Redis");
            } else {
                const userDocument =
                    await getUserById(userId);

                user = userDocument.toObject();

                await set({
                    key: cacheKey,
                    value: user,
                    ttl: 60
                });

                console.log("User fetched from MongoDB");
            }

            // Decrypt phone only for this response.
            // Keep the cached phone encrypted.
            if (
                req.validated.query.phone &&
                user.phone
            ) {
                user = {
                    ...user,
                    phone: decrypting(user.phone)
                };
            }

            return response({
                res,
                data: user || {},
                status: 200,
                message: "user fetched"
            });
        } catch (error) {
            next(error);
        }
    }
);

userRouter.get(
    "/",
    auth,
    async (req, res, next) => {
        try {
            const user = req.user;

            if (user.phone) {
                user.phone = decrypting(user.phone);
            }

            return response({
                res,
                data: user,
                status: 200,
                message: "user fetched"
            });
        } catch (error) {
            next(error);
        }
    }
);

export default userRouter;