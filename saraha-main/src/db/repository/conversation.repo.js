
import conversationModel from "../model/conversation.model.js";

export const createConversation = async (data) =>
    conversationModel.create(data);

export const findConversation = async (where = {}) =>
    conversationModel.findOne(where);

export const findConversations = async (where = {}) =>
    conversationModel.find(where)
        .populate("originalMessageId")
        .populate("participants", "firstName lastName image")
        .sort({ updatedAt: -1 });
