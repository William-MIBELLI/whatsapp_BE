import express from 'express'
import { auhtMiddleware } from '../middlewares/auth.middleware.js'
import { searchUser, updateStatus } from '../controllers/user.controller.js'

const router = express.Router()

router.get('/:keyword', auhtMiddleware, searchUser)

router.put('/update-status', auhtMiddleware, updateStatus)

export default router