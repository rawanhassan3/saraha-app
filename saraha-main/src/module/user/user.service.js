import userModel from "../../db/model/user.model.js";

import {
    findOne
} from "../../db/repository/base.repo.js";

import * as exceptions
    from "../../common/exceptions/index.js";

import {
    myHash,
    myCompare
} from "../../common/utils/security.js";

import {
    encrypting
} from "../../common/utils/encrypting.js";

export const createUser = async (data) => {
    const exists = await findOne({
        model: userModel,
        where: {
            email: data.email
        }
    });

    if (exists) {
        exceptions.ConflictException(
            "This user already exists"
        );
    }

    const user = await userModel.create({
        ...data,

        password: await myHash(
            data.password
        ),

        phone: data.phone
            ? encrypting(data.phone)
            : undefined,

        DOB: data.DOB
            ? new Date(data.DOB)
            : undefined,

        confirmEmail: new Date()
    });

    return user;
};

export const login = async (data) => {
    const {
        email,
        password
    } = data;

    const user = await findOne({
        model: userModel,
        where: {
            email
        }
    });

    if (
        !user ||
        !user.password ||
        !(await myCompare(
            password,
            user.password
        ))
    ) {
        exceptions.NotFoundException(
            "user not found"
        );
    }

    return user;
};

export const getUserById = async (
    userId
) => {
    const user = await findOne({
        model: userModel,
        where: {
            _id: userId
        }
    });

    if (!user) {
        exceptions.NotFoundException(
            "user not found"
        );
    }

    return user;
};

export const getAllUsers = async ({
    page = 1,
    limit = 10
} = {}) => {
    const skip =
        (page - 1) * limit;

    const [
        users,
        total
    ] = await Promise.all([
        userModel
            .find({})
            .skip(skip)
            .limit(limit),

        userModel.countDocuments({})
    ]);

    return {
        users,

        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(
                total / limit
            )
        }
    };
};