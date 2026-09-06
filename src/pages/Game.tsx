import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import CircularGame from '../components/game/CircularGame'
import { useRoomStore } from '../stores/room-store'
import { useIdentityStore } from '../stores/identity-store'
import { ArrowRightRegular } from '@fluentui/react-icons'
import { connectSocket, disconnectSocket, getSocket } from '../lib/socket'
import Button from '../components/ui/Button'
import Emoji from '../components/ui/Emoji'
import Avatar from '../components/avatars/Avatar'
import { playSelectSound, playWinSound, resumeAudioContext } from '../lib/sound'
import { lightImpact, mediumImpact, successImpact } from '../lib/haptic'

type TurnPhase = 'choice' | 'truth' | 'dare' | 'completed'

export default function Game() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const room = useRoomStore((s) => s.room)
  const players = useRoomStore((s) => s.players)
  const game = useRoomStore((s) => s.game)
  const setGame = useRoomStore((s) => s.setGame)
  const resetRoom = useRoomStore((s) => s.reset)
  const identity = useIdentityStore((s) => s.identity)

  const [phase, setPhase] = useState<TurnPhase>('choice')
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null)
  const [lastType, setLastType] = useState<'truth' | 'dare'>('truth')
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

  const currentPlayerIndex = game?.currentPlayerIndex ?? 0
  const currentPlayer = players[currentPlayerIndex] || players[0]
  const isMyTurn = !!identity && !!currentPlayer && currentPlayer.nickname === identity.nickname

  const questions: Record<string, string[]> = {
    funny: [
      "What's the most embarrassing thing you've done at a party?",
      "What's a secret talent no one knows about?",
      "What's the weirdest food combination you secretly enjoy?",
    ],
    friendship: [
      "What's something you've always wanted to tell your closest friend?",
      "Who here do you think will still be in your life in 10 years?",
      "What's the best gift you've ever received?",
    ],
    memories: [
      "What's a childhood memory that still makes you smile?",
      "What's the most trouble you ever got in as a kid?",
      "What's a place you'd love to revisit?",
    ],
  }

  useEffect(() => {
    if (!roomId || !identity) return
    const session = { roomCode: room?.roomCode || roomId, playerId: identity.nickname, nickname: identity.nickname, avatarId: identity.avatarId }
    localStorage.setItem('truthly-session', JSON.stringify(session))
    const socket = connectSocket()
    socket.emit('join-room', { roomId, playerId: identity.nickname })

    const handleGameStateUpdated = (data: { game: { id: string; turnOrder: string[]; currentPlayerIndex: number; state: string; usedQuestionIds: string[] }; currentPlayerId: string | null }) => {
      const gs = data.game
      setGame({
        turnOrder: gs.turnOrder,
        currentPlayerIndex: gs.currentPlayerIndex,
        state: gs.state as any,
        usedQuestionIds: gs.usedQuestionIds,
        currentQuestion: undefined,
      })
      setPhase(gs.state === 'choice' ? 'choice' : 'completed')
      setCurrentQuestion(null)
      setSelectedPlayerId(data.currentPlayerId)
    }

    socket.on('game-state-updated', handleGameStateUpdated)

    return () => {
      socket.off('game-state-updated', handleGameStateUpdated)
      disconnectSocket()
      resetRoom()
    }
  }, [roomId, identity, setGame, resetRoom])

  const handleTruth = () => {
    if (!isMyTurn || !selectedPlayerId) return
    resumeAudioContext()
    playSelectSound()
    mediumImpact()
    setPhase('truth')
    setLastType('truth')
    const topics = room?.topics || ['funny', 'friendship']
    const allQuestions = topics.flatMap((t) => questions[t.toLowerCase()] || [])
    const q = allQuestions[Math.floor(Math.random() * allQuestions.length)] || "What's something you've always wanted to tell your closest friend?"
    setCurrentQuestion(q)
    const socket = getSocket()
    if (socket.connected) {
      socket.emit('select-truth', { roomId: roomId, playerId: identity?.nickname })
    }
  }

  const handleDare = () => {
    if (!isMyTurn || !selectedPlayerId) return
    resumeAudioContext()
    playSelectSound()
    mediumImpact()
    setPhase('dare')
    setLastType('dare')
    setCurrentQuestion("Do your best celebrity impression for 20 seconds.")
    const socket = getSocket()
    if (socket.connected) {
      socket.emit('select-dare', { roomId: roomId, playerId: identity?.nickname })
    }
  }

  const handleSkip = () => {
    resumeAudioContext()
    playSelectSound()
    lightImpact()
    setPhase('completed')
  }

  const handleNext = async () => {
    resumeAudioContext()
    playWinSound()
    successImpact()
    setPhase('choice')
    setCurrentQuestion(null)
    setSelectedPlayerId(null)
    const socket = getSocket()
    if (socket.connected) {
      socket.emit('complete-turn', { roomId: roomId, playerId: identity?.nickname })
    }
  }

  const handleLeave = async () => {
    const socket = getSocket()
    if (socket.connected && roomId && identity) {
      socket.emit('leave-room', { roomId, playerId: identity.nickname })
    }
    resetRoom()
    localStorage.removeItem('truthly-session')
    navigate(`/room/${roomId}`)
  }

  const handleSpinEnd = (playerId: string) => {
    setSelectedPlayerId(playerId)
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="text-sm text-text-secondary">Loading game...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-off-white flex flex-col">
      <header className="sticky top-0 z-50 bg-off-white/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-truth rounded-lg flex items-center justify-center shadow-sm shadow-truth/20">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-text-primary leading-tight">truthly</p>
              <p className="text-xs text-text-secondary leading-tight">{room.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary font-mono bg-surface border border-border px-2 py-1 rounded-lg hidden sm:inline-block">
              {roomId}
            </span>
            <Button size="sm" variant="ghost" onClick={handleLeave} className="gap-2">
              <ArrowRightRegular className="w-4 h-4" />
              <span className="hidden sm:inline">Leave</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-3xl space-y-6">
          <CircularGame
            players={players}
            currentPlayerIndex={currentPlayerIndex}
            isMyTurn={isMyTurn}
            onSpinEnd={handleSpinEnd}
            onTruth={handleTruth}
            onDare={handleDare}
          />

          {(phase === 'truth' || phase === 'dare') && currentQuestion && (
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center justify-center">
                <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-truth-light text-truth">
                  {phase === 'truth' ? 'Truth' : 'Dare'}
                </span>
              </div>
              <p className="text-xl font-display font-medium text-text-primary leading-relaxed text-center">
                "{currentQuestion}"
              </p>
              <div className="space-y-3">
                <input
                  placeholder="Type your answer..."
                  className="w-full h-12 px-4 rounded-xl border border-border bg-surface text-text-primary placeholder:text-text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-truth"
                />
                <div className="flex justify-center">
                  <Button size="md" variant="secondary" onClick={handleSkip}>Skip · 2 remaining</Button>
                </div>
              </div>
              <p className="text-xs text-text-secondary text-center">
                {phase === 'truth' ? <><Emoji symbol="💡" className="mr-1" /> Be honest. Good conversations start here.</> : <><Emoji symbol="🎬" className="mr-1" /> Have fun!</>}
              </p>
            </div>
          )}

          {phase === 'completed' && (
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-5 text-center">
              <h2 className="text-2xl font-display font-bold text-text-primary">Nice one!</h2>
              <p className="text-text-secondary">
                {currentPlayer?.nickname || 'Player'} completed the {lastType}.
              </p>
              <div className="flex justify-center gap-3 text-2xl">
                <Emoji symbol="😂" />
                <Emoji symbol="❤️" />
                <Emoji symbol="🔥" />
                <Emoji symbol="👏" />
              </div>
              <div className="pt-2 space-y-2">
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">Next up</p>
                <div className="flex flex-col items-center gap-2">
                  <Avatar alt={currentPlayer?.nickname || 'Player'} size="md" />
                  <p className="text-sm font-semibold text-text-primary">{currentPlayer?.nickname || 'Player'}</p>
                </div>
              </div>
              <Button className="w-full shadow-lg shadow-truth/20" onClick={handleNext}>Continue →</Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
