import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import OTPInput from '../components/ui/OTPInput'

export default function JoinRoom() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')

  const handleJoin = () => {
    if (!code.trim()) return
    navigate('/identity', { state: { roomId: code.trim() } })
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

          <Button size="lg" className="w-full shadow-lg shadow-truth/20" onClick={handleJoin} disabled={code.length !== 6}>
            Join Room →
          </Button>
        </div>

        <Button size="md" variant="secondary" className="w-full mt-4" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </div>
    </div>
  )
}
