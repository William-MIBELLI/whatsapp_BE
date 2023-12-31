import { Server } from 'socket.io'
import { resetUnreadMsg } from '../services/conversation.service.js';
export let onlineUsers = []
let io;
const CLIENT_ENDPOINT = process.env

export const getSocket =  (socket, io) => {

    //User connection
    socket.on('user-connection', userId => {
        socket.join(userId)
        onlineUsers.push({ userId, socketId: socket.id })
        io.emit('online-users', onlineUsers)
    })

    //User join conversation
    socket.on('join-conversation', conversationId => {
        socket.join(conversationId)
    })

    //Send message
    socket.on('send-message', message => {
        message.conversation.users.forEach(user => {
            if (user !== message.sender) {
                socket.to(user).emit('receive-message', message)
            }
        })
    })

    //reset unreadMsg quand un user ouvre la convo
    socket.on('reset-unreadByUsers', async (data) => {
        const { convoId, userId } = data
        await resetUnreadMsg(convoId, userId)
    } )

    //Quand un user est en train de taper
    socket.on('typing', data => {
        const { conversationId, userId} = data
        socket.to(userId).emit('typing', conversationId)
    })

    //Quand l'user ne tape plus
    socket.on('stop typing', data => {
        const { conversationId, userId} = data
        socket.to(userId).emit('stop typing', conversationId)
    })

    //Remove user from onlineUsers when SOCKET DISCONNECTION
    socket.on('disconnect', () => {
        const newOnlineUsers = onlineUsers.filter(obj => {
            return obj.socketId !== socket.id
        })
        onlineUsers = newOnlineUsers
        io.emit('online-users', onlineUsers)
    })

    //Remove user from onlineUsers when USER LOGOUT
    socket.on('user-logout', userId => {
        const newOnlineUsers = onlineUsers.filter(obj => {
            return obj.userId !== userId
        })
        onlineUsers = newOnlineUsers
        io.emit('online-users', onlineUsers)
    })

    //Quand un user lance un appel
    socket.on('callUser', data => {

        const { caller, receiverId, signalData } = data

        const user = onlineUsers.find(o => o.userId === receiverId)

        if (user) {
            return socket.to(user.userId).emit('callIncoming', caller, signalData)
        }

    })

    //on reçoit les infos de lutilisateur qui accepte l'appel ainbsi que son signal
    socket.on('acceptCall', data => {
        const { callerId, signal } = data
        
        const user = onlineUsers.find(o => o.userId === callerId)

        if (user) {
            socket.to(user.userId).emit('callAccepted', signal)    //on emit le caller en lui passant le signal du receiver
        }
    })

    //on récupère les infos de lutilisateur à notifier pour le call fini
    socket.on('endCall', (u) => {
        const user = onlineUsers.find(o => o.userId === u._id)

        if (user) {
            socket.to(user.userId).emit('callEnded')   // on lui emit simplement call ended, pas besoin de donnée
        }
    })
}

export const initIo = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            CLIENT_ENDPOINT
        }
    })
    return io
}

export const getIo = () => {
    if (!io) {
        throw new Error('IO is not initialized')
    }
    return io
}