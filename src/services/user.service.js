import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

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
    console.log("user : ", user);
    return user;
};

export const udpateUserPicture = async (userId, pictureData) => {
    const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET } = process.env;
    const user = await User.findById(userId);

    const { secure_url, public_id } = JSON.parse(pictureData); //On récupère les infos reçues depuis le front
    console.log(secure_url, public_id);

    if (!user) {
        //Si pas duser avec cet id on return
        throw new Error("No user with this id");
    }
    cloudinary.config({
        cloud_name: CLOUD_NAME,
        api_key: CLOUD_API_KEY,
        api_secret: CLOUD_API_SECRET,
        secure: true,
    });
    const pictureIdToDelete = user.pictureId;
    if (pictureIdToDelete) {
        //On delete lancienne picture sur le cloud via son public_id
        await cloudinary.uploader.destroy(pictureIdToDelete);
    }
    user.pictureUrl = secure_url;
    user.pictureId = public_id;
    const r = await user.save(); //On met ensuite les nouvelles datas dans user et on save
    if (r === user) {
        console.log("picture update successfull");
        return true;
    }
    console.log("picture update failed");
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
