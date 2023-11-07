import { searchUserOnDb, updateStatusOnDb } from "../services/user.service.js"


export const searchUser = async (req, res, next) => {

    const { keyword } = req.params
    const { userId } = req.user
    try {
        const users = await searchUserOnDb(keyword, userId)
        res.status(200).json({users})
    } catch (error) {
        next(error)
    }
}


export const updateStatus = async (req, res, next) => {

    const { userId } = req.user
    const { status } = req.body

    try {
        const newStatus = await updateStatusOnDb(userId, status)
        if (!newStatus) {
            throw new Error('cant update status')
        }
        res.status(201).json({status})
    } catch (error) {
        next(error)
    }
}