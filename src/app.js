import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import router from './routes/index.route.js'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'


dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(router)
app.use('', (req, res, next) => {

    const error = new Error('Invalid URL')
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    console.log('on est dans le middleware ERROR : ', error.message)
    res.status(error?.status || 500).json({ error: error.message })
})

export default app