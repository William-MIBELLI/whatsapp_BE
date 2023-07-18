import { sign } from '../utils/token.utils.js'

export const createToken = async (payload, expires, secret) => {
    try {
        const token = await sign(payload, expires, secret)
        console.log('token : ', token)
        return token
    } catch (error) {
        console.log('erreur creation token : ', error)
        return error
    }
}