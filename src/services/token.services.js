import { sign } from '../utils/token.utils.js'

export const createToken = async (payload, expires, secret) => {
    try {
        const token = await sign(payload, expires, secret)
        return token
    } catch (error) {
        return error
    }
}