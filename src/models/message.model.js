import mongoose from "mongoose";
import { v2 as cloudinary } from 'cloudinary'

const messageSchema = mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    message: {
        type: String,
        trim: true
    },
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'conversation',
        required: true
    },
    files:[]
}, {
    timestamps: true
});


const Message =
    mongoose.models.Message || mongoose.model("message", messageSchema);

export default Message;
