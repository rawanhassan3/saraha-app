
import mongoose from "mongoose";
import messageModel from "../../db/model/message.model.js";
import identityRequestModel from "../../db/model/identityRequest.model.js";
import conversationModel from "../../db/model/conversation.model.js";
import * as requestRepo from "../../db/repository/identityRequest.repo.js";
import * as conversationRepo from "../../db/repository/conversation.repo.js";
import {
    BadRequestException,
    ForbiddenException,
    NotFoundException,
    ConflictException
} from "../../common/exceptions/index.js";

export const createRequest = async (requesterId, messageId) => {
    if (!mongoose.isValidObjectId(messageId)) {
        BadRequestException("Invalid message ID");
    }

    const message = await messageModel.findById(messageId);
    if (!message) NotFoundException("Message not found");

    if (message.receiverId.toString() !== requesterId.toString()) {
        ForbiddenException("Only the message receiver can request sender identity");
    }

    if (!message.senderId) {
        BadRequestException(
            "Identity request is unavailable for messages sent without an authenticated sender"
        );
    }

    if (message.senderId.toString() === requesterId.toString()) {
        BadRequestException("You cannot request your own identity");
    }

    const existing = await requestRepo.findIdentityRequest({
        messageId,
        requesterId
    });

    if (existing) {
        ConflictException("An identity request already exists for this message");
    }

    const request = await requestRepo.createIdentityRequest({
        messageId,
        requesterId,
        senderId: message.senderId,
        status: "pending"
    });

    // Hide the sender's ID while the request is pending.
    return {
        _id: request._id,
        messageId: request.messageId,
        requesterId: request.requesterId,
        status: request.status,
        createdAt: request.createdAt
    };
};

// The receiver checks their own requests.
// Sender identity is returned only after acceptance.
export const getSentRequests = async (
    requesterId,
    { page = 1, limit = 10 } = {}
) => {
    page = Number(page);
    limit = Number(limit);
    const skip = (page - 1) * limit;

    const [requests, count] = await Promise.all([
        identityRequestModel.find({ requesterId })
            .populate("messageId", "content images receiverId createdAt")
            .populate("conversationId")
            .populate("senderId", "firstName lastName image")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

        identityRequestModel.countDocuments({ requesterId })
    ]);

    const data = requests.map((request) => {
        const item = {
            _id: request._id,
            messageId: request.messageId,
            status: request.status,
            conversationId: request.conversationId,
            createdAt: request.createdAt
        };

        if (request.status === "accepted") {
            item.sender = request.senderId;
        }

        return item;
    });

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

// Original sender sees requests received for their messages.
export const getReceivedRequests = async (
    senderId,
    { page = 1, limit = 10 } = {}
) => {
    page = Number(page);
    limit = Number(limit);

    return requestRepo.findIdentityRequests({
        where: { senderId },
        page,
        limit
    });
};

export const respondToRequest = async (
    senderId,
    requestId,
    decision
) => {
    if (!mongoose.isValidObjectId(requestId)) {
        BadRequestException("Invalid request ID");
    }

    if (!["accepted", "rejected"].includes(decision)) {
        BadRequestException("Decision must be accepted or rejected");
    }

    const request = await identityRequestModel.findOne({
        _id: requestId,
        senderId
    });

    if (!request) NotFoundException("Identity request not found");

    if (request.status !== "pending") {
        ConflictException("This request has already been processed");
    }

    if (decision === "rejected") {
        return requestRepo.updateIdentityRequest(
            { _id: requestId, senderId, status: "pending" },
            { $set: { status: "rejected" } }
        );
    }

    // Create conversation only after acceptance.
    let conversation = await conversationRepo.findConversation({
        originalMessageId: request.messageId
    });

    if (!conversation) {
        try {
            conversation = await conversationRepo.createConversation({
                originalMessageId: request.messageId,
                identityRequestId: request._id,
                participants: [
                    request.senderId,
                    request.requesterId
                ]
            });
        } catch (error) {
            if (error?.code !== 11000) throw error;

            conversation = await conversationRepo.findConversation({
                originalMessageId: request.messageId
            });
        }
    }

    const updated = await requestRepo.updateIdentityRequest(
        { _id: requestId, senderId, status: "pending" },
        {
            $set: {
                status: "accepted",
                conversationId: conversation?._id
            }
        }
    );

    if (!updated) {
        const latest = await requestRepo.findIdentityRequest({
            _id: requestId
        });

        if (latest?.status !== "accepted") {
            if (conversation) {
                await conversationModel.deleteOne({
                    _id: conversation._id,
                    identityRequestId: requestId
                });
            }

            ConflictException("This request has already been processed");
        }

        return latest;
    }

    return updated;
};
