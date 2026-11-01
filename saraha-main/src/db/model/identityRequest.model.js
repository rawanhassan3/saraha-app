
import mongoose, { Types } from "mongoose";

const identityRequestSchema = new mongoose.Schema({
    messageId: {
        type: Types.ObjectId,
        ref: "message",
        required: true
    },
    requesterId: {
        type: Types.ObjectId,
        ref: "user",
        required: true
    },
    senderId: {
        type: Types.ObjectId,
        ref: "user",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
        required: true
    },
    conversationId: {
        type: Types.ObjectId,
        ref: "conversation",
        default: null
    }
}, {
    timestamps: true
});

identityRequestSchema.index(
    { messageId: 1, requesterId: 1 },
    { unique: true }
);

const identityRequestModel = mongoose.model(
    "identityRequest",
    identityRequestSchema
);

export default identityRequestModel;
export { identityRequestModel };
