import express from 'express'
import { auhtMiddleware } from '../middlewares/auth.middleware.js'
import { createGroup, deleteGroup } from '../controllers/group.controller.js'

const router = express.Router()

router.post('/createGroup', auhtMiddleware, createGroup)

router.post('/delete', auhtMiddleware, deleteGroup)

export default router