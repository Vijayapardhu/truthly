import { v4 as uuidv4 } from 'uuid'
import type { Room, Player, Game, Question, ChatMessage, Intensity, Visibility, TurnState, QuestionType } from '../types/index.js'

export interface RoomModel extends Room {
  createdAt: number
  lastActivity: number
}

export interface PlayerModel extends Player {
  joinedAt: number
}

export interface GameModel extends Game {
  createdAt: number
}

export interface QuestionModel extends Question {
  createdAt: number
}

export interface ChatMessageModel extends ChatMessage {
  createdAt: number
}

export class RoomStore {
  private rooms: Map<string, RoomModel> = new Map()
  private players: Map<string, PlayerModel[]> = new Map()
  private games: Map<string, GameModel> = new Map()
  private questions: Map<string, QuestionModel[]> = new Map()
  private chatMessages: Map<string, ChatMessageModel[]> = new Map()

  createRoom(data: {
    name: string
    visibility: Visibility
    roomCode: string
    hostId: string
    topics: string[]
    intensity: Intensity
    allowSkipping: boolean
    skipsPerPlayer: number
  }): RoomModel {
    const room: RoomModel = {
      id: uuidv4(),
      name: data.name,
      visibility: data.visibility,
      roomCode: data.roomCode,
      hostId: data.hostId,
      topics: data.topics,
      intensity: data.intensity,
      allowSkipping: data.allowSkipping,
      skipsPerPlayer: data.skipsPerPlayer,
      status: 'lobby',
      createdAt: Date.now(),
      lastActivity: Date.now(),
    }
    this.rooms.set(room.id, room)
    this.players.set(room.id, [])
    this.games.set(room.id, {
      id: uuidv4(),
      roomId: room.id,
      turnOrder: [],
      currentPlayerIndex: 0,
      state: 'idle',
      usedQuestionIds: [],
      createdAt: Date.now(),
    })
    this.questions.set(room.id, [])
    this.chatMessages.set(room.id, [])
    return room
  }

  getRoom(id: string): RoomModel | undefined {
    return this.rooms.get(id)
  }

  getRoomByCode(code: string): RoomModel | undefined {
    return Array.from(this.rooms.values()).find(r => r.roomCode === code)
  }

  updateRoom(id: string, updates: Partial<RoomModel>): RoomModel | undefined {
    const room = this.rooms.get(id)
    if (!room) return undefined
    this.rooms.set(id, { ...room, ...updates, lastActivity: Date.now() })
    return this.rooms.get(id)
  }

  deleteRoom(id: string): boolean {
    this.rooms.delete(id)
    this.players.delete(id)
    this.games.delete(id)
    this.questions.delete(id)
    this.chatMessages.delete(id)
    return true
  }

  addPlayer(roomId: string, player: PlayerModel): PlayerModel | undefined {
    const players = this.players.get(roomId) || []
    players.push(player)
    this.players.set(roomId, players)
    return player
  }

  getPlayers(roomId: string): PlayerModel[] {
    return this.players.get(roomId) || []
  }

  updatePlayer(roomId: string, playerId: string, updates: Partial<PlayerModel>): PlayerModel | undefined {
    const players = this.players.get(roomId) || []
    const index = players.findIndex(p => p.id === playerId)
    if (index === -1) return undefined
    players[index] = { ...players[index], ...updates }
    this.players.set(roomId, players)
    return players[index]
  }

  removePlayer(roomId: string, playerId: string): boolean {
    const players = this.players.get(roomId) || []
    const filtered = players.filter(p => p.id !== playerId)
    this.players.set(roomId, filtered)
    return true
  }

  getGame(roomId: string): GameModel | undefined {
    return this.games.get(roomId)
  }

  updateGame(roomId: string, updates: Partial<GameModel>): GameModel | undefined {
    const game = this.games.get(roomId)
    if (!game) return undefined
    this.games.set(roomId, { ...game, ...updates })
    return this.games.get(roomId)
  }

  addQuestion(roomId: string, question: QuestionModel): QuestionModel {
    const questions = this.questions.get(roomId) || []
    questions.push(question)
    this.questions.set(roomId, questions)
    return question
  }

  getUnusedQuestions(roomId: string, type: QuestionType, intensity: Intensity): QuestionModel[] {
    const questions = this.questions.get(roomId) || []
    const game = this.games.get(roomId)
    const usedIds = new Set(game?.usedQuestionIds || [])
    return questions.filter(q => !usedIds.has(q.id) && q.type === type && q.intensity === intensity)
  }

  markQuestionUsed(roomId: string, questionId: string): void {
    const game = this.games.get(roomId)
    if (!game) return
    game.usedQuestionIds.push(questionId)
    this.games.set(roomId, game)
  }

  addChatMessage(roomId: string, message: ChatMessageModel): ChatMessageModel {
    const messages = this.chatMessages.get(roomId) || []
    messages.push(message)
    this.chatMessages.set(roomId, messages)
    return message
  }

  getChatMessages(roomId: string): ChatMessageModel[] {
    return this.chatMessages.get(roomId) || []
  }

  getAllRooms(): RoomModel[] {
    return Array.from(this.rooms.values())
  }

  getActiveRooms(): RoomModel[] {
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000
    return Array.from(this.rooms.values()).filter(r => r.lastActivity > thirtyMinutesAgo)
  }
}

export const roomStore = new RoomStore()
