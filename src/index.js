import app from "./app.js";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { getSocket, initIo } from "./socket/socketServer.js";

const PORT = process.env.PORT || 8000
const { DATABASE_URL } = process.env

mongoose.connection.on('error', (error) => {
    console.log('Cant reach mongoDB : ', error.message)
    process.exit(1)
})

// if(process.env.NODE_ENV !== 'production'){
//     mongoose.set('debug', true)
// }

mongoose.connect(DATABASE_URL).then(() => {
    console.log('connected to mongoDB')
})

const server = app.listen(PORT, () => {
    console.log(`server is running on ${PORT}...`)
    console.log('process ID : ', process.pid)
})

const io = initIo(server)

io.on('connection', socket => {
    console.log('🔥 socket connected : ', socket.id)
    getSocket(socket, io)
})

const exceptionHandler = (error) => {
    console.log('error : ', error)
    if(server){
        console.log('server closed')
    }
    return process.exit(1)
}

process.on("uncaughtException", exceptionHandler)
process.on("unhandledRejection", exceptionHandler)