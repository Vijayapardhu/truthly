import {
  db,
} from '../lib/firebase'
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  Timestamp,
  runTransaction,
} from 'firebase/firestore'

export type FirestoreRoom = {
  id: string
  name: string
  visibility: 'public' | 'private'
  roomCode: string
  hostId: string
  topics: string[]
  intensity: string
  allowSkipping: boolean
  skipsPerPlayer: number
  status: 'lobby' | 'playing' | 'paused' | 'ended'
  createdAt: Timestamp | null
  lastActivity: Timestamp | null
}

export type FirestorePlayer = {
  id: string
  userId?: string
  nickname: string
  avatarId: string
  isHost: boolean
  skipCount: number
  joinedAt: Timestamp | null
}

export type FirestoreGame = {
  id: string
  roomId: string
  turnOrder: string[]
  currentPlayerIndex: number
  state: 'idle' | 'choice' | 'answering' | 'completed' | 'next_turn'
  usedQuestionIds: string[]
  currentQuestion?: string
  createdAt: Timestamp | null
}

export type FirestoreChatMessage = {
  id: string
  roomId: string
  playerId: string
  playerName: string
  playerAvatarId: string
  text: string
  reactions: Record<string, string[]>
  createdAt: Timestamp | null
}

function roomFromDoc(id: string, data: Record<string, unknown>): FirestoreRoom {
  return {
    id,
    name: (data.name as string) || '',
    visibility: (data.visibility as 'public' | 'private') || 'public',
    roomCode: (data.roomCode as string) || id,
    hostId: (data.hostId as string) || '',
    topics: (data.topics as string[]) || [],
    intensity: (data.intensity as string) || 'general',
    allowSkipping: (data.allowSkipping as boolean) ?? true,
    skipsPerPlayer: (data.skipsPerPlayer as number) ?? 3,
    status: (data.status as FirestoreRoom['status']) || 'lobby',
    createdAt: data.createdAt as Timestamp | null,
    lastActivity: data.lastActivity as Timestamp | null,
  }
}

function playerFromDoc(id: string, data: Record<string, unknown>): FirestorePlayer {
  return {
    id,
    nickname: (data.nickname as string) || '',
    avatarId: (data.avatarId as string) || '',
    isHost: (data.isHost as boolean) ?? false,
    skipCount: (data.skipCount as number) ?? 3,
    joinedAt: data.joinedAt as Timestamp | null,
  }
}

function gameFromDoc(id: string, data: Record<string, unknown>): FirestoreGame {
  return {
    id,
    roomId: (data.roomId as string) || '',
    turnOrder: (data.turnOrder as string[]) || [],
    currentPlayerIndex: (data.currentPlayerIndex as number) ?? 0,
    state: (data.state as FirestoreGame['state']) || 'idle',
    usedQuestionIds: (data.usedQuestionIds as string[]) || [],
    currentQuestion: data.currentQuestion as string | undefined,
    createdAt: data.createdAt as Timestamp | null,
  }
}

function roomDoc(docId: string) {
  return doc(db, 'rooms', docId)
}

function playersCollection(roomId: string) {
  return collection(db, 'rooms', roomId, 'players')
}

function gameDoc(roomId: string) {
  return doc(db, 'rooms', roomId, 'game', 'current')
}

function chatCollection(roomId: string) {
  return collection(db, 'rooms', roomId, 'chat')
}

export async function createRoom(data: {
  name: string
  visibility: 'public' | 'private'
  roomCode: string
  hostId: string
  topics: string[]
  intensity: string
  allowSkipping: boolean
  skipsPerPlayer: number
  hostName: string
  hostAvatarId: string
}) {
  const roomRef = roomDoc(data.roomCode)
  const now = serverTimestamp() as unknown as Timestamp
  const room: FirestoreRoom = {
    id: data.roomCode,
    name: data.name,
    visibility: data.visibility,
    roomCode: data.roomCode,
    hostId: data.hostId,
    topics: data.topics,
    intensity: data.intensity,
    allowSkipping: data.allowSkipping,
    skipsPerPlayer: data.skipsPerPlayer,
    status: 'lobby',
    createdAt: now,
    lastActivity: now,
  }

  await setDoc(roomRef, room)

  const hostPlayer: FirestorePlayer = {
    id: data.hostId,
    nickname: data.hostName,
    avatarId: data.hostAvatarId,
    isHost: true,
    skipCount: data.skipsPerPlayer,
    joinedAt: now,
  }
  await setDoc(doc(playersCollection(data.roomCode), data.hostId), hostPlayer)

  const game: FirestoreGame = {
    id: 'current',
    roomId: data.roomCode,
    turnOrder: [],
    currentPlayerIndex: 0,
    state: 'idle',
    usedQuestionIds: [],
    createdAt: now,
  }
  await setDoc(gameDoc(data.roomCode), game)

  return { room, player: hostPlayer }
}

export async function getRoomByCode(code: string): Promise<FirestoreRoom> {
  const snap = await getDoc(roomDoc(code))
  if (!snap.exists()) throw new Error('Room not found')
  return roomFromDoc(snap.id, snap.data() as Record<string, unknown>)
}

export async function getAllRooms(): Promise<FirestoreRoom[]> {
  const snap = await getDocs(collection(db, 'rooms'))
  return snap.docs.map((d) => roomFromDoc(d.id, d.data() as Record<string, unknown>))
}

export async function getRoom(roomId: string) {
  const roomSnap = await getDoc(roomDoc(roomId))
  if (!roomSnap.exists()) throw new Error('Room not found')
  const room = roomFromDoc(roomSnap.id, roomSnap.data() as Record<string, unknown>)

  const playersSnap = await getDocs(playersCollection(roomId))
  const players = playersSnap.docs.map((d) => playerFromDoc(d.id, d.data() as Record<string, unknown>))

  return { room, players }
}

export async function joinRoom(roomId: string, data: { nickname: string; avatarId: string; userId?: string }) {
  const playerId = `${data.nickname}-${Date.now()}`
  const now = serverTimestamp() as unknown as Timestamp
  const roomSnap = await getDoc(roomDoc(roomId))
  const roomData = roomSnap.data() as Record<string, unknown> | undefined
  const skipCount = (roomData?.skipsPerPlayer as number) ?? 3

  const player: FirestorePlayer = {
    id: playerId,
    userId: data.userId,
    nickname: data.nickname,
    avatarId: data.avatarId,
    isHost: false,
    skipCount,
    joinedAt: now,
  }
  await setDoc(doc(playersCollection(roomId), playerId), player)
  await updateDoc(roomDoc(roomId), { lastActivity: now })
  return { player }
}

export async function startGame(roomId: string, _playerId: string) {
  const gameRef = gameDoc(roomId)
  const playersSnap = await getDocs(playersCollection(roomId))
  const players = playersSnap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestorePlayer))

  const turnOrder = players.map((p) => p.id)
  await updateDoc(gameRef, {
    state: 'choice',
    turnOrder,
    currentPlayerIndex: 0,
  })

  await updateDoc(roomDoc(roomId), { status: 'playing', lastActivity: serverTimestamp() })
  return { turnOrder }
}

export async function getChatMessages(roomId: string) {
  const snap = await getDocs(
    query(chatCollection(roomId), where('roomId', '==', roomId))
  )
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreChatMessage))
}

export async function sendChatMessage(roomId: string, data: { playerId: string; playerName: string; playerAvatarId: string; text: string }) {
  const message: FirestoreChatMessage = {
    id: `${data.playerId}-${Date.now()}`,
    roomId,
    playerId: data.playerId,
    playerName: data.playerName,
    playerAvatarId: data.playerAvatarId,
    text: data.text,
    reactions: {},
    createdAt: serverTimestamp() as unknown as Timestamp,
  }
  await setDoc(doc(chatCollection(roomId), message.id), message)
  return message
}

export function subscribeToPlayers(roomId: string, callback: (players: FirestorePlayer[]) => void) {
  const q = query(playersCollection(roomId))
  return onSnapshot(q, (snapshot) => {
    const players = snapshot.docs.map((d) => playerFromDoc(d.id, d.data() as Record<string, unknown>))
    callback(players)
  })
}

export function subscribeToGame(roomId: string, callback: (game: FirestoreGame | null) => void) {
  return onSnapshot(gameDoc(roomId), (snapshot) => {
    if (!snapshot.exists()) {
      callback(null)
      return
    }
    callback(gameFromDoc(snapshot.id, snapshot.data() as Record<string, unknown>))
  })
}

export function subscribeToChat(roomId: string, callback: (messages: FirestoreChatMessage[]) => void) {
  const q = query(chatCollection(roomId))
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreChatMessage))
    callback(messages)
  })
}

export async function updateGameState(roomId: string, updates: Partial<FirestoreGame>) {
  await updateDoc(gameDoc(roomId), updates)
}

export async function completeTurn(roomId: string) {
  const gameRef = gameDoc(roomId)
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(gameRef)
    if (!snap.exists()) return
    const game = snap.data() as FirestoreGame
    const nextIndex = game.turnOrder.length === 0 ? 0 : (game.currentPlayerIndex + 1) % game.turnOrder.length
    transaction.update(gameRef, {
      currentPlayerIndex: nextIndex,
      state: 'choice',
    })
  })
}

export async function updateRoomLastActivity(roomId: string) {
  await updateDoc(roomDoc(roomId), { lastActivity: serverTimestamp() })
}

export async function endGame(roomId: string) {
  await updateDoc(gameDoc(roomId), {
    state: 'ended',
    currentPlayerIndex: 0,
  })
  await updateDoc(roomDoc(roomId), { status: 'ended', lastActivity: serverTimestamp() })
}

export type FirestoreGameResult = {
  id: string
  roomId: string
  roomName: string
  playerId: string
  playerName: string
  completedAt: Timestamp | null
  turnCount: number
}

export async function saveGameResult(data: {
  roomId: string
  roomName: string
  playerId: string
  playerName: string
  turnCount: number
}) {
  const resultRef = doc(collection(db, 'gameResults'))
  const now = serverTimestamp() as unknown as Timestamp
  const result: FirestoreGameResult = {
    id: resultRef.id,
    roomId: data.roomId,
    roomName: data.roomName,
    playerId: data.playerId,
    playerName: data.playerName,
    completedAt: now,
    turnCount: data.turnCount,
  }
  await setDoc(resultRef, result)
  return result
}

export async function getGameResults(playerId: string, limitCount = 20) {
  const q = query(collection(db, 'gameResults'), where('playerId', '==', playerId), orderBy('completedAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.slice(0, limitCount).map((d) => ({ id: d.id, ...d.data() } as FirestoreGameResult))
}

export async function getRoomGameResults(roomId: string, limitCount = 20) {
  const q = query(collection(db, 'gameResults'), where('roomId', '==', roomId), orderBy('completedAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.slice(0, limitCount).map((d) => ({ id: d.id, ...d.data() } as FirestoreGameResult))
}
