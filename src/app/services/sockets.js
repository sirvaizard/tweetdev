import io from 'socket.io'

function setup (server) {
  const socketServer = io(server)
  let id = 0

  socketServer.on('connect', (socket) => {
    socket.myId = id++
    console.log('connected ' + socket.myId)

    socket.on('send tweet', (tweet) => {
      console.log(tweet)
      socket.emit('get tweet', 'hi and i get a tweet')
    })

    socket.on('disconnect', () => {
      console.log('disconnected ' + socket.myId)
    })
  })
}

export { setup as socketServer }
