import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Button from '../components/ui/Button'
import Avatar from '../components/avatars/Avatar'
import Logo from '../components/icons/Logo'
import { useRoomStore } from '../stores/room-store'
import { useIdentityStore } from '../stores/identity-store'
import { PeopleRegular, CopyRegular, ShareRegular, SettingsRegular, ArrowRightRegular } from '@fluentui/react-icons'
import type { Room, Player } from '../types'

export default function Lobby() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const room = useRoomStore((s) => s.room)
  const players = useRoomStore((s) => s.players)
  const setRoom = useRoomStore((s) => s.setRoom)
  const setPlayers = useRoomStore((s) => s.setPlayers)
  const identity = useIdentityStore((s) => s.identity)

  const [localRoom, setLocalRoom] = useState<Room | null>(room)
  const [localPlayers, setLocalPlayers] = useState<Player[]>(players)

  useEffect(() => {
    if (!room && roomId) {
      const mockRoom: Room = {
        id: roomId,
        name: roomId === 'VCMP3J' ? 'Friday Night 🎉' : `Room ${roomId}`,
        visibility: 'public',
        roomCode: roomId,
        hostId: 'host-1',
        topics: ['Funny', 'Friendship', 'Memories'],
        intensity: 'general',
        allowSkipping: true,
        skipsPerPlayer: 3,
        status: 'lobby',
        createdAt: Date.now(),
        lastActivity: Date.now(),
      }
      const mockPlayers: Player[] = [
        { id: 'host-1', nickname: 'Mvp', avatarId: 'Cat', isHost: true, skipCount: 3, joinedAt: Date.now() },
        { id: 'p2', nickname: 'Rahul', avatarId: 'Tiger', isHost: false, skipCount: 3, joinedAt: Date.now() },
        { id: 'p3', nickname: 'Priya', avatarId: 'Panda', isHost: false, skipCount: 3, joinedAt: Date.now() },
        { id: 'p4', nickname: 'Arjun', avatarId: 'Wolf', isHost: false, skipCount: 3, joinedAt: Date.now() },
      ]
      setRoom(mockRoom)
      setPlayers(mockPlayers)
      setLocalRoom(mockRoom)
      setLocalPlayers(mockPlayers)
    } else if (room) {
      setLocalRoom(room)
      setLocalPlayers(players)
    }
  }, [room, roomId, setRoom, setPlayers, players])

  const host = localPlayers.find((p) => p.isHost)
  const isHost = !!identity && !!host && host.nickname === identity.nickname
  const topicLabels = localRoom?.topics.map((t) => t.charAt(0).toUpperCase() + t.slice(1)) || []

  const copyCode = () => {
    if (localRoom?.roomCode) navigator.clipboard.writeText(localRoom.roomCode)
  }

  const shareLink = () => {
    const link = typeof window !== 'undefined' ? `${window.location.origin}/room/${roomId}` : `/room/${roomId}`
    navigator.clipboard.writeText(link)
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
            <Button size="sm" variant="ghost" onClick={() => navigate(`/room/${roomId}/private`)}>
              <SettingsRegular className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-text-primary">{localRoom?.name || 'Room'}</h1>
            <div className="flex items-center justify-center gap-2 text-text-secondary">
              <PeopleRegular className="w-4 h-4" />
              <span className="text-sm">{localPlayers.length} player{localPlayers.length !== 1 ? 's' : ''}</span>
            </div>
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

          <div className="bg-surface border border-border rounded-2xl divide-y divide-border overflow-hidden">
            {localPlayers.map((player) => (
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
            <Button
              size="lg"
              className="w-full justify-center gap-2 shadow-lg shadow-truth/20"
              onClick={() => navigate(`/room/${roomId}/game`)}
            >
              Start Game
              <ArrowRightRegular className="w-4 h-4" />
            </Button>
          )}

          {!isHost && (
            <div className="flex flex-col items-center gap-4">
              <img
                src="/waiting.gif"
                alt="Waiting for host"
                className="max-h-[160px] w-auto"
              />
              <div className="text-center">
                <p className="text-sm font-semibold text-text-primary">{localRoom?.name}</p>
                <p className="text-xs text-text-secondary font-mono">{localRoom?.roomCode}</p>
              </div>
              <p className="text-sm text-text-secondary">Waiting for the host to start...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
