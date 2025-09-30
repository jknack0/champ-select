import type { Server as HttpServer } from 'http'
import { Server } from 'socket.io'

let io: Server | null = null

export const initRealtime = (server: HttpServer, origin: string) => {
  io = new Server(server, {
    cors: {
      origin,
      credentials: true,
    },
  })

  io.on('connection', (socket) => {
    console.log('Realtime client connected', socket.id)
    socket.on('disconnect', () => {
      console.log('Realtime client disconnected', socket.id)
    })
  })

  return io
}

const emit = (event: string, payload?: unknown) => {
  if (!io) {
    return
  }

  io.emit(event, payload)
}

export const notifyPublicRosterChanged = () => {
  emit('publicRoster:changed')
}
