import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";
import {
    deleteMessageByConvoId,
    deleteMessageByUserId,
} from "./message.service.js";
import { getIo } from "../socket/socketServer.js";

export const findConversation = async (sender_id, receiver_id, convoId) => {
    let convo;
    if (convoId) {
        //Si une convoId est fournie, on commence par chercher avec
        convo = await findConvoById(convoId);
    }
    if (!convo) {
        //Si pas de convoId fournie ou pas de convo trouvée avec cet Id, on recherche avec els users
        convo = await findConvoByUsers([sender_id, receiver_id]);
    }
    if (!convo) {
        //Si pas de résultat, on return false
        console.log("findconvoEnd failed");
        return false;
    }
    //Une convo a été trouvé, on la return
    return convo;
};

export const createConversation = async (sender_id, receiver_id) => {
    console.log("crteateconvo start");
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
    const populatedConvo = await convo.populate("users", "-password");
    console.log("createconvo end");
    return populatedConvo;
};

export const getUserConversations = async (userId) => {
    const convos = await Conversation.find({
        users: { $elemMatch: { $eq: userId } },
    })
        .populate("users", "-password")
        .populate({
            path: "latestMessage",
            populate: { path: "sender" },
        });

    return convos;
};

export const updateLatestMessage = async (conversationId, messageId) => {
    const convo = await Conversation.findOneAndUpdate(
        { _id: conversationId },
        { latestMessage: messageId }
    );
    if (!convo) {
        throw new Error("Failed to update latestMessage");
    }
    await convo.save();

    return convo;
};

export const findConvoById = async (convoId) => {
    const convo = await Conversation.findById(convoId)
        .populate("users", "-password")
        .populate("latestMessage");
    if (convo) {
        return convo;
    }
    return false;
};

export const findConvoByUsers = async (users) => {
    const convo = await Conversation.findOne({
        $and: [
            { users: { $elemMatch: { $eq: users[0] } } },
            { users: { $elemMatch: { $eq: users[1] } } },
        ],
        isGroup: false,
    })
        .populate("users", "-password")
        .populate("latestMessage");
    if (convo) {
        return convo;
    }
    return false;
};

export const deleteConvoByUserId = async (userId) => {
    const io = getIo();
    const convos = await Conversation.find({
        // On récupère toutes les convo de l'user
        users: { $elemMatch: { $eq: userId } },
    });

    convos.forEach(async (convo) => {
        if (convo.isGroup) {
            //Si la conversation est un group, on remove juste le user
            await RemoveUserFromGroup(convo._id, userId);
        } else {
            await Conversation.deleteOne({ _id: convo._id }); // Sinon on suprimme la conversation
            await deleteMessageByConvoId(convo._id); // On supprime avec la convoId pour supprimer TOUS les message de la convo, pas seulement celui de l'user deleted
        }
        await deleteMessageByUserId(userId);

         // On emit les users de la convo pour que le front se mette a jour
        convo.users.forEach((user) => {
            console.log("on emit a : ", user);
            io.to(convo._id.toString()).emit("user-deleted", {
                userId,
                convoId: convo._id,
            });
        });
    });
    return true;
};
