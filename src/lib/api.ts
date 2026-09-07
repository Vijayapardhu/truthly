import {
  createRoom,
  getRoomByCode,
  getRoom as getRoomData,
  getAllRooms,
  joinRoom as firestoreJoinRoom,
  startGame as firestoreStartGame,
  getChatMessages,
  sendChatMessage,
  subscribeToPlayers,
  subscribeToGame,
  subscribeToChat,
  updateGameState,
  updateRoomLastActivity,
  saveGameResult,
  getGameResults,
  getRoomGameResults,
} from '../services/firestore'

export const api = {
  async createRoom(data: {
    name: string
    visibility: string
    topics: string[]
    intensity: string
    allowSkipping: boolean
    skipsPerPlayer: number
    hostName: string
    hostAvatarId: string
    hostId: string
  }) {
    const code = `${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    const result = await createRoom({
      ...data,
      roomCode: code,
      visibility: data.visibility as 'public' | 'private',
    })
    return {
      room: result.room,
      player: result.player,
    }
  },

  async getRoomByCode(code: string) {
    return getRoomByCode(code)
  },

  async resolveRoomId(identifier: string): Promise<string> {
    try {
      const room = await getRoomByCode(identifier)
      return room.id
    } catch {
      return identifier
    }
  },

  async getRoom(id: string) {
    const result = await getRoomData(id)
    return result
  },

  async getAllRooms() {
    const rooms = await getAllRooms()
    return rooms
  },

  async joinRoom(roomId: string, data: { nickname: string; avatarId: string; userId?: string }) {
    const result = await firestoreJoinRoom(roomId, data)
    return { player: result.player }
  },

  async startGame(roomId: string, playerId: string) {
    return firestoreStartGame(roomId, playerId)
  },

  async getChatMessages(roomId: string) {
    return getChatMessages(roomId)
  },

  async sendChatMessage(roomId: string, data: { playerId: string; playerName: string; playerAvatarId: string; text: string }) {
    return sendChatMessage(roomId, data)
  },

  subscribeToPlayers,
  subscribeToGame,
  subscribeToChat,
  updateGameState,
  updateRoomLastActivity,
  saveGameResult,
  getGameResults,
  getRoomGameResults,
}
