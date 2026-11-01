
import mongoose from "mongoose";
import * as conversationRepo from "../../db/repository/conversation.repo.js";
import * as conversationMessageRepo from "../../db/repository/conversationMessage.repo.js";

import {
    BadRequestException,
    ForbiddenException,
    NotFoundException
} from "../../common/exceptions/index.js";

const getAuthorizedConversation = async (
    userId,
    conversationId
) => {
    if (!mongoose.isValidObjectId(conversationId)) {
        BadRequestException("Invalid conversation ID");
    }

    const conversation = await conversationRepo.findConversation({
        _id: conversationId
    });

    if (!conversation) {
        NotFoundException("Conversation not found");
    }

    const isParticipant = conversation.participants.some(
        (participantId) =>
            participantId.toString() === userId.toString()
    );

    if (!isParticipant) {
        ForbiddenException(
            "You are not allowed to access this conversation"
        );
    }

    return conversation;
};

export const getMyConversations = async (userId) => {
    return conversationRepo.findConversations({
        participants: userId
    });
};

export const sendConversationMessage = async (
    userId,
    conversationId,
    content
) => {
    await getAuthorizedConversation(userId, conversationId);

    return conversationMessageRepo.createConversationMessage({
        conversationId,
        senderId: userId,
        content
    });
};

export const getConversationMessages = async (
    userId,
    conversationId,
    { page = 1, limit = 20 } = {}
) => {
    await getAuthorizedConversation(userId, conversationId);

    page = Number(page);
    limit = Number(limit);

    return conversationMessageRepo.findConversationMessages({
        conversationId,
        page,
        limit
    });
};
