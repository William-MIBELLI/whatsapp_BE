import jwt from 'jsonwebtoken'

export const auhtMiddleware = async (req, res, next) => {
    try {
        if(!req.headers.authorization){
            throw new Error('No authorization header')
        }
        const token = req.headers.authorization.split(' ')[1]
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            if (err) {
                const error = new Error(err)
                error.status = 401
                throw error
            }
            req.user = payload
        })
        next()
    } catch (error) {
        next(error)
    }
}