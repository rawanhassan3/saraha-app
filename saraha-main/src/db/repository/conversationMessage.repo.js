
import conversationMessageModel from "../model/conversation.model.js";

export const createConversationMessage = async (data) =>
    conversationMessageModel.create(data);

export const findConversationMessages = async ({
    conversationId,
    page = 1,
    limit = 20
}) => {
    const where = { conversationId };
    const skip = (page - 1) * limit;

    const [data, count] = await Promise.all([
        conversationMessageModel.find(where)
            .populate("senderId", "firstName lastName image")
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit),

        conversationMessageModel.countDocuments(where)
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
