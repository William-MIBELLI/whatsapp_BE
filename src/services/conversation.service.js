import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";

export const findConversation = async (sender_id, receiver_id, convoId) => {

    //const conversationId = convoId === 'undefined' ? 'w' : convoId
    console.log('findconvo ', convoId )

    const convos = await Conversation.find({
        _id: convoId,
        $and: [
            { users: { $elemMatch: { $eq: sender_id } } },
            { users: { $elemMatch: { $eq: receiver_id } } },
        ],
    })
        .populate("users", "-password")
        .populate("latestMessage");
    console.log('on passe la recherche')
    if (!convos) {
        return false;
    }

    return convos[0];
};

export const createConversation = async (sender_id, receiver_id) => {
    const senderUser = await User.findById(sender_id);
    const receiverUser = await User.findById(receiver_id);
    if (!senderUser || !receiverUser) {
        throw new Error("error from service");
    }
    const convo = new Conversation({
        name: receiverUser.name,
        isGroup: false,
        users: [sender_id, receiver_id],
        admin: sender_id,
    });
    await convo.save();
    return await convo.populate("users", "-password");
};

export const getUserConversations = async (userId) => {
    const convos = await Conversation.find({
        users: { $elemMatch: { $eq: userId } },
    })
        .populate("users", "-password")
        .populate({
            path: 'latestMessage',
            populate: { path: 'sender'}
        });

    return convos;
};

export const updateLatestMessage = async (conversationId, messageId) => {
    const convo = await Conversation.findOneAndUpdate(
        { _id: conversationId },
        { latestMessage: messageId }
    );
    await convo.save();
    if (!convo) {
        throw new Error("Failed to update latestMessage");
    }

    return convo;
};


