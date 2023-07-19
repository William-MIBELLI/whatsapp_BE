import express from 'express'
import { auhtMiddleware } from '../middlewares/auth.middleware.js'
import { createOpenConversation, getConversations } from '../controllers/conversation.controller.js'

const router = express.Router()

router.post('/', auhtMiddleware, createOpenConversation)

router.get('/getConversation', auhtMiddleware, getConversations)

export default router