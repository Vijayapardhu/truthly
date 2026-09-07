import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import CircularGame from '../components/game/CircularGame'
import { useRoomStore } from '../stores/room-store'
import { useIdentityStore } from '../stores/identity-store'
import { ArrowRightRegular } from '@fluentui/react-icons'
import { connectSocket, disconnectSocket, getSocket } from '../lib/socket'
import Button from '../components/ui/Button'
import Emoji from '../components/ui/Emoji'
import Avatar from '../components/avatars/Avatar'
import { playSelectSound, playWinSound, resumeAudioContext } from '../lib/sound'
import { lightImpact, mediumImpact, successImpact } from '../lib/haptic'
import { api } from '../lib/api'
import { getRandomQuestion } from '../services/questions'
import type { Room, Player } from '../types'

const SESSION_KEY = 'truthly-session'

function loadSession() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveSession(session: { roomCode?: string; playerId?: string; nickname?: string; avatarId?: string }) {
  if (typeof window === 'undefined') return
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

function clearSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_KEY)
}

type TurnPhase = 'choice' | 'truth' | 'dare' | 'completed'

interface ChatMessage {
  id: string
  playerId: string
  playerName: string
  playerAvatarId: string
  text: string
  reactions: Record<string, string[]>
  createdAt?: number
}

export default function Game() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const room = useRoomStore((s) => s.room)
  const players = useRoomStore((s) => s.players)
  const game = useRoomStore((s) => s.game)
  const setGame = useRoomStore((s) => s.setGame)
  const resetRoom = useRoomStore((s) => s.reset)
  const setRoom = useRoomStore((s) => s.setRoom)
  const setPlayers = useRoomStore((s) => s.setPlayers)
  const identity = useIdentityStore((s) => s.identity)

  const session = loadSession()
  const playerId = session?.playerId

  useEffect(() => {
    if (!roomId || room) return
    let mounted = true
    async function loadRoom() {
      if (!roomId) return
      try {
        const actualRoomId = await api.resolveRoomId(roomId)
        if (!mounted) return
        const res = await api.getRoom(actualRoomId)
        if (!mounted) return
        const mappedRoom: Room = {
          id: res.room.id,
          name: res.room.name,
          visibility: res.room.visibility,
          roomCode: res.room.roomCode,
          hostId: res.room.hostId,
          topics: res.room.topics,
          intensity: res.room.intensity as any,
          allowSkipping: res.room.allowSkipping,
          skipsPerPlayer: res.room.skipsPerPlayer,
          status: res.room.status as any,
          createdAt: typeof res.room.createdAt?.toMillis === 'function' ? res.room.createdAt.toMillis() : Date.now(),
          lastActivity: Date.now(),
        }
        const mappedPlayers: Player[] = res.players.map((p) => ({
          id: p.id,
          nickname: p.nickname,
          avatarId: p.avatarId,
          isHost: p.isHost,
          skipCount: p.skipCount,
          joinedAt: typeof p.joinedAt?.toMillis === 'function' ? p.joinedAt.toMillis() : Date.now(),
        }))
        setRoom(mappedRoom)
        setPlayers(mappedPlayers)
      } catch {
        if (mounted) {
          navigate(`/room/${roomId}`, { replace: true })
        }
      }
    }
    loadRoom()
    return () => { mounted = false }
  }, [roomId, room, setRoom, setPlayers, navigate])

  const [phase, setPhase] = useState<TurnPhase>('choice')
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null)
  const [lastType, setLastType] = useState<'truth' | 'dare'>('truth')
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null)

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleReact = async (_messageId: string, emoji: string) => {
    if (!roomId || !playerId) return
    await api.sendChatMessage(roomId, {
      playerId,
      playerName: identity?.nickname || 'Anonymous',
      playerAvatarId: identity?.avatarId || 'Cat',
      text: emoji,
    })
  }

  const currentPlayerIndex = game?.currentPlayerIndex ?? 0
  const currentPlayer = players[currentPlayerIndex] || players[0]
  const isMyTurn = !!identity && !!currentPlayer && currentPlayer.nickname === identity.nickname

  const handleTruth = async () => {
    if (!isMyTurn || !selectedPlayerId || !playerId) return
    resumeAudioContext()
    playSelectSound()
    mediumImpact()
    setPhase('truth')
    setLastType('truth')
    const q = await getRandomQuestion(room?.topics || ['funny', 'friendship'], room?.intensity || 'general')
    setCurrentQuestion(q)
    const socket = getSocket()
    if (socket.connected) {
      socket.emit('select-truth', { roomId: roomId, playerId })
    }
  }

  const handleDare = () => {
    if (!isMyTurn || !selectedPlayerId || !playerId) return
    resumeAudioContext()
    playSelectSound()
    mediumImpact()
    setPhase('dare')
    setLastType('dare')
    setCurrentQuestion("Do your best celebrity impression for 20 seconds.")
    const socket = getSocket()
    if (socket.connected) {
      socket.emit('select-dare', { roomId: roomId, playerId })
    }
  }

  useEffect(() => {
    if (!roomId || !identity) return
    const session = loadSession()
    const playerId = session?.playerId || identity.nickname
    saveSession({ roomCode: room?.roomCode || roomId, playerId, nickname: identity.nickname, avatarId: identity.avatarId })
    const socket = connectSocket()
    socket.emit('join-room', { roomId, playerId })

    const handleGameStateUpdated = (data: { game: { id: string; turnOrder: string[]; currentPlayerIndex: number; state: string; usedQuestionIds: string[] }; currentPlayerId: string | null }) => {
      const gs = data.game
      setGame({
        turnOrder: gs.turnOrder,
        currentPlayerIndex: gs.currentPlayerIndex,
        state: gs.state as any,
        usedQuestionIds: gs.usedQuestionIds,
        currentQuestion: undefined,
      })
      setPhase(gs.state === 'choice' ? 'choice' : 'completed')
      setCurrentQuestion(null)
      setSelectedPlayerId(data.currentPlayerId)
    }

    socket.on('game-state-updated', handleGameStateUpdated)

    return () => {
      socket.off('game-state-updated', handleGameStateUpdated)
      disconnectSocket()
    }
  }, [roomId, identity, setGame])

  useEffect(() => {
    const saved = loadSession()
    if (saved?.roomCode && !roomId && !room) {
      navigate(`/room/${saved.roomCode}`, { state: saved, replace: true })
    }
  }, [roomId, room, navigate])

  useEffect(() => {
    if (!roomId || !identity) return
    let unsub: (() => void) | undefined

    async function loadChat() {
      if (!roomId) return
      const msgs = await api.getChatMessages(roomId)
      const mapped = (msgs as any[]).map((msg) => ({
        ...msg,
        createdAt: typeof msg.createdAt?.toMillis === 'function' ? msg.createdAt.toMillis() : typeof msg.createdAt === 'number' ? msg.createdAt : undefined,
      }))
      setMessages(mapped as ChatMessage[])
      unsub = api.subscribeToChat(roomId, (updated) => {
        const mappedUpdated = (updated as any[]).map((msg) => ({
          ...msg,
          createdAt: typeof msg.createdAt?.toMillis === 'function' ? msg.createdAt.toMillis() : typeof msg.createdAt === 'number' ? msg.createdAt : undefined,
        }))
        setMessages(mappedUpdated as ChatMessage[])
      })
    }

    loadChat()

    return () => {
      if (unsub) unsub()
    }
  }, [roomId, identity])

  const handleSkip = () => {
    resumeAudioContext()
    playSelectSound()
    lightImpact()
    setPhase('completed')
  }

  const handleNext = async () => {
    resumeAudioContext()
    playWinSound()
    successImpact()
    setPhase('choice')
    setCurrentQuestion(null)
    setSelectedPlayerId(null)
    const socket = getSocket()
    if (socket.connected && playerId) {
      socket.emit('complete-turn', { roomId: roomId, playerId })
    }
  }

  const handleSendChat = async () => {
    if (!chatInput.trim() || !roomId || !identity) return
    const text = chatInput.trim()
    setChatInput('')
    await api.sendChatMessage(roomId, {
      playerId: playerId || identity.nickname,
      playerName: identity.nickname,
      playerAvatarId: identity.avatarId,
      text,
    })
  }

  const handleLeave = async () => {
    const socket = getSocket()
    if (socket.connected && roomId && identity && playerId) {
      socket.emit('leave-room', { roomId, playerId })
    }
    resetRoom()
    clearSession()
    navigate(`/room/${roomId}`)
  }

  const handleSpinEnd = (playerId: string) => {
    setSelectedPlayerId(playerId)
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="text-sm text-text-secondary">Loading game...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-off-white flex flex-col">
      <header className="sticky top-0 z-50 bg-off-white/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-truth rounded-lg flex items-center justify-center shadow-sm shadow-truth/20">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-text-primary leading-tight">truthly</p>
              <p className="text-xs text-text-secondary leading-tight">{room.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary font-mono bg-surface border border-border px-2 py-1 rounded-lg hidden sm:inline-block">
              {roomId}
            </span>
            <Button size="sm" variant="ghost" onClick={handleLeave} className="gap-2">
              <ArrowRightRegular className="w-4 h-4" />
              <span className="hidden sm:inline">Leave</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-3xl space-y-6">
          <CircularGame
            players={players}
            currentPlayerIndex={currentPlayerIndex}
            isMyTurn={isMyTurn}
            onSpinEnd={handleSpinEnd}
            onTruth={handleTruth}
            onDare={handleDare}
          />

          {(phase === 'truth' || phase === 'dare') && currentQuestion && (
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center justify-center">
                <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-truth-light text-truth">
                  {phase === 'truth' ? 'Truth' : 'Dare'}
                </span>
              </div>
              <p className="text-xl font-display font-medium text-text-primary leading-relaxed text-center">
                "{currentQuestion}"
              </p>
              <div className="space-y-3">
                <input
                  placeholder="Type your answer..."
                  className="w-full h-12 px-4 rounded-xl border border-border bg-surface text-text-primary placeholder:text-text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-truth"
                />
                <div className="flex justify-center">
                  <Button size="md" variant="secondary" onClick={handleSkip}>Skip · 2 remaining</Button>
                </div>
              </div>
              <p className="text-xs text-text-secondary text-center">
                {phase === 'truth' ? <><Emoji symbol="💡" className="mr-1" /> Be honest. Good conversations start here.</> : <><Emoji symbol="🎬" className="mr-1" /> Have fun!</>}
              </p>
            </div>
          )}

          {phase === 'completed' && (
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-5 text-center">
              <h2 className="text-2xl font-display font-bold text-text-primary">Nice one!</h2>
              <p className="text-text-secondary">
                {currentPlayer?.nickname || 'Player'} completed the {lastType}.
              </p>
              <div className="flex justify-center gap-3 text-2xl">
                <Emoji symbol="😂" />
                <Emoji symbol="❤️" />
                <Emoji symbol="🔥" />
                <Emoji symbol="👏" />
              </div>
              <div className="pt-2 space-y-2">
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">Next up</p>
                <div className="flex flex-col items-center gap-2">
                  <Avatar alt={currentPlayer?.nickname || 'Player'} size="md" />
                  <p className="text-sm font-semibold text-text-primary">{currentPlayer?.nickname || 'Player'}</p>
                </div>
              </div>
              <Button className="w-full shadow-lg shadow-truth/20" onClick={handleNext}>Continue →</Button>
            </div>
          )}

          <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            <p className="text-sm font-semibold text-text-primary">Room chat</p>
            <div className="h-40 overflow-y-auto space-y-3 pr-1">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-start gap-3 group"
                  onMouseEnter={() => setHoveredMessageId(msg.id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                >
                  <Avatar alt={msg.playerName} avatarId={msg.playerAvatarId} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <p className="text-sm font-semibold text-text-primary">{msg.playerName}</p>
                      <span className="text-[10px] text-text-secondary">{formatTime(msg.createdAt)}</span>
                    </div>
                    <p className="text-sm text-text-secondary break-words">{msg.text}</p>
                    {Object.keys(msg.reactions).length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {Object.entries(msg.reactions).map(([emoji, users]) => (
                          <span key={emoji} className="text-xs bg-surface border border-border rounded-full px-1.5 py-0.5">
                            {emoji} {users.length}
                          </span>
                        ))}
                      </div>
                    )}
                    {hoveredMessageId === msg.id && (
                      <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {['😂', '❤️', '🔥', '👏'].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleReact(msg.id, emoji)}
                            className="text-xs bg-surface border border-border rounded-full px-1.5 py-0.5 hover:border-lavender transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Type a message..."
                className="flex-1 h-11 px-4 rounded-xl border border-border bg-surface text-text-primary placeholder:text-text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-truth"
              />
              <Button size="md" onClick={handleSendChat} disabled={!chatInput.trim()}>
                Send
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
