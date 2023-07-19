import Message from "../models/message.model.js"
import { updateLatestMessage } from "./conversation.service.js"

export const createMessage = async (messageData) => {
    const { senderId, conversationId, content } = messageData
    const message = await Message.create({sender: senderId, message: content, conversation: conversationId})
    await message.save()

    if (!message) {
        throw new Error('Failed to create message 😢')
    }
    updateLatestMessage(conversationId, message._id)
    return message
}

export const getConversationMessages = async (conversationId) => {
    const messages = await Message.find({ conversation: conversationId })
    
    if(!messages){
        throw new Error('Failed to retrieve messages')
    }

    return messages
}