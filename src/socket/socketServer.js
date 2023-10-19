let onlineUsers = []

export default function (socket, io) {

    //User connection
    socket.on('user-connection', userId => {
        socket.join(userId)
        onlineUsers.push({ userId, socketId: socket.id })
        io.emit('online-users', onlineUsers)
    })

    //User join conversation
    socket.on('join-conversation', conversationId => {
        console.log('user join : ', conversationId)
        socket.join(conversationId)
    })

    //Send message
    socket.on('send-message', message => {
        message.conversation.users.forEach(user => {
            if (user !== message.sender) {
                console.log('on emit user : ', user)
                socket.to(user).emit('receive-message', message)
            }
        })
    })

    socket.on('typing', conversationId => {
        console.log('typing OK : ', conversationId)
        socket.to(conversationId).emit('typing', conversationId)
    })

    socket.on('stop typing', conversationId => {
        console.log('stop typing : ', conversationId)
        socket.to(conversationId).emit('stop typing', conversationId)
    })

    //Remove user from onlineUsers when disconnection
    socket.on('disconnect', () => {
        const newOnlineUsers = onlineUsers.filter(obj => {
            return obj.socketId !== socket.id
        })
        onlineUsers = newOnlineUsers
        io.emit('online-users', onlineUsers)
    })
}