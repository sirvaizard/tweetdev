import io from 'socket.io'

const activeConnections = new Map()

function setup (server) {
  const socketServer = io(server)

  socketServer.on('connect', (socket) => {
    const { id } = socket.handshake.query

    const oldConnection = activeConnections.get(id)

    if (oldConnection) { oldConnection.disconnect() }

    activeConnections.set(id, socket)

    console.log('connected ' + id)

    socket.on('disconnect', () => {
      console.log('disconnected ' + id)
      activeConnections.delete(id)
    })
  })
}

export { setup as socketServer, activeConnections }
