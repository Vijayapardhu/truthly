import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import { roomStore } from './models/store.js'
import { setupSocketHandlers } from './socket/handlers.js'
import { roomRoutes } from './routes/rooms.js'
import { chatRoutes } from './routes/chat.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)

const allowedOrigins = [process.env.CORS_ORIGIN, '*'].filter(Boolean)
app.use(cors({ origin: (origin, callback) => {
  if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    callback(null, true)
  } else {
    callback(new Error('Not allowed by CORS'))
  }
}}))
app.use(express.json())

app.use('/api/rooms', roomRoutes)
app.use('/api/chat', chatRoutes)

const io = new Server(httpServer, {
  cors: { origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }},
})

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  setupSocketHandlers(socket, io, roomStore)
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

setInterval(() => {
  const now = Date.now()
  const inactiveThreshold = 5 * 60 * 1000
  roomStore.getAllRooms().forEach((room) => {
    if (now - room.lastActivity > inactiveThreshold) {
      console.log(`Cleaning up inactive room: ${room.roomCode}`)
      roomStore.deleteRoom(room.id)
    }
  })
}, 60 * 1000)
