import { searchUserOnDb, udpateUserPicture, updateStatusOnDb, updateUserOnDb } from "../services/user.service.js"


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

export const updateUser = async (req, res, next) => {
    console.log()
    const { name, status, pictureData } = req.body
    const { userId } = req.user
    try {
        if (pictureData) { //En 1er on update la photo si celle-ci a changé
            await udpateUserPicture(userId, pictureData)
        }
        const user = await updateUserOnDb(userId, name, status) // On update ensuite le nom et le status
        if (!user) {
            throw new Error('something goes wrong')
        }
        res.status(201).json({ user })
    } catch (error) {
        next(error)
    }
}