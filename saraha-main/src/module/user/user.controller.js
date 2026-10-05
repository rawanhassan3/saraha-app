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

const userRouter = Router();

userRouter.get(
    "/all",
    auth,
    authorization(roleEnum.admin),
    validator(
        paginationSchema
    ),
    async (req, res, next) => {
        try {
            const users =
                await getAllUsers(
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
    validator(
        getUserByIdSchema
    ),
    async (req, res, next) => {
        try {
            const user =
                await getUserById(
                    req.validated
                        .params.userId
                );

            if (user.phone) {
                user.phone =
                    decrypting(
                        user.phone
                    );
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

userRouter.get(
    "/",
    auth,
    async (req, res, next) => {
        try {
            const user = req.user;

            if (user.phone) {
                user.phone =
                    decrypting(
                        user.phone
                    );
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