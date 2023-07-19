import mongoose from "mongoose";

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
    },
    {
        timestamps: true,
    }
);

const Conversation =
    mongoose.models.Conversation ||
    mongoose.model("conversation", conversationSchema);

export default Conversation;
