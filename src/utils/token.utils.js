import jwt from 'jsonwebtoken'

export const sign = async (payload, expires, secret) => {
    try {
        const token = await jwt.sign(payload, secret, { expiresIn: expires})
        return token
    } catch (error) {
        console.log(error)
        return null
    }
}