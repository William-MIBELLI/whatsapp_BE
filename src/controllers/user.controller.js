import { searchUserOnDb } from "../services/user.service.js"


export const searchUser = async (req, res, next) => {

    const { keyword } = req.params
    const { userId } = req.user
    console.log(keyword, userId)
    try {
        const users = await searchUserOnDb(keyword, userId)
        console.log('users dans controller : ', users)
        res.status(200).json({users})
    } catch (error) {
        next(error)
    }
}