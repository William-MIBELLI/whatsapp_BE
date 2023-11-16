import mongoose, { mongo } from "mongoose";
import Message from "./message.model.js";

const conversationSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        isGroup: {
            type: Boolean,
            required: true,
            default: false,
        },
        users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
            },
        ],
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
        },
        latestMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "message",
        },
        pictureUrl: {
            type: String,
            required: false,
        },
        unreadByUsers: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'user'
                },
                msgCount: {
                    type: Number
                }
            }
        ]
    },
    {
        timestamps: true,
    }
);

const Conversation =
    mongoose.models.Conversation ||
    mongoose.model("conversation", conversationSchema);

export default Conversation;
