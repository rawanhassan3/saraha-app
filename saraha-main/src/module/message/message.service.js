
import path from "node:path";

import { messageTypeEnum } from "../../common/enum/index.js";
import { BadRequestException } from "../../common/exceptions/index.js";

import userModel from "../../db/model/user.model.js";
import identityRequestModel from "../../db/model/identityRequest.model.js";

import * as messageRepo from "../../db/repository/message.repo.js";
import { findOne } from "../../db/repository/base.repo.js";

export const sendMessage = async (
    data,
    files = [],
    senderId = null
) => {
    const { receiverId } = data;

    const user = await findOne({
        model: userModel,
        where: { _id: receiverId },
        check: true
    });

    if (!user) {
        BadRequestException("Receiver not found");
    }

    const imagesPaths = files.map((file) => {
        const filePath = file.fullPath || file.path;

        return `uploads/${path.basename(filePath)}`;
    });

    return await messageRepo.createMessage({
        data: {
            content: data.content,
            images: imagesPaths,
            receiverId,
            senderId: senderId || null
        }
    });
};

export const getMessages = async (
    userId,
    {
        type = messageTypeEnum.all,
        page = 1,
        limit = 10
    } = {}
) => {
    page = Number(page);
    limit = Number(limit);
    type = Number(type);

    if (!Object.values(messageTypeEnum).includes(type)) {
        BadRequestException("wrong type value");
    }

    const filter = {};

    switch (type) {
        case messageTypeEnum.sender:
            filter.senderId = userId;
            break;

        case messageTypeEnum.receiver:
            filter.receiverId = userId;
            break;

        case messageTypeEnum.all:
            filter.$or = [
                { senderId: userId },
                { receiverId: userId }
            ];
            break;

        default:
            BadRequestException("wrong type value");
    }

    const result = await messageRepo.findMessages({
        where: filter,
        page,
        limit,
        skip: (page - 1) * limit,
        sort: { createdAt: -1 }
    });

    // Check which received messages have an accepted identity request.
    const receivedMessages = result.data.filter(
        (message) =>
            message.receiverId.toString() === userId.toString()
            && message.senderId
    );

    const acceptedRequests = receivedMessages.length
        ? await identityRequestModel.find({
            requesterId: userId,
            messageId: {
                $in: receivedMessages.map(
                    (message) => message._id
                )
            },
            status: "accepted"
        }).select("messageId")
        : [];

    const acceptedMessageIds = new Set(
        acceptedRequests.map(
            (request) => request.messageId.toString()
        )
    );

    // Hide senderId from receiver until identity is accepted.
    const safeData = result.data.map((message) => {
        const item = message.toObject
            ? message.toObject()
            : { ...message };

        const isReceiver =
            item.receiverId.toString() === userId.toString();

        const identityAccepted =
            acceptedMessageIds.has(item._id.toString());

        if (isReceiver && !identityAccepted) {
            delete item.senderId;
        }

        return item;
    });

    return {
        ...result,
        data: safeData
    };
};

export const deleteMessage = async (userId, id) => {
    return await messageRepo.deleteMessage({
        where: {
            _id: id,
            $or: [
                { senderId: userId },
                { receiverId: userId }
            ]
        }
    });
};
