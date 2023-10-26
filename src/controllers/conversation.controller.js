import {
    createConversation,
    findConversation,
    getUserConversations,
} from "../services/conversation.service.js";

export const createOpenConversation = async (req, res, next) => {
    try {
        const sender_id = req.user.userId;
        const { receiver_id, convoId } = req.body;
        console.log(req.body)
        let convo = await findConversation(sender_id, receiver_id, convoId);
        if (!convo) {
            convo = await createConversation(sender_id, receiver_id);
        }
        res.json({ convo });
    } catch (error) {
        next(error);
    }
};

export const getConversations = async (req, res, next) => {
    const userId = req.user.userId
    try {
        const convos = await getUserConversations(userId)
        res.status(200).json(convos)
    } catch (error) {
        next(error)
    }
}

