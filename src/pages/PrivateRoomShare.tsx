import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Button from '../components/ui/Button'
import { useRoomStore } from '../stores/room-store'
import { api } from '../lib/api'
import type { Room } from '../types'

export default function PrivateRoomShare() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const room = useRoomStore((s) => s.room)
  const setRoom = useRoomStore((s) => s.setRoom)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!roomId || room) {
      setLoading(false)
      return
    }
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
        setRoom(mappedRoom)
      } catch {
        if (mounted) {
          navigate(`/room/${roomId}`, { replace: true })
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    loadRoom()
    return () => { mounted = false }
  }, [roomId, room, setRoom, navigate])

  const inviteLink = typeof window !== 'undefined'
    ? `${window.location.origin}/room/${room?.roomCode || roomId}`
    : `/room/${room?.roomCode || roomId}`

  const copyCode = () => {
    if (room?.roomCode) {
      navigator.clipboard.writeText(room.roomCode)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="text-sm text-text-secondary">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-off-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-truth-light rounded-full flex items-center justify-center shadow-sm">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-truth">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>

        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary mb-2">Private room</h1>
          <p className="text-text-secondary">Share with your friends</p>
        </div>

        <div className="space-y-3">
          <div className="p-5 bg-surface rounded-xl border border-border">
            <p className="text-xs text-text-secondary mb-1">Room code</p>
            <p className="text-sm font-mono text-text-primary">{room?.roomCode || roomId}</p>
          </div>

          <div className="flex gap-2">
            <Button size="md" variant="secondary" className="flex-1" onClick={copyCode}>
              Copy Code
            </Button>
            <Button size="md" className="flex-1 shadow-lg shadow-truth/20" onClick={copyLink}>
              Share Link
            </Button>
          </div>
        </div>

        <Button size="md" variant="ghost" onClick={() => navigate(`/room/${room?.roomCode || roomId}`)}>
          Back to room
        </Button>
      </div>
    </div>
  )
}
