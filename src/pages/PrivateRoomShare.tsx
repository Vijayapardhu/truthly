import { useParams, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useRoomStore } from '../stores/room-store'

export default function PrivateRoomShare() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const room = useRoomStore((s) => s.room)

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
