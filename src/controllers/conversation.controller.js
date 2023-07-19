import {
    createConversation,
    findConversation,
    getUserConversations,
} from "../services/conversation.service.js";

export const createOpenConversation = async (req, res, next) => {
    try {
        const sender_id = req.user.userId;
        const { receiver_id } = req.body;
        let convo = await findConversation(sender_id, receiver_id);
        console.log('convo dans le controller : ', convo)
        if (!convo) {
            console.log(' !!!!!!!!!!!!!  pas de convo, on en crée une !!!!!!!!!!!!!!!!!!')
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
        res.json(convos)
    } catch (error) {
        next(error)
    }
}
