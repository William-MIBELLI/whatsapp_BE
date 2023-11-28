import User from "../models/user.model.js";
import { deleteFileOnCloud } from "../utils/file.utils.js";

export const searchUserOnDb = async (keyword, userId) => {
    const users = await User.find({
        $or: [
            { name: { $regex: keyword, $options: "i" } },
            { email: { $regex: keyword, $options: "i" } },
        ],
    });

    if (!users) {
        throw new Error("failed to search users");
    }

    return users.filter((user) => user._id.toString() !== userId.toString());
};

export const updateStatusOnDb = async (userId, status) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("no user with this id");
    }
    user.status = status;
    await user.save();
    return user;
};

export const udpateUserPicture = async (userId, pictureData) => {

    const user = await User.findById(userId);

    const { secure_url, public_id } = JSON.parse(pictureData); //On récupère les infos reçues depuis le front

    if (!user) {
        //Si pas duser avec cet id on return
        throw new Error("No user with this id");
    }
    const pictureIdToDelete = user.pictureId;
    if (pictureIdToDelete) {
        //On delete lancienne picture sur le cloud via son public_id
        await deleteFileOnCloud(pictureIdToDelete)
    }
    user.pictureUrl = secure_url;
    user.pictureId = public_id;
    const r = await user.save(); //On met ensuite les nouvelles datas dans user et on save
    if (r === user) {
        return true;
    }
    return false;
};

export const updateUserOnDb = async (userId, name, status) => {

    const user = await User.findById(userId)

    if (!user) { //Si pas duser on return
        throw new Error('No user with this id')
    }
    user.name = name
    user.status = status
    const r = await user.save() //On met a jour et on save
    if (r === user) {
        return user
    }
    return false
}
