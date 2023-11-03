import express from 'express'
import { auhtMiddleware } from '../middlewares/auth.middleware.js'
import { createGroup, deleteGroup, leaveGroup, removeUser } from '../controllers/group.controller.js'

const router = express.Router()

router.post('/createGroup', auhtMiddleware, createGroup)

router.post('/delete', auhtMiddleware, deleteGroup)

router.put('/leave', auhtMiddleware, leaveGroup)

router.delete('/remove-user', auhtMiddleware, removeUser)

export default router