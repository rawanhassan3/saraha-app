
import mongoose, { Types } from "mongoose";

const conversationMessageSchema = new mongoose.Schema({
    conversationId: {
        type: Types.ObjectId,
        ref: "conversation",
        required: true,
        index: true
    },
    senderId: {
        type: Types.ObjectId,
        ref: "user",
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        minLength: 1,
        maxLength: 5000
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const conversationMessageModel = mongoose.model(
    "conversationMessage",
    conversationMessageSchema
);

export default conversationMessageModel;
export { conversationMessageModel };
