import Message from "../models/message.model.js";
import { deleteFileOnCloud } from "../utils/file.utils.js";
import { updateLatestMessage, updateUnreadMsg } from "./conversation.service.js";

export const createMessage = async (messageData) => {
    const { senderId, conversationId, content, files = [] } = messageData;
    const message = await Message.create({
        sender: senderId,
        message: content,
        conversation: conversationId,
        files: JSON.parse(files),
    });
    await message.save();

    if (!message) {
        throw new Error("Failed to create message 😢");
    }
    const r = await updateLatestMessage(conversationId, message._id);
    if (typeof(r) === Error) { //Si on a pas pu update le convo, on return une error
        throw r
    }
    const rep = await updateUnreadMsg(conversationId, senderId)
    if (!rep) {
        throw new Error('Cant update unreadmsg')
    }
    return await message.populate(["conversation", "sender"]);
};

export const getConversationMessages = async (conversationId) => {
    const messages = await Message.find({
        conversation: conversationId,
    }).populate("sender", "-password");

    if (!messages) {
        throw new Error("Failed to retrieve messages");
    }

    return messages;
};

export const deleteMessageByUserId = async (userId) => {
    
    const messages = await Message.find({
        sender: userId,
    });
    
    await deleteMessageOnDb(messages)
    
};

export const deleteMessageByConvoId = async (convoId) => {
    const messages = await Message.find({ conversation: convoId })
    
    await deleteMessageOnDb(messages)
}

export const deleteMessageOnDb = async (messages) => {

    messages.forEach(async(message) => {
        if (message.files.length > 0) { // Si le message contient des fichiers
            message.files.forEach(async (file) => { //On boucle sur chaque fichier
                await deleteFileOnCloud(file.public_id) // On delete le fichier dans cloudinary
            });
        }
        await Message.findByIdAndDelete(message._id)
    })
    
}
