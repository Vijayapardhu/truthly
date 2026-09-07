import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Avatar from '../components/avatars/Avatar'
import { cn } from '../lib/utils'
import { useIdentityStore } from '../stores/identity-store'
import { api } from '../lib/api'
import { getOrCreateAnonymousUserId } from '../services/auth'
import { CheckmarkRegular } from '@fluentui/react-icons'

const avatarOptions = ['Cat', 'Panda', 'Tiger', 'Pig', 'Monkey', 'Bear', 'Wolf', 'Octopus']

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

export default function IdentitySetup() {
  const navigate = useNavigate()
  const location = useLocation()
  const setIdentity = useIdentityStore((state) => state.setIdentity)
  const [nickname, setNickname] = useState('')
  const [avatarId, setAvatarId] = useState('Cat')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const navState = location.state as { roomId?: string; roomCode?: string } | null
  const roomId = navState?.roomId
  const roomCode = navState?.roomCode

  const session = loadSession()
  const fallbackRoomId = session?.roomId
  const fallbackRoomCode = session?.roomCode
  const effectiveRoomId = roomId || fallbackRoomId
  const effectiveRoomCode = roomCode || fallbackRoomCode

  const handleContinue = async () => {
    if (!nickname.trim() || !effectiveRoomId || isLoading) return
    setError('')
    setIsLoading(true)
    try {
      const uid = await getOrCreateAnonymousUserId()
      const res = await api.joinRoom(effectiveRoomId, {
        nickname: nickname.trim(),
        avatarId,
      })
      setIdentity({ nickname: nickname.trim(), avatarId })
      const session = { playerId: res.player.id, nickname: nickname.trim(), avatarId, roomCode: effectiveRoomCode || effectiveRoomId, uid }
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
      navigate(`/room/${effectiveRoomCode || effectiveRoomId}`, {
        state: session,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-off-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-text-primary mb-2">What's your name?</h1>
          <p className="text-text-secondary">This is just for this session.</p>
        </div>

        <div className="space-y-6">
          <Input
            label="Nickname"
            placeholder="Your name"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
          />

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-3">Choose your avatar</label>
            <div className="grid grid-cols-4 gap-3">
              {avatarOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setAvatarId(option)}
                  className={cn(
                    'relative aspect-square rounded-xl border-2 flex items-center justify-center transition-all hover:scale-105',
                    avatarId === option
                      ? 'border-truth bg-truth-light shadow-md shadow-truth/10'
                      : 'border-border bg-surface hover:border-lavender/40'
                  )}
                >
                  <Avatar alt={option} avatarId={option} className="h-14 w-14" />
                  {avatarId === option && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-truth rounded-full flex items-center justify-center">
                      <CheckmarkRegular className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button size="lg" className="w-full mt-4 shadow-lg shadow-truth/20" onClick={handleContinue} disabled={!nickname.trim() || isLoading}>
            {isLoading ? 'Joining...' : 'Continue →'}
          </Button>
        </div>
      </div>
    </div>
  )
}
