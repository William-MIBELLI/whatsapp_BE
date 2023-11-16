import Conversation from "../models/conversation.model.js"
import Message from "../models/message.model.js"
import { getIo } from "../socket/socketServer.js"
import { deleteFile } from "../utils/file.utils.js"


export const createGroupOnDB = async (groupName, users, admin, pictureUrl = null) => {
    const { DEFAULT_GROUP_URL } = process.env
    
    console.log('url du default pics : ', DEFAULT_GROUP_URL)
    const unreadByUsers = users.map(user => {
        return {userId: user, msgCount: 0}
    })
    unreadByUsers.push({userId: admin, msgCount: 0})
    const group = new Conversation({
        name: groupName,
        isGroup: true,
        users: [...users, admin],
        admin,
        pictureUrl: DEFAULT_GROUP_URL,
        unreadByUsers
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

    const del = await deleteFile(pictureUrl) // On supprime la photo
    console.log('del : ',del) 
    
    await Conversation.findByIdAndDelete(groupId) // On supprime la convo
    await Message.deleteMany({ conversation: groupId }) // Et tous les messages
    

    const io = getIo() //On emit à tous les users du groupe
    users.forEach(userId => {
        io.to(userId.toString()).emit('group deleted', groupId)
    })

}

export const RemoveUserFromGroup = async (groupId, userId) => {

    const group = await Conversation.findById(groupId) // On cherche la conversation via son Id
    const io = getIo()
    if (!group || !group.isGroup) { //Si on trouve pas ou que ce n'est pas un group
        throw new Error('No Conversation with this id or not a group')
    }
    if (userId === group.admin.toString()) { // On check si c'est l'admin du group
        throw new Error('Cant remove admin')
    }
    // On filtre les users en enlevant le userId et on save
    const updatedUsers = group.users.filter(uId => uId.toString() !== userId)
    group.users = updatedUsers
    const res = await group.save()

    io.to(userId).emit('get kicked from group', groupId) // On notifie l'user qui a été kick
    updatedUsers.forEach(u => {
        io.to(u.toString()).emit('user got kicked',{ groupId, userId}) // On notifie les autre membres du groupe
    })
    if (res === group) { //On vérifiei que la requete a bien été faite et on return
        return true
    }
    return false
}