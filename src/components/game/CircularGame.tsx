import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import type { Player } from '../../types'
import Avatar from '../avatars/Avatar'
import Button from '../ui/Button'
import { cn } from '../../lib/utils'
import { playSpinSound, resumeAudioContext } from '../../lib/sound'
import { heavyImpact } from '../../lib/haptic'

interface CircularGameProps {
  players: Player[]
  currentPlayerIndex: number
  isMyTurn: boolean
  onSpinEnd?: (playerId: string) => void
  onTruth?: () => void
  onDare?: () => void
}

const normalize = (angle: number) => ((angle % 360) + 360) % 360

export default function CircularGame({ players, currentPlayerIndex, isMyTurn, onSpinEnd, onTruth, onDare }: CircularGameProps) {
  const [spinning, setSpinning] = useState(false)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const controls = useAnimation()
  const [currentRotation, setCurrentRotation] = useState(0)

  const radius = useMemo(() => {
    if (typeof window === 'undefined') return 140
    const vw = window.innerWidth
    if (vw < 360) return 110
    if (vw < 480) return 130
    return 160
  }, [])

  const positions = useMemo(() => {
    const count = players.length || 1
    const angleStep = 360 / count
    return players.map((_, i) => {
      const angle = i * angleStep - 90
      const rad = (angle * Math.PI) / 180
      const x = Math.cos(rad) * radius
      const y = Math.sin(rad) * radius
      return { x, y, angle }
    })
  }, [players, radius])

  const spin = useCallback(async () => {
    if (spinning || players.length === 0) return
    setSelectedPlayerId(null)
    setSpinning(true)
    resumeAudioContext()
    playSpinSound()
    heavyImpact()

    const spins = 5 + Math.floor(Math.random() * 5)
    const extraDegrees = Math.floor(Math.random() * 360)
    const targetRotation = currentRotation + spins * 360 + extraDegrees
    const finalAngle = normalize(targetRotation)

    await controls.start({
      rotate: targetRotation,
      transition: { duration: 3.2, ease: [0.2, 0.8, 0.3, 1] },
    })

    const count = players.length || 1
    const angleStep = 360 / count
    const normalizedFinal = normalize(360 - finalAngle)
    const selectedIndex = Math.round(normalizedFinal / angleStep) % count
    const selected = players[selectedIndex]

    setCurrentRotation(targetRotation)
    setSelectedPlayerId(selected.id)
    setSpinning(false)
    onSpinEnd?.(selected.id)
  }, [spinning, players, currentRotation, controls, onSpinEnd])

  useEffect(() => {
    if (currentPlayerIndex >= 0 && currentPlayerIndex < players.length) {
      const targetDeg = -positions[currentPlayerIndex].angle
      controls.start({ rotate: targetDeg, transition: { duration: 0.6, ease: 'easeOut' } })
      setCurrentRotation(targetDeg)
    }
  }, [currentPlayerIndex, players.length, positions, controls])

  return (
    <div className="relative flex items-center justify-center w-full" style={{ height: Math.max(420, radius * 2 + 180) }}>
      <div className="relative" style={{ width: radius * 2 + 160, height: radius * 2 + 160 }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-40 h-40 sm:w-52 sm:h-52">
            <div className="absolute inset-0 rounded-full bg-truth/5 border border-border/80" />
            <motion.div className="absolute inset-0 flex items-center justify-center" animate={controls} style={{ rotate: currentRotation }}>
              <img src="/bottle.png" alt="bottle" className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-xl" draggable={false} />
            </motion.div>
          </div>
        </div>

        {players.map((player, i) => {
          const pos = positions[i]
          const isSelected = selectedPlayerId === player.id
          return (
            <div
              key={player.id}
              className={cn(
                'absolute flex flex-col items-center gap-1 transition-all duration-500',
                isSelected && 'z-20'
              )}
              style={{
                left: `calc(50% + ${pos.x}px - 24px)`,
                top: `calc(50% + ${pos.y}px - 24px)`,
              }}
            >
              <div className={cn('relative p-1 rounded-full transition-all', isSelected && 'scale-110')}>
                <Avatar alt={player.nickname} avatarId={player.avatarId} size="md" />
                {isSelected && (
                  <motion.span
                    layoutId="turn-indicator"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-truth bg-truth-light px-2 py-0.5 rounded-full"
                  >
                    your turn
                  </motion.span>
                )}
              </div>
              <span className={cn('text-[11px] font-medium text-text-secondary line-clamp-1', isSelected && 'text-truth')}>
                {player.nickname}
              </span>
            </div>
          )
        })}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {isMyTurn && !spinning && !selectedPlayerId && (
          <Button size="lg" onClick={spin} className="shadow-lg shadow-truth/20">
            Spin the bottle
          </Button>
        )}
        {spinning && <span className="text-sm text-text-secondary">Spinning...</span>}
        {selectedPlayerId && !spinning && (
          <div className="flex items-center gap-2">
            <Button size="lg" onClick={onTruth} className="shadow-lg shadow-truth/20">
              Truth
            </Button>
            <Button size="lg" variant="secondary" onClick={onDare}>
              Dare
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
