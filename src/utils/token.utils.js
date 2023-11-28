import jwt from 'jsonwebtoken'

export const sign = async (payload, expires, secret) => {
    try {
        const token = await jwt.sign(payload, secret, { expiresIn: expires})
        return token
    } catch (error) {
        return null
    }
}

export const verifyResfreshToken =  (token) => {
    const { REFRESH_TOKEN_SECRET } = process.env
    const check =  jwt.verify(token, REFRESH_TOKEN_SECRET)
    return check
}