import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Button from '../components/ui/Button'
import Avatar from '../components/avatars/Avatar'
import { api } from '../lib/api'
import { useIdentityStore } from '../stores/identity-store'

interface RoomRow {
  id: string
  name: string
  roomCode: string
  topics?: string[]
  players?: { id: string }[]
}

export default function Discover() {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<RoomRow[]>([])
  const [loading, setLoading] = useState(true)
  const identity = useIdentityStore((state) => state.identity)

  useEffect(() => {
    async function loadRooms() {
      try {
        const result = await api.getAllRooms()
        const mapped = (result || []).map((room: any) => ({
          id: room.id,
          name: room.name,
          roomCode: room.roomCode,
          topics: room.topics,
          players: room.players || [],
        }))
        setRooms(mapped)
      } catch {
        setRooms([])
      } finally {
        setLoading(false)
      }
    }

    loadRooms()
  }, [])

  const handleJoin = async (code: string) => {
    if (!identity) {
      navigate('/join')
      return
    }
    navigate(`/room/${code}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="text-sm text-text-secondary">Loading rooms...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-off-white flex flex-col items-center px-4 pt-12 pb-16">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-text-primary mb-2">Discover rooms</h1>
          <p className="text-text-secondary">Join live rooms and meet new people.</p>
        </div>

        <div className="space-y-3">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="flex items-center justify-between p-5 bg-surface rounded-2xl border border-border hover:border-lavender/40 transition-all shadow-sm hover:shadow-md"
            >
              <div className="space-y-2">
                <h3 className="font-display font-semibold text-text-primary">{room.name}</h3>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {Array.from({ length: Math.min(3, room.players?.length || 0) }).map((_, i) => (
                      <Avatar key={i} size="sm" className="border-2 border-surface" />
                    ))}
                  </div>
                  <span className="text-xs text-text-secondary">{room.players?.length || 0} players</span>
                </div>
                <div className="flex gap-2">
                  {room.topics?.map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-0.5 rounded-full bg-truth-light text-truth text-xs font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => navigate('/join')}>
                  Enter Code
                </Button>
                <Button size="sm" onClick={() => handleJoin(room.roomCode || room.id)}>
                  Join →
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
