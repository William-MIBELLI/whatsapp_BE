import express from 'express'
import { auhtMiddleware } from '../middlewares/auth.middleware.js'
import { getMessages, sendMessage } from '../controllers/message.controller.js'

const router = express.Router()

router.post('/', auhtMiddleware, sendMessage)

router.get('/:convo_id', auhtMiddleware, getMessages)

export default router