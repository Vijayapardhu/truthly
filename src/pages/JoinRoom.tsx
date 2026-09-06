import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import OTPInput from '../components/ui/OTPInput'
import { api } from '../lib/api'

export default function JoinRoom() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleJoin = async () => {
    if (!code.trim() || isLoading) return
    setError('')
    setIsLoading(true)
    try {
      const res = await api.getRoomByCode(code.trim().toUpperCase())
      navigate('/identity', { state: { roomId: res.id, roomCode: res.roomCode } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Room not found')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-off-white flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-text-primary mb-2">Join a room</h1>
          <p className="text-text-secondary">Enter the room code to join.</p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center">
            <img
              src="/joinroom.gif"
              alt="Join room"
              className="max-h-[220px] w-auto"
            />
          </div>

          <OTPInput length={6} value={code} onChange={setCode} onComplete={handleJoin} />

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button size="lg" className="w-full shadow-lg shadow-truth/20" onClick={handleJoin} disabled={code.length !== 6 || isLoading}>
            {isLoading ? 'Checking...' : 'Join Room →'}
          </Button>
        </div>

        <Button size="md" variant="secondary" className="w-full mt-4" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </div>
    </div>
  )
}
