import { io, Socket } from 'socket.io-client'

const SOCKET_URL = typeof window !== 'undefined' ? window.location.origin : (import.meta.env.VITE_API_URL || 'http://localhost:3001')

let socket: Socket | null = null

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    })
  }
  return socket
}

export function connectSocket() {
  const s = getSocket()
  if (!s.connected) {
    s.connect()
  }
  return s
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect()
  }
}
