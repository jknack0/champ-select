import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'
import { API_BASE_URL } from './api'

let socket: Socket | null = null

export const getRealtimeSocket = () => {
  if (!socket) {
    socket = io(API_BASE_URL, {
      transports: ['websocket'],
      withCredentials: true,
    })
  }

  return socket
}
