import { Router } from 'express'
import { roomStore } from '../models/store.js'

export const chatRoutes = Router()

chatRoutes.get('/:roomId', (req, res) => {
  try {
    const messages = roomStore.getChatMessages(req.params.roomId)
    res.json(messages)
  } catch (error) {
    console.error('Error fetching chat:', error)
    res.status(500).json({ error: 'Failed to fetch chat messages' })
  }
})

chatRoutes.post('/:roomId', (req, res) => {
  try {
    const { playerId, playerName, playerAvatarId, text } = req.body
    if (!playerId || !playerName || !text) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const message = {
      id: Math.random().toString(36).substring(2, 15),
      roomId: req.params.roomId,
      playerId,
      playerName,
      playerAvatarId: playerAvatarId || 'Cat',
      text,
      reactions: {},
      createdAt: Date.now(),
    }

    roomStore.addChatMessage(req.params.roomId, message)
    res.status(201).json(message)
  } catch (error) {
    console.error('Error creating chat message:', error)
    res.status(500).json({ error: 'Failed to create chat message' })
  }
})
