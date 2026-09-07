import { api } from './api'
import { completeTurn } from '../services/firestore'
import { deleteDoc, doc } from 'firebase/firestore'
import { db } from '../lib/firebase'

type PlayerJoinedHandler = (data: { playerId: string; players: any[] }) => void
type PlayerLeftHandler = (data: { playerId: string; players: any[] }) => void
type GameStateHandler = (data: { game: any; currentPlayerId: string | null }) => void
type ChatMessageHandler = (message: any) => void

let roomId: string | null = null
let unsubscribePlayers: (() => void) | null = null
let unsubscribeGame: (() => void) | null = null
let unsubscribeChat: (() => void) | null = null

const playerJoinedHandlers = new Set<PlayerJoinedHandler>()
const playerLeftHandlers = new Set<PlayerLeftHandler>()
const gameStateHandlers = new Set<GameStateHandler>()
const gameStateUpdatedHandlers = new Set<GameStateHandler>()
const chatMessageHandlers = new Set<ChatMessageHandler>()

export function connectSocket() {
  return {
    connected: true,
    id: 'firebase',
    emit: (event: string, data: any) => emit(event, data),
    on: (event: string, handler: any) => on(event, handler),
    off: (event: string, handler: any) => off(event, handler),
  }
}

export function disconnectSocket() {
  cleanup()
}

export function getSocket() {
  return {
    connected: true,
    id: 'firebase',
    emit: (event: string, data: any) => emit(event, data),
    on: (event: string, handler: any) => on(event, handler),
    off: (event: string, handler: any) => off(event, handler),
  }
}

export function on(event: string, handler: any) {
  if (event === 'player-joined') playerJoinedHandlers.add(handler)
  if (event === 'player-left') playerLeftHandlers.add(handler)
  if (event === 'game-state') gameStateHandlers.add(handler)
  if (event === 'game-state-updated') gameStateUpdatedHandlers.add(handler)
  if (event === 'new-chat-message') chatMessageHandlers.add(handler)

  return () => {
    playerJoinedHandlers.delete(handler)
    playerLeftHandlers.delete(handler)
    gameStateHandlers.delete(handler)
    gameStateUpdatedHandlers.delete(handler)
    chatMessageHandlers.delete(handler)
  }
}

export function off(event: string, handler: any) {
  if (event === 'player-joined') playerJoinedHandlers.delete(handler)
  if (event === 'player-left') playerLeftHandlers.delete(handler)
  if (event === 'game-state') gameStateHandlers.delete(handler)
  if (event === 'game-state-updated') gameStateUpdatedHandlers.delete(handler)
  if (event === 'new-chat-message') chatMessageHandlers.delete(handler)
}

export async function emit(event: string, data: any) {
  if (event === 'join-room' && data?.roomId) {
    roomId = data.roomId
    cleanup()
    unsubscribePlayers = api.subscribeToPlayers(data.roomId, (players) => {
      playerJoinedHandlers.forEach((h) => h({ playerId: '', players }))
    })
    unsubscribeGame = api.subscribeToGame(data.roomId, (game) => {
      if (!game) return
      const currentPlayerId = game.turnOrder[game.currentPlayerIndex] || null
      const gameStatePayload = { game, currentPlayerId }
      gameStateHandlers.forEach((h) => h(gameStatePayload))
      gameStateUpdatedHandlers.forEach((h) => h(gameStatePayload))
    })
    unsubscribeChat = api.subscribeToChat(data.roomId, (messages) => {
      const last = messages[messages.length - 1]
      if (last) {
        chatMessageHandlers.forEach((h) => h(last))
      }
    })
  }

  if (event === 'leave-room') {
    if (roomId && data?.playerId) {
      try {
        await deleteDoc(doc(db, 'rooms', roomId, 'players', data.playerId))
      } catch {
        // ignore cleanup errors
      }
    }
    cleanup()
  }

  if (event === 'chat-message' && data) {
    await api.sendChatMessage(data.roomId, {
      playerId: data.playerId,
      playerName: data.playerName,
      playerAvatarId: data.playerAvatarId,
      text: data.text,
    })
  }

  if (event === 'select-truth' || event === 'select-dare') {
    if (!roomId) return
    await api.updateGameState(roomId, { state: 'answering' })
  }

  if (event === 'complete-turn') {
    if (!roomId) return
    await completeTurn(roomId)
  }
}

function cleanup() {
  if (unsubscribePlayers) {
    unsubscribePlayers()
    unsubscribePlayers = null
  }
  if (unsubscribeGame) {
    unsubscribeGame()
    unsubscribeGame = null
  }
  if (unsubscribeChat) {
    unsubscribeChat()
    unsubscribeChat = null
  }
  roomId = null
}
