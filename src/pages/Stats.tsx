import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Avatar from '../components/avatars/Avatar'
import { api } from '../lib/api'
import { useIdentityStore } from '../stores/identity-store'
import { ArrowLeftRegular } from '@fluentui/react-icons'

interface GameResult {
  id: string
  roomId: string
  roomName: string
  playerId: string
  playerName: string
  completedAt?: number
  turnCount: number
}

export default function Stats() {
  const navigate = useNavigate()
  const [results, setResults] = useState<GameResult[]>([])
  const [loading, setLoading] = useState(true)
  const identity = useIdentityStore((state) => state.identity)
  const session = (() => {
    if (typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem('truthly-session')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })()

  useEffect(() => {
    async function loadStats() {
      try {
        const playerId = session?.playerId || identity?.nickname
        if (!playerId) {
          setLoading(false)
          return
        }
        const data = await api.getGameResults(playerId)
        const mapped = (data || []).map((item: any) => ({
          id: item.id,
          roomId: item.roomId,
          roomName: item.roomName,
          playerId: item.playerId,
          playerName: item.playerName,
          completedAt: typeof item.completedAt?.toMillis === 'function' ? item.completedAt.toMillis() : typeof item.completedAt === 'number' ? item.completedAt : undefined,
          turnCount: item.turnCount,
        }))
        setResults(mapped)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [identity, session])

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-off-white flex flex-col items-center px-4 pt-12 pb-16">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-text-primary mb-2">Game history</h1>
            <p className="text-text-secondary">Your completed games.</p>
          </div>
          <Button size="md" variant="secondary" onClick={() => navigate(-1)}>
            <ArrowLeftRegular className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {loading ? (
          <div className="text-sm text-text-secondary">Loading stats...</div>
        ) : results.length === 0 ? (
          <div className="text-sm text-text-secondary">No completed games yet.</div>
        ) : (
          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={result.id}
                className="flex items-center justify-between p-5 bg-surface rounded-2xl border border-border hover:border-lavender/40 transition-all shadow-sm hover:shadow-md"
              >
                <div className="space-y-2">
                  <h3 className="font-display font-semibold text-text-primary">{result.roomName}</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <Avatar alt={result.playerName} size="sm" className="border-2 border-surface" />
                    </div>
                    <span className="text-xs text-text-secondary">{result.playerName}</span>
                  </div>
                  <div className="flex gap-2 text-xs text-text-secondary">
                    <span className="px-2 py-1 rounded-full bg-surface border border-border">{result.turnCount} turns</span>
                    <span className="px-2 py-1 rounded-full bg-surface border border-border">{formatDate(result.completedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
