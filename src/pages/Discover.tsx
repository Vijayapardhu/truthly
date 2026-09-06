import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import Avatar from '../components/avatars/Avatar'

const rooms = [
  { id: 'room1', name: 'Friday Night 🎉', players: 12, topics: ['Close', 'Funny', 'Friendship'] },
  { id: 'room2', name: 'College Gang', players: 24, topics: ['General', 'College', 'Funny'] },
  { id: 'room3', name: 'Late Night', players: 5, topics: ['Deep', 'Memories'] },
  { id: 'room4', name: 'Chill Vibes', players: 8, topics: ['Funny', 'Close'] },
]

export default function Discover() {
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
                    {Array.from({ length: Math.min(3, room.players) }).map((_, i) => (
                      <Avatar key={i} size="sm" className="border-2 border-surface" />
                    ))}
                  </div>
                  <span className="text-xs text-text-secondary">{room.players} players</span>
                </div>
                <div className="flex gap-2">
                  {room.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-0.5 rounded-full bg-truth-light text-truth text-xs font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              <Link to={`/room/${room.id}`}>
                <Button size="sm">Join →</Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
