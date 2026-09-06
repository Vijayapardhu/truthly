import { Router } from 'express'
import { roomStore } from '../models/store.js'
import { generateId, generateRoomCode } from '../utils/helpers.js'

export const roomRoutes = Router()

roomRoutes.post('/create', (req, res) => {
  try {
    const { name, visibility, topics, intensity, allowSkipping, skipsPerPlayer, hostName, hostAvatarId } = req.body

    if (!name || !topics || !intensity || !hostName || !hostAvatarId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const roomCode = generateRoomCode()
    const room = roomStore.createRoom({
      name,
      visibility: visibility || 'public',
      roomCode,
      hostId: 'temp-host',
      topics,
      intensity,
      allowSkipping: allowSkipping ?? true,
      skipsPerPlayer: skipsPerPlayer || 3,
    })

    const hostPlayer = {
      id: 'temp-host',
      nickname: hostName,
      avatarId: hostAvatarId,
      isHost: true,
      skipCount: skipsPerPlayer || 3,
      joinedAt: Date.now(),
    }

    roomStore.addPlayer(room.id, hostPlayer)

    res.status(201).json({
      room: {
        id: room.id,
        name: room.name,
        visibility: room.visibility,
        roomCode: room.roomCode,
        topics: room.topics,
        intensity: room.intensity,
        allowSkipping: room.allowSkipping,
        skipsPerPlayer: room.skipsPerPlayer,
        status: room.status,
      },
      player: hostPlayer,
    })
  } catch (error) {
    console.error('Error creating room:', error)
    res.status(500).json({ error: 'Failed to create room' })
  }
})

roomRoutes.get('/:roomId', (req, res) => {
  try {
    const room = roomStore.getRoom(req.params.roomId)
    if (!room) {
      return res.status(404).json({ error: 'Room not found' })
    }
    const players = roomStore.getPlayers(room.id)
    const game = roomStore.getGame(room.id)

    res.json({
      room: {
        id: room.id,
        name: room.name,
        visibility: room.visibility,
        roomCode: room.roomCode,
        topics: room.topics,
        intensity: room.intensity,
        allowSkipping: room.allowSkipping,
        skipsPerPlayer: room.skipsPerPlayer,
        status: room.status,
      },
      players,
      game: game ? {
        id: game.id,
        turnOrder: game.turnOrder,
        currentPlayerIndex: game.currentPlayerIndex,
        state: game.state,
        usedQuestionIds: game.usedQuestionIds,
      } : null,
    })
  } catch (error) {
    console.error('Error fetching room:', error)
    res.status(500).json({ error: 'Failed to fetch room' })
  }
})

roomRoutes.get('/code/:roomCode', (req, res) => {
  try {
    const room = roomStore.getRoomByCode(req.params.roomCode)
    if (!room) {
      return res.status(404).json({ error: 'Room not found' })
    }
    res.json({
      id: room.id,
      name: room.name,
      roomCode: room.roomCode,
      status: room.status,
    })
  } catch (error) {
    console.error('Error fetching room by code:', error)
    res.status(500).json({ error: 'Failed to fetch room' })
  }
})

roomRoutes.post('/:roomId/join', (req, res) => {
  try {
    const room = roomStore.getRoom(req.params.roomId)
    if (!room) {
      return res.status(404).json({ error: 'Room not found' })
    }

    const { nickname, avatarId } = req.body
    if (!nickname) {
      return res.status(400).json({ error: 'Nickname is required' })
    }

    const players = roomStore.getPlayers(room.id)
    const existingPlayer = players.find((p: { id: string; nickname: string }) => p.nickname.toLowerCase() === nickname.toLowerCase())
    if (existingPlayer) {
      return res.status(409).json({ error: 'Nickname already taken in this room' })
    }

    const playerId = generateId()
    const player = {
      id: playerId,
      nickname,
      avatarId: avatarId || 'Cat',
      isHost: false,
      skipCount: room.skipsPerPlayer,
      joinedAt: Date.now(),
    }

    roomStore.addPlayer(room.id, player)

    if (room.status === 'lobby') {
      const game = roomStore.getGame(room.id)
      if (game && !game.turnOrder.includes(playerId)) {
        game.turnOrder.push(playerId)
        roomStore.updateGame(room.id, game)
      }
    }

    res.status(201).json({ player })
  } catch (error) {
    console.error('Error joining room:', error)
    res.status(500).json({ error: 'Failed to join room' })
  }
})

roomRoutes.post('/:roomId/start', (req, res) => {
  try {
    const room = roomStore.getRoom(req.params.roomId)
    if (!room) {
      return res.status(404).json({ error: 'Room not found' })
    }

    const { playerId } = req.body
    const players = roomStore.getPlayers(room.id)
    const player = players.find((p: { id: string; isHost: boolean }) => p.id === playerId)

    if (!player || !player.isHost) {
      return res.status(403).json({ error: 'Only host can start the game' })
    }

    const game = roomStore.getGame(room.id)
    if (!game || game.turnOrder.length === 0) {
      return res.status(400).json({ error: 'No players in game' })
    }

    const updatedGame = roomStore.updateGame(room.id, {
      state: 'choice',
      currentPlayerIndex: 0,
    })

    roomStore.updateRoom(room.id, { status: 'playing' })

    res.json({
      game: updatedGame ? {
        id: updatedGame.id,
        turnOrder: updatedGame.turnOrder,
        currentPlayerIndex: updatedGame.currentPlayerIndex,
        state: updatedGame.state,
      } : null,
    })
  } catch (error) {
    console.error('Error starting game:', error)
    res.status(500).json({ error: 'Failed to start game' })
  }
})
