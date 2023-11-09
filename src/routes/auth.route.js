import express from 'express'
import { changePassword, forgetPassword, login, logout, register, resetPassword } from '../controllers/auth.controller.js'
import { auhtMiddleware } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/register', register)

router.post('/login', login)

router.get('/logout', logout)

router.get('/authmid',auhtMiddleware, (req, res, next) => {
    res.json(req.user)
})

router.put('/forget-password', forgetPassword)

router.put('/reset-password', resetPassword)

router.put('/change-password', auhtMiddleware, changePassword)

export default router