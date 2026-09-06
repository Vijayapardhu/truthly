import { create } from 'zustand'
import type { Room, Player, GameState, Topic } from '../types'

interface RoomState {
  room: Room | null
  players: Player[]
  topics: Topic[]
  game: GameState | null
  setRoom: (room: Room) => void
  setPlayers: (players: Player[]) => void
  addPlayer: (player: Player) => void
  removePlayer: (playerId: string) => void
  updatePlayer: (playerId: string, updates: Partial<Player>) => void
  setTopics: (topics: Topic[]) => void
  setGame: (game: GameState | null) => void
  reset: () => void
}

const defaultTopics: Topic[] = [
  { id: 'funny', label: 'Funny' },
  { id: 'friendship', label: 'Friendship' },
  { id: 'memories', label: 'Memories' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'college', label: 'College' },
  { id: 'random', label: 'Random' },
  { id: 'embarrassing', label: 'Embarrassing' },
  { id: 'personal', label: 'Personal' },
  { id: 'creative', label: 'Creative' },
]

export const useRoomStore = create<RoomState>((set) => ({
  room: null,
  players: [],
  topics: defaultTopics,
  game: null,
  setRoom: (room) => set({ room }),
  setPlayers: (players) => set({ players }),
  addPlayer: (player) => set((state) => ({ players: [...state.players, player] })),
  removePlayer: (playerId) => set((state) => ({
    players: state.players.filter((p) => p.id !== playerId),
  })),
  updatePlayer: (playerId, updates) => set((state) => ({
    players: state.players.map((p) => p.id === playerId ? { ...p, ...updates } : p),
  })),
  setTopics: (topics) => set({ topics }),
  setGame: (game) => set({ game }),
  reset: () => set({
    room: null,
    players: [],
    topics: defaultTopics,
    game: null,
  }),
}))
