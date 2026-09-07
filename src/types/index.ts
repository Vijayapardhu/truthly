export type Intensity = 'general' | 'close' | 'deep'
export type Visibility = 'public' | 'private'
export type GameStatus = 'lobby' | 'playing' | 'paused' | 'ended'
export type TurnState = 'idle' | 'choice' | 'answering' | 'completed' | 'next_turn' | 'ended'
export type QuestionType = 'truth' | 'dare'

export interface Player {
  id: string
  nickname: string
  avatarId: string
  isHost: boolean
  skipCount: number
  joinedAt: number
}

export interface Topic {
  id: string
  label: string
  isCustom?: boolean
}

export interface Room {
  id: string
  name: string
  visibility: Visibility
  roomCode: string
  hostId: string
  topics: string[]
  intensity: Intensity
  allowSkipping: boolean
  skipsPerPlayer: number
  status: GameStatus
  createdAt: number
  lastActivity: number
}

export interface Question {
  id: string
  roomId: string
  type: QuestionType
  text: string
  topics: string[]
  intensity: Intensity
  isUsed: boolean
  createdAt: number
}

export interface ChatMessage {
  id: string
  roomId: string
  playerId: string
  playerName: string
  playerAvatarId: string
  text: string
  reactions: Record<string, string[]>
  createdAt: number
}

export interface GameState {
  turnOrder: string[]
  currentPlayerIndex: number
  state: TurnState
  usedQuestionIds: string[]
  currentQuestion?: Question
}

export interface Identity {
  nickname: string
  avatarId: string
}
