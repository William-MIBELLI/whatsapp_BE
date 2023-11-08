import express from 'express'
import { forgetPassword, login, logout, register } from '../controllers/auth.controller.js'
import { auhtMiddleware } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/register', register)

router.post('/login', login)

router.get('/logout', logout)

router.get('/authmid',auhtMiddleware, (req, res, next) => {
    res.json(req.user)
})

router.put('/forget-password', forgetPassword)

export default router