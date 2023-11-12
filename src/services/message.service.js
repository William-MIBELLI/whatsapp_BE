import Message from "../models/message.model.js";
import { updateLatestMessage } from "./conversation.service.js";
import { v2 as cloudinary } from 'cloudinary'

export const createMessage = async (messageData) => {
    const { senderId, conversationId, content, files = [] } = messageData;
    console.log("file dans messagedata : ", files);
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

    const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET } = process.env;

    cloudinary.config({ //On configure cloudinary
        cloud_name: CLOUD_NAME,
        api_key: CLOUD_API_KEY,
        api_secret: CLOUD_API_SECRET,
        secure: true,
    });
    
    messages.forEach(async(message) => {
        if (message.files.length > 0) { // Si le message contient des fichiers
            message.files.forEach(async (file) => { //On boucle sur chaque fichier
                const r = await cloudinary.uploader.destroy(file.public_id) //Avec le public_id, on call destroy()
                console.log('response de cloudinary.destroy : ', r)
            });
        }
        await Message.findByIdAndDelete(message._id)
    })
    
}
