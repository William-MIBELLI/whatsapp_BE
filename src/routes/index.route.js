import express from 'express'
import authRouter from './auth.route.js'
import conversationRouter from './conversation.route.js'
import messageRouter from './message.route.js'
import userRouter from './user.route.js'

const router = express.Router()

router.use('/auth', authRouter)

router.use('/conversation', conversationRouter)

router.use('/message', messageRouter)

router.use('/search', userRouter)

export default router