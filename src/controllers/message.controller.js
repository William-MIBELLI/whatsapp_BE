import { createMessage, getConversationMessages } from "../services/message.service.js"

export const sendMessage = async (req, res, next) => {
    try {
        const senderId = req.user.userId
        const { conversationId, content, files } = req.body
        const message = await createMessage({ senderId, conversationId, content, files })
        res.status(201).json({message})
    } catch (error) {
        next(error)
    }
}


export const getMessages = async (req, res, next) => {
    try {
        const { convo_id } = req.params
        if (!convo_id) {
            throw new Error('Conversation Id required')
        }
        const messages = await getConversationMessages(convo_id)

        res.status(200).json({messages})
    } catch (error) {
        next(error)
    }
}