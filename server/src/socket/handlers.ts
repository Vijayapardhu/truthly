import { Server, Socket } from 'socket.io'
import { roomStore } from '../models/store.js'
import { generateId } from '../utils/helpers.js'

export function setupSocketHandlers(socket: Socket, io: Server, store: typeof roomStore) {
  socket.on('join-room', (data: { roomId: string; playerId: string }) => {
    try {
      const { roomId, playerId } = data
      socket.join(roomId)

      const room = store.getRoom(roomId)
      if (!room) {
        socket.emit('error', { message: 'Room not found' })
        return
      }

      const players = store.getPlayers(roomId)
      const game = store.getGame(roomId)

      io.to(roomId).emit('player-joined', { playerId, players })

      if (game) {
        socket.emit('game-state', {
          game: {
            id: game.id,
            turnOrder: game.turnOrder,
            currentPlayerIndex: game.currentPlayerIndex,
            state: game.state,
            usedQuestionIds: game.usedQuestionIds,
          },
          currentPlayerId: game.turnOrder[game.currentPlayerIndex] || null,
        })
      }
    } catch (error) {
      console.error('Error joining room:', error)
      socket.emit('error', { message: 'Failed to join room' })
    }
  })

  socket.on('leave-room', (data: { roomId: string; playerId: string }) => {
    try {
      const { roomId, playerId } = data
      socket.leave(roomId)

      store.removePlayer(roomId, playerId)

      const players = store.getPlayers(roomId)
      io.to(roomId).emit('player-left', { playerId, players })

      if (players.length === 0) {
        store.deleteRoom(roomId)
      }
    } catch (error) {
      console.error('Error leaving room:', error)
    }
  })

  socket.on('chat-message', (data: { roomId: string; playerId: string; playerName: string; playerAvatarId: string; text: string }) => {
    try {
      const message = {
        id: generateId(),
        roomId: data.roomId,
        playerId: data.playerId,
        playerName: data.playerName,
        playerAvatarId: data.playerAvatarId,
        text: data.text,
        reactions: {},
        createdAt: Date.now(),
      }

      store.addChatMessage(data.roomId, message)
      io.to(data.roomId).emit('new-chat-message', message)
    } catch (error) {
      console.error('Error sending chat message:', error)
    }
  })

  socket.on('select-truth', (data: { roomId: string; playerId: string }) => {
    try {
      const game = store.getGame(data.roomId)
      if (!game) return

      const updatedGame = store.updateGame(data.roomId, {
        state: 'answering',
      })

      if (updatedGame) {
        io.to(data.roomId).emit('game-state-updated', {
          game: {
            id: updatedGame.id,
            turnOrder: updatedGame.turnOrder,
            currentPlayerIndex: updatedGame.currentPlayerIndex,
            state: updatedGame.state,
            usedQuestionIds: updatedGame.usedQuestionIds,
          },
          currentPlayerId: data.playerId,
        })
      }
    } catch (error) {
      console.error('Error selecting truth:', error)
    }
  })

  socket.on('select-dare', (data: { roomId: string; playerId: string }) => {
    try {
      const game = store.getGame(data.roomId)
      if (!game) return

      const updatedGame = store.updateGame(data.roomId, {
        state: 'answering',
      })

      if (updatedGame) {
        io.to(data.roomId).emit('game-state-updated', {
          game: {
            id: updatedGame.id,
            turnOrder: updatedGame.turnOrder,
            currentPlayerIndex: updatedGame.currentPlayerIndex,
            state: updatedGame.state,
            usedQuestionIds: updatedGame.usedQuestionIds,
          },
          currentPlayerId: data.playerId,
        })
      }
    } catch (error) {
      console.error('Error selecting dare:', error)
    }
  })

  socket.on('complete-turn', (data: { roomId: string; playerId: string }) => {
    try {
      const game = store.getGame(data.roomId)
      if (!game || game.turnOrder.length === 0) return

      const nextIndex = (game.currentPlayerIndex + 1) % game.turnOrder.length
      const updatedGame = store.updateGame(data.roomId, {
        currentPlayerIndex: nextIndex,
        state: 'choice',
      })

      if (updatedGame) {
        io.to(data.roomId).emit('game-state-updated', {
          game: {
            id: updatedGame.id,
            turnOrder: updatedGame.turnOrder,
            currentPlayerIndex: updatedGame.currentPlayerIndex,
            state: updatedGame.state,
            usedQuestionIds: updatedGame.usedQuestionIds,
          },
          currentPlayerId: updatedGame.turnOrder[updatedGame.currentPlayerIndex] || null,
        })
      }
    } catch (error) {
      console.error('Error completing turn:', error)
    }
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
}
