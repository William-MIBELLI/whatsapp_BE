import express from 'express'
import { auhtMiddleware } from '../middlewares/auth.middleware.js'
import { searchUser } from '../controllers/user.controller.js'

const router = express.Router()

router.get('/:keyword', auhtMiddleware, searchUser)

export default router