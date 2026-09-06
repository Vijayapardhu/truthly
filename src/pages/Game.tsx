import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Avatar from '../components/avatars/Avatar'
import { useRoomStore } from '../stores/room-store'
import { cn } from '../lib/utils'
import { ArrowRightRegular } from '@fluentui/react-icons'

type TurnPhase = 'choice' | 'truth' | 'dare' | 'completed'

export default function Game() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const room = useRoomStore((s) => s.room)
  const players = useRoomStore((s) => s.players)
  const [phase, setPhase] = useState<TurnPhase>('choice')
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null)

  const currentPlayer = players[0]
  const completedType = phase === 'completed' ? (currentQuestion?.includes('20 seconds') ? 'dare' : 'truth') : 'truth'

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

  const handleTruth = () => {
    setPhase('truth')
    const topics = room?.topics || ['funny', 'friendship']
    const allQuestions = topics.flatMap((t) => questions[t] || [])
    setCurrentQuestion(allQuestions[Math.floor(Math.random() * allQuestions.length)] || "What's something you've always wanted to tell your closest friend?")
  }

  const handleDare = () => {
    setPhase('dare')
    setCurrentQuestion("Do your best celebrity impression for 20 seconds.")
  }

  const handleSkip = () => {
    setPhase('completed')
  }

  const handleNext = () => {
    setPhase('choice')
    setCurrentQuestion(null)
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
              <p className="text-xs text-text-secondary leading-tight">{room?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary font-mono bg-surface border border-border px-2 py-1 rounded-lg hidden sm:inline-block">
              {roomId}
            </span>
            <Button size="sm" variant="ghost" onClick={() => navigate(`/room/${roomId}`)} className="gap-2">
              <ArrowRightRegular className="w-4 h-4" />
              <span className="hidden sm:inline">Leave</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-2xl">
          {phase === 'choice' && (
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar alt={currentPlayer?.nickname || 'Player'} size="lg" />
                <div>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-1">Current turn</p>
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-text-primary">
                    {currentPlayer?.nickname || 'Player'}
                  </h2>
                </div>
                <p className="text-sm text-text-secondary">What do you choose?</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  size="lg"
                  className="justify-center gap-2 shadow-lg shadow-truth/20"
                  onClick={handleTruth}
                >
                  Truth
                  <span className="text-xs font-normal opacity-80">Get real</span>
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="justify-center gap-2"
                  onClick={handleDare}
                >
                  Dare
                  <span className="text-xs font-normal opacity-80">Make it fun</span>
                </Button>
              </div>
            </div>
          )}

          {(phase === 'truth' || phase === 'dare') && currentQuestion && (
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center justify-center">
                <span
                  className={cn(
                    'px-4 py-1.5 rounded-full text-sm font-semibold',
                    phase === 'truth' ? 'bg-truth-light text-truth' : 'bg-dare-light text-dare'
                  )}
                >
                  {phase === 'truth' ? 'Truth' : 'Dare'}
                </span>
              </div>
              <p className="text-xl font-display font-medium text-text-primary leading-relaxed text-center">
                "{currentQuestion}"
              </p>
              <div className="space-y-3">
                <Input placeholder="Type your answer..." />
                <div className="flex justify-center">
                  <Button size="md" variant="secondary" onClick={handleSkip}>Skip · 2 remaining</Button>
                </div>
              </div>
              <p className="text-xs text-text-secondary text-center">
                {phase === 'truth' ? '💡 Be honest. Good conversations start here.' : '🎬 Have fun!'}
              </p>
            </div>
          )}

          {phase === 'completed' && (
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-5 text-center">
              <h2 className="text-2xl font-display font-bold text-text-primary">Nice one!</h2>
              <p className="text-text-secondary">
                {currentPlayer?.nickname || 'Player'} completed the {completedType}.
              </p>
              <div className="flex justify-center gap-3 text-2xl">
                <span>😂</span>
                <span>❤️</span>
                <span>🔥</span>
                <span>👏</span>
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
