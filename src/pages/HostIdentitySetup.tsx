import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Avatar from '../components/avatars/Avatar'
import Logo from '../components/icons/Logo'
import { cn } from '../lib/utils'
import { useIdentityStore } from '../stores/identity-store'
import { getOrCreateAnonymousUserId } from '../services/auth'
import { CheckmarkRegular } from '@fluentui/react-icons'

const avatarOptions = ['Cat', 'Panda', 'Tiger', 'Pig', 'Monkey', 'Bear', 'Wolf', 'Octopus']

export default function HostIdentitySetup() {
  const navigate = useNavigate()
  const location = useLocation()
  const setIdentity = useIdentityStore((state) => state.setIdentity)
  const [nickname, setNickname] = useState('')
  const [avatarId, setAvatarId] = useState('Cat')

  const roomState = location.state as { roomCode?: string; roomId?: string } | null
  const roomCode = roomState?.roomCode

  const handleContinue = async () => {
    if (!nickname.trim() || !roomCode) return
    const hostId = await getOrCreateAnonymousUserId()
    setIdentity({ nickname: nickname.trim(), avatarId })
    const session = { playerId: hostId, nickname: nickname.trim(), avatarId, roomCode }
    localStorage.setItem('truthly-session', JSON.stringify(session))
    navigate(`/room/${roomCode}`, {
      state: session,
    })
  }

  return (
    <div className="min-h-screen bg-off-white flex flex-col">
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <Logo className="h-8 w-auto" />
      </nav>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-text-primary mb-2">Setup your identity</h1>
            <p className="text-text-secondary">This is just for this session.</p>
          </div>

          <div className="space-y-6">
            <Input
              label="Your name"
              placeholder="Enter your nickname"
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

            <Button size="lg" className="w-full mt-4 shadow-lg shadow-truth/20" onClick={handleContinue} disabled={!nickname.trim()}>
              Continue →
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
