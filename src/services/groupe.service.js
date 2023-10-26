import Conversation from "../models/conversation.model.js"
import Message from "../models/message.model.js"
import { getIo } from "../socket/socketServer.js"
import { deletePicture } from "../utils/file.utils.js"


export const createGroupOnDB = async (groupName, users, admin, pictureUrl = null) => {
    const { DEFAULT_GROUP_URL } = process.env
    
    console.log('url du default pics : ', DEFAULT_GROUP_URL)
    const group = new Conversation({
        name: groupName,
        isGroup: true,
        users: [...users, admin],
        admin,
        pictureUrl:  DEFAULT_GROUP_URL
    })

    await group.save()
    return await group.populate("users", "-password")
}

export const deleteGroupOnDB = async (groupId) => {

    const group = await Conversation.findById(groupId) //On cherche la convo avec le groupId
    if (!group) {
        throw new Error('no group with this id : ', groupId)
    }
    const { users, pictureUrl } = group

    const del = deletePicture(pictureUrl) // On supprime la photo
    console.log(del)
    
    await Conversation.findByIdAndDelete(groupId) // On supprime la convo
    await Message.deleteMany({ conversation: groupId }) // Et tous les messages
    

    const io = getIo() //On emit à tous les users du groupe
    users.forEach(userId => {
        io.to(userId.toString()).emit('group deleted', groupId)
    })

}