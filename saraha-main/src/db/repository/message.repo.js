
import messageModel from "../model/message.model.js";
import * as base from "./base.repo.js";

const model = messageModel;

export const findMessages = async ({
    where = {},
    limit,
    skip,
    select,
    sort,
    page
}) => {
    return await base.find({
        model,
        where,
        limit,
        skip,
        select,
        sort,
        page
    });
};

export const createMessage = async ({ data }) => {
    return await base.create({
        model,
        data
    });
};

export const updateMessage = async ({ data, where }) => {
    return await base.updateOne({
        model,
        data,
        where
    });
};

export const deleteMessage = async ({ where }) => {
    return await base.deleteOne({
        model,
        where
    });
};
