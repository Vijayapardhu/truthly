import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useRoomStore } from '../stores/room-store'
import { useIdentityStore } from '../stores/identity-store'
import { PeopleRegular, CopyRegular, ShareRegular, SettingsRegular, ArrowRightRegular } from '@fluentui/react-icons'
import type { Room, Player } from '../types'
import { api } from '../lib/api'
import { connectSocket, disconnectSocket } from '../lib/socket'
import Button from '../components/ui/Button'
import Logo from '../components/icons/Logo'
import Avatar from '../components/avatars/Avatar'
import { requestNotificationPermission } from '../services/notifications'

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

export default function Lobby() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const room = useRoomStore((s) => s.room)
  const players = useRoomStore((s) => s.players)
  const setRoom = useRoomStore((s) => s.setRoom)
  const setPlayers = useRoomStore((s) => s.setPlayers)
  const identity = useIdentityStore((s) => s.identity)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [resolvedRoomId, setResolvedRoomId] = useState<string | null>(null)

  const navState = location.state as { playerId?: string; nickname?: string; avatarId?: string; roomCode?: string } | null
  const incomingPlayerId = navState?.playerId

  const session = loadSession()
  const playerId = incomingPlayerId || session?.playerId

  useEffect(() => {
    if (!roomId) return
    let mounted = true

    async function loadRoom() {
      if (!roomId) return
      try {
        const actualRoomId = await api.resolveRoomId(roomId)
        if (!mounted) return
        setResolvedRoomId(actualRoomId)

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
        saveSession({ roomCode: mappedRoom.roomCode, playerId, nickname: identity?.nickname, avatarId: identity?.avatarId })
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load room')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadRoom()

    const socket = connectSocket()
    socket.emit('join-room', { roomId, playerId })

    const handlePlayerJoined = (data: { playerId: string; players: Player[] }) => {
      setPlayers(data.players)
    }

    const handlePlayerLeft = (data: { playerId: string; players: Player[] }) => {
      setPlayers(data.players)
    }

    const handleGameState = (data: { game: { id: string; turnOrder: string[]; currentPlayerIndex: number; state: string; usedQuestionIds: string[] }; currentPlayerId: string | null }) => {
      const gs = data.game
      useRoomStore.getState().setGame({
        turnOrder: gs.turnOrder,
        currentPlayerIndex: gs.currentPlayerIndex,
        state: gs.state as any,
        usedQuestionIds: gs.usedQuestionIds,
        currentQuestion: undefined,
      })
      if (gs.state === 'choice') {
        navigate(`/room/${roomId}/game`, { replace: true })
      }
    }

    socket.on('player-joined', handlePlayerJoined)
    socket.on('player-left', handlePlayerLeft)
    socket.on('game-state', handleGameState)

    return () => {
      mounted = false
      socket.emit('leave-room', { roomId, playerId })
      socket.off('player-joined', handlePlayerJoined)
      socket.off('player-left', handlePlayerLeft)
      socket.off('game-state', handleGameState)
      disconnectSocket()
    }
  }, [roomId, playerId, setRoom, setPlayers, navigate, identity])

  useEffect(() => {
    if (!identity && resolvedRoomId && !loading && room) {
      const session = loadSession()
      if (session?.nickname && session?.avatarId) {
        return
      }
      navigate(`/identity`, {
        replace: true,
        state: { roomId: resolvedRoomId, roomCode: room.roomCode }
      })
    }
  }, [identity, resolvedRoomId, loading, navigate, room])

  useEffect(() => {
    const saved = loadSession()
    if (saved?.roomCode && !roomId && !resolvedRoomId && !room) {
      navigate(`/room/${saved.roomCode}`, { state: saved, replace: true })
    }
  }, [roomId, resolvedRoomId, room, navigate])

  const host = players.find((p) => p.isHost)
  const isHost = !!identity && !!host && playerId === host.id
  const hostGone = !isHost && !players.some((p) => p.isHost)
  const topicLabels = room?.topics.map((t) => t.charAt(0).toUpperCase() + t.slice(1)) || []

  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted')
    }
  }, [])

  const handleRequestNotifications = async () => {
    const token = await requestNotificationPermission()
    setNotificationsEnabled(!!token)
  }

  const copyCode = () => {
    if (room?.roomCode) navigator.clipboard.writeText(room.roomCode)
  }

  const shareLink = () => {
    const link = typeof window !== 'undefined' ? `${window.location.origin}/room/${room?.roomCode || roomId}` : `/room/${room?.roomCode || roomId}`
    navigator.clipboard.writeText(link)
  }

  const handleStartGame = async () => {
    if (!resolvedRoomId || !playerId) return
    try {
      await api.startGame(resolvedRoomId, playerId)
      navigate(`/room/${roomId}/game`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game')
    }
  }

  const handleEndGame = async () => {
    if (!resolvedRoomId || !playerId || !room) return
    try {
      const game = await api.getRoom(resolvedRoomId)
      const turnCount = game.players.length * 3
      await api.saveGameResult({
        roomId: resolvedRoomId,
        roomName: room.name,
        playerId,
        playerName: identity?.nickname || 'Host',
        turnCount,
      })
      await api.endGame(resolvedRoomId)
      navigate(`/room/${roomId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end game')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="text-sm text-text-secondary">Loading room...</div>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-off-white flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm text-red-600">{error || 'Room not found'}</p>
        <Button size="md" variant="secondary" onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-off-white flex flex-col">
      <header className="sticky top-0 z-50 bg-off-white/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 max-w-6xl mx-auto w-full">
          <Logo className="h-7 w-auto" />
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={copyCode} className="gap-2">
              <CopyRegular className="w-4 h-4" />
              <span className="hidden sm:inline">Copy code</span>
            </Button>
            <Button size="sm" variant="ghost" onClick={shareLink}>
              <ShareRegular className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => navigate('/stats')}>
              Stats
            </Button>
            <Button size="sm" variant="ghost" onClick={() => navigate(`/room/${roomId}/private`)}>
              <SettingsRegular className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-text-primary">{room.name}</h1>
            <div className="flex items-center justify-center gap-2 text-text-secondary">
              <PeopleRegular className="w-4 h-4" />
              <span className="text-sm">{players.length} player{players.length !== 1 ? 's' : ''}</span>
            </div>
            <p className="text-xs font-mono text-text-secondary bg-surface border border-border inline-block px-3 py-1 rounded-lg">
              Code: {room.roomCode}
            </p>
          </div>

          {topicLabels.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {topicLabels.map((label) => (
                <span
                  key={label}
                  className="px-3 py-1 rounded-full bg-truth-light text-truth text-xs font-medium"
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          {hostGone && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
              <p className="text-sm font-semibold text-red-600">The host has left the room.</p>
              <p className="text-xs text-red-500">This room is no longer active.</p>
              <Button size="md" variant="secondary" onClick={() => navigate('/')}>Back to Home</Button>
            </div>
          )}

          {!hostGone && (
            <>
              <div className="bg-surface border border-border rounded-2xl divide-y divide-border overflow-hidden">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <Avatar alt={player.nickname} avatarId={player.avatarId} size="sm" />
                    <span className="flex-1 text-sm font-medium text-text-primary">{player.nickname}</span>
                    {player.isHost && (
                      <span className="text-[11px] font-semibold text-truth bg-truth-light px-2 py-0.5 rounded-full">HOST</span>
                    )}
                  </div>
                ))}
              </div>

              {isHost && (
                <div className="flex gap-2">
                  <Button
                    size="lg"
                    className="flex-1 justify-center gap-2 shadow-lg shadow-truth/20"
                    onClick={handleStartGame}
                  >
                    Start Game
                    <ArrowRightRegular className="w-4 h-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="danger"
                    className="flex-1"
                    onClick={handleEndGame}
                  >
                    End Game
                  </Button>
                </div>
              )}

              {!isHost && (
                <div className="flex flex-col items-center gap-4">
                  <img
                    src="/waiting.gif"
                    alt="Waiting for host"
                    className="max-h-[160px] w-auto"
                  />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-text-primary">Waiting for the host to start...</p>
                    <p className="text-xs text-text-secondary mt-1">Share the room code with friends</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={copyCode}>Copy Code</Button>
                    <Button size="sm" variant="secondary" onClick={shareLink}>Copy Link</Button>
                    <Button size="sm" variant="ghost" onClick={() => navigate('/')}>Leave</Button>
                  </div>
                </div>
              )}

              {!notificationsEnabled && (
                <Button size="md" variant="secondary" className="w-full" onClick={handleRequestNotifications}>
                  Enable notifications
                </Button>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
