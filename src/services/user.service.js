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

export const updateStatusOnDb = async (userId, status) => {
    
    const user = await User.findById(userId)
    if (!user) {
        throw new Error('no user with this id')
    }
    user.status = status
    await user.save()
    console.log('user : ', user)
    return user
}