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

    //Quand un user est en train de taper
    socket.on('typing', conversationId => {
        console.log('typing OK : ', conversationId)
        socket.to(conversationId).emit('typing', conversationId)
    })

    //Quand l'user ne tape plus
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
        console.log('DISCONNECT USER')
        io.emit('online-users', onlineUsers)
    })

    //Quand un user lance un appel
    socket.on('start call', data => {

        const { caller, receiver, signalData } = data

        const user = onlineUsers.find(o => o.userId === receiver._id)

        if (user) {
            console.log('user trouvé ', user, receiver)
            return socket.to(user.userId).emit('call incoming', caller, signalData)
        }

        console.log('utilisateur introuvable')
    })


    //on reçoit les infos de lutilisateur qui accepte l'appel ainbsi que son signal
    socket.on('accept call', data => {
        const { caller, signal } = data
        
        const user = onlineUsers.find(o => o.userId === caller._id)

        if (user) {
            socket.to(user.userId).emit('call accepted', signal)    //on emit le caller en lui passant le signal du receiver
        }
    })

    //on récupère les infos de lutilisateur à notifier pour le call fini
    socket.on('end call', (u) => {

        const user = onlineUsers.find(o => o.userId === u._id)

        if (user) {
            socket.to(user.userId).emit('call ended')   // on lui emit simplement call ended, pas besoin de donnée
        }
    })
}