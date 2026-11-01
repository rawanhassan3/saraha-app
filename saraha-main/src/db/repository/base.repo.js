
import {
    BadRequestException,
    NotFoundException
} from "../../common/exceptions/index.js";

export const findOne = async ({
    model,
    where = {},
    check = false,
    select
}) => {
    if (!model) BadRequestException("model not provided");

    const data = await model.findOne(where).select(select);

    if (!data && !check) {
        NotFoundException("target document not found");
    }

    return data;
};

export const find = async ({
    model,
    where = {},
    limit,
    skip,
    sort,
    select,
    page
}) => {
    if (!model) BadRequestException("model not provided");

    const query = model.find(where);

    if (skip !== undefined) query.skip(skip);
    if (limit !== undefined) query.limit(limit);
    if (sort) query.sort(sort);
    if (select) query.select(select);

    const [data, count] = await Promise.all([
        query,
        model.countDocuments(where)
    ]);

    const totalPages = limit ? Math.ceil(count / limit) : 1;

    return {
        data,
        meta: {
            count,
            totalPages,
            currentPage: page ?? 1,
            hasNextPage: page ? page < totalPages : false,
            hasPreviousPage: page ? page > 1 : false
        }
    };
};

export const create = async ({ model, data }) => {
    if (!model) BadRequestException("model not provided");
    return await model.create(data);
};

export const updateOne = async ({ model, data, where }) => {
    if (!model) BadRequestException("model not provided");

    return await model.findOneAndUpdate(where, data, {
        new: true
    });
};

export const deleteOne = async ({ model, where }) => {
    if (!model) BadRequestException("model not provided");

    return await model.deleteOne(where);
};
