
import mongoose, { Types } from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            minLength: 5,
            maxLength: 5000,
            required: function () {
                return !this.images?.length;
            }
        },
        images: {
            type: [String],
            default: []
        },
        receiverId: {
            type: Types.ObjectId,
            ref: "user",
            required: true
        },
        senderId: {
            type: Types.ObjectId,
            ref: "user",
            default: null
        }
    },
    {
        timestamps: true,
        strictQuery: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

export const messageModel = mongoose.model("message", messageSchema);
export default messageModel;
