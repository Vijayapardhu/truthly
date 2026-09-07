import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Chip from '../components/ui/Chip'
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
  const [search, setSearch] = useState('')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
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

  const allTopics = useMemo(() => {
    const topicSet = new Set<string>()
    rooms.forEach((room) => room.topics?.forEach((topic) => topicSet.add(topic)))
    return Array.from(topicSet).sort()
  }, [rooms])

  const filteredRooms = useMemo(() => {
    const query = search.trim().toLowerCase()
    return rooms.filter((room) => {
      const matchesSearch = !query || room.name.toLowerCase().includes(query) || room.roomCode.toLowerCase().includes(query)
      const matchesTopics = selectedTopics.length === 0 || selectedTopics.every((topic) => room.topics?.includes(topic))
      return matchesSearch && matchesTopics
    })
  }, [rooms, search, selectedTopics])

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]))
  }

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

        <div className="space-y-4">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rooms by name or code..."
          />

          {allTopics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allTopics.map((topic) => (
                <Chip key={topic} label={topic} selected={selectedTopics.includes(topic)} onClick={() => toggleTopic(topic)} />
              ))}
            </div>
          )}

          <div className="space-y-3">
            {filteredRooms.map((room) => (
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
    </div>
  )
}
