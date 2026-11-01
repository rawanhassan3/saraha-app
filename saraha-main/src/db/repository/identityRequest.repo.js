
import identityRequestModel from "../model/identityRequest.model.js";

export const createIdentityRequest = async (data) =>
    identityRequestModel.create(data);

export const findIdentityRequest = async (where = {}) =>
    identityRequestModel.findOne(where);

export const findIdentityRequests = async ({
    where = {},
    page = 1,
    limit = 10
} = {}) => {
    const skip = (page - 1) * limit;

    const [data, count] = await Promise.all([
        identityRequestModel.find(where)
            .populate("messageId")
            .populate("requesterId", "firstName lastName image")
            .populate("senderId", "firstName lastName image")
            .populate("conversationId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

        identityRequestModel.countDocuments(where)
    ]);

    const totalPages = Math.ceil(count / limit);

    return {
        data,
        meta: {
            count,
            totalPages,
            currentPage: page,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        }
    };
};

export const updateIdentityRequest = async (where, update) =>
    identityRequestModel.findOneAndUpdate(where, update, {
        new: true,
        runValidators: true
    });
