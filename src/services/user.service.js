import User from "../models/user.model.js"


export const searchUserOnDb = async (keyword, userId) => {
    const users = await User.find(
        {$or: [
            { name: { $regex: keyword, $options: 'i' } },
            { email: { $regex: keyword, $options: 'i' }}
        ]}
    )

    if (!users) {
        throw new Error('failed to search users')
    }
    
    return users.filter(user => user._id.toString() !== userId.toString())
}