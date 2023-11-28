import { RemoveUserFromGroup, createGroupOnDB, deleteGroupOnDB } from "../services/groupe.service.js"

export const createGroup = async (req, res, next) => {

    const { groupName, selectedUsers } = req.body
    const { userId } = req.user
    try {
        const group = await createGroupOnDB(groupName, selectedUsers, userId)
        res.status(200).json({msg: 'allgood', group})
    
    } catch (error) {
        next(error)
    }
}

export const deleteGroup = async (req, res, next) => {

    const { groupId, adminId } = req.body
    const { userId } = req.user

    try {
        //On check si la requete est bien faite par ladmin du groupe
        if (userId !== adminId) {
            throw new Error('Only the group\'s admin can delete it')
        }
        deleteGroupOnDB(groupId)
    } catch (error) {
        next(error)
    }
}

export const leaveGroup = async (req, res, next) => {

    const { groupId } = req.body
    const { userId } = req.user

    try {
        const d = await RemoveUserFromGroup(groupId, userId)
        if (d) {
            res.status(201).json({msg: 'ok'})
        }
    } catch (error) {
        next(error)
    }
}

export const removeUser = async (req, res, next) => {

    const { userIdToDelete, groupId } = req.body
    try {
        const r = await RemoveUserFromGroup(groupId, userIdToDelete)
        if (r) {
            res.status(201).json({msg: 'ok'}) 
        }
    } catch (error) {
        next(error)
    }
}