import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import type { Player, GameState } from '../../types'
import Avatar from '../avatars/Avatar'
import Button from '../ui/Button'
import { cn } from '../../lib/utils'
import { playSpinSound, resumeAudioContext } from '../../lib/sound'
import { heavyImpact, successImpact } from '../../lib/haptic'
import { api } from '../../lib/api'

interface CircularGameProps {
  players: Player[]
  currentPlayerIndex: number
  isMyTurn: boolean
  game: GameState | null
  roomId?: string
  onSpinEnd?: (playerId: string) => void
  onTruth?: () => void
  onDare?: () => void
  hapticsEnabled?: boolean
}

const normalize = (angle: number) => ((angle % 360) + 360) % 360

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export default function CircularGame({ players, currentPlayerIndex, isMyTurn, game, roomId, onSpinEnd, onTruth, onDare, hapticsEnabled = true }: CircularGameProps) {
  const [spinning, setSpinning] = useState(false)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const controls = useAnimation()
  const [currentRotation, setCurrentRotation] = useState(0)
  const remoteSpinRef = useRef<{ playerId: string; targetRotation: number } | null>(null)

  const size = useMemo(() => {
    if (typeof window === 'undefined') return 440
    const vw = window.innerWidth
    if (vw < 360) return 340
    if (vw < 480) return 380
    return 440
  }, [])

  const center = size / 2
  const tableRadius = size / 2 - 24
  const bottleSize = Math.max(72, size * 0.22)

  const radius = useMemo(() => {
    return tableRadius - bottleSize / 2 - 24
  }, [tableRadius, bottleSize])

  const positions = useMemo(() => {
    const count = players.length || 1
    const angleStep = 360 / count
    return players.map((_, i) => {
      const angle = i * angleStep
      return { angle }
    })
  }, [players])

  const triggerHaptic = useCallback((fn: () => void) => {
    if (hapticsEnabled) fn()
  }, [hapticsEnabled])

  const spin = useCallback(async () => {
    if (spinning || players.length === 0) return
    setSelectedPlayerId(null)
    setSpinning(true)
    triggerHaptic(resumeAudioContext)
    triggerHaptic(playSpinSound)
    triggerHaptic(heavyImpact)

    const spins = 6 + Math.floor(Math.random() * 6)
    const extraDegrees = Math.floor(Math.random() * 360)
    const targetRotation = currentRotation + spins * 360 + extraDegrees

    if (roomId) {
      try {
        await api.startSpin(roomId, '', targetRotation)
      } catch {
        // ignore sync error, spin still plays locally
      }
    }

    await controls.start({
      rotate: targetRotation,
      transition: { duration: 3.8, ease: [0.15, 0.85, 0.25, 1] },
    })

    const count = players.length || 1
    const angleStep = 360 / count
    const finalAngle = normalize(targetRotation)
    const normalizedFinal = normalize(360 - finalAngle)
    const selectedIndex = Math.round(normalizedFinal / angleStep) % count
    const selected = players[selectedIndex]

    setCurrentRotation(targetRotation)
    setSelectedPlayerId(selected.id)
    setSpinning(false)
    triggerHaptic(successImpact)
    onSpinEnd?.(selected.id)

    if (roomId) {
      try {
        await api.clearSpin(roomId)
      } catch {
        // ignore
      }
    }
  }, [spinning, players, currentRotation, controls, onSpinEnd, triggerHaptic])

  useEffect(() => {
    if (!game) return
    const remoteSpinningId = game.spinningPlayerId
    const remoteRotation = game.spinRotation

    if (remoteSpinningId && remoteRotation !== null && remoteRotation !== undefined && !spinning) {
      remoteSpinRef.current = { playerId: remoteSpinningId, targetRotation: remoteRotation }
      setSpinning(true)
      setSelectedPlayerId(null)
      triggerHaptic(resumeAudioContext)
      triggerHaptic(playSpinSound)
      triggerHaptic(heavyImpact)

      controls.start({
        rotate: remoteRotation,
        transition: { duration: 3.8, ease: [0.15, 0.85, 0.25, 1] },
      }).then(() => {
        const count = players.length || 1
        const angleStep = 360 / count
        const finalAngle = normalize(remoteRotation)
        const normalizedFinal = normalize(360 - finalAngle)
        const selectedIndex = Math.round(normalizedFinal / angleStep) % count
        const selected = players[selectedIndex]

        setCurrentRotation(remoteRotation)
        setSelectedPlayerId(selected.id)
        setSpinning(false)
        triggerHaptic(successImpact)
        onSpinEnd?.(selected.id)
        remoteSpinRef.current = null
      })
    } else if (!remoteSpinningId && spinning && remoteSpinRef.current) {
      remoteSpinRef.current = null
    }
  }, [game?.spinningPlayerId, game?.spinRotation, spinning, players.length, controls, onSpinEnd, triggerHaptic])

  useEffect(() => {
    if (currentPlayerIndex >= 0 && currentPlayerIndex < players.length && !spinning && !remoteSpinRef.current) {
      const targetDeg = -positions[currentPlayerIndex].angle
      controls.start({ rotate: targetDeg, transition: { duration: 0.6, ease: 'easeOut' } })
      setCurrentRotation(targetDeg)
    }
  }, [currentPlayerIndex, players.length, positions, controls, spinning])

  const selectedIndex = players.findIndex((p) => p.id === selectedPlayerId)
  const selectedAngle = selectedIndex >= 0 ? positions[selectedIndex].angle : null

  return (
    <div className="relative flex flex-col items-center justify-center w-full" style={{ height: size + 140 }}>
      <div className="relative" style={{ width: size, height: size }}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-surface to-off-white border border-border shadow-xl shadow-truth/5" />

        <div className="absolute inset-4 rounded-full border border-border/60" />

        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
          {positions.map((pos, i) => {
            const start = polarToCartesian(center, center, 36, pos.angle)
            const end = polarToCartesian(center, center, radius, pos.angle)
            const isSelected = selectedPlayerId === players[i]?.id
            return (
              <line
                key={i}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={isSelected ? '#ec4899' : '#e5e7eb'}
                strokeWidth={isSelected ? 3 : 1.5}
                strokeDasharray={isSelected ? '0' : '4 4'}
                className={cn('transition-all duration-500', isSelected && 'drop-shadow-sm')}
              />
            )
          })}
        </svg>

        {selectedPlayerId && selectedAngle !== null && (
          <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
            {(() => {
              const start = polarToCartesian(center, center, 36, selectedAngle)
              const end = polarToCartesian(center, center, radius + 28, selectedAngle)
              return (
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="#ec4899"
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  className="animate-pulse"
                />
              )
            })()}
          </svg>
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative" style={{ width: bottleSize, height: bottleSize }}>
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={controls}
              style={{ rotate: currentRotation }}
            >
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-truth/10 blur-xl transition-opacity duration-500" />
                <img
                  src="/bottle.png"
                  alt="bottle"
                  className="relative w-full h-full object-contain drop-shadow-2xl"
                  draggable={false}
                />
              </div>
            </motion.div>
          </div>
        </div>

        {players.map((player, i) => {
          const pos = positions[i]
          const p = polarToCartesian(center, center, radius, pos.angle)
          const isSelected = selectedPlayerId === player.id
          return (
            <div
              key={player.id}
              className={cn(
                'absolute flex flex-col items-center gap-1 transition-all duration-500',
                isSelected && 'z-20'
              )}
              style={{
                left: p.x - 28,
                top: p.y - 28,
              }}
            >
              <div className={cn('relative p-1 rounded-full transition-all', isSelected && 'scale-110')}>
                <div className={cn('absolute -inset-1 rounded-full transition-opacity duration-500', isSelected ? 'bg-truth/20 animate-pulse' : 'bg-transparent')} />
                <Avatar alt={player.nickname} avatarId={player.avatarId} size="md" />
                {isSelected && (
                  <motion.span
                    layoutId="turn-indicator"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-white bg-truth px-2 py-0.5 rounded-full whitespace-nowrap shadow-md shadow-truth/30"
                  >
                    your turn
                  </motion.span>
                )}
              </div>
              <span className={cn('text-[11px] font-medium text-text-secondary line-clamp-1 max-w-[60px] text-center', isSelected && 'text-truth font-semibold')}>
                {player.nickname}
              </span>
            </div>
          )
        })}

        <div
          className="absolute z-20"
          style={{
            left: center - 14,
            top: 8,
            width: 28,
            height: 28,
          }}
        >
          <svg viewBox="0 0 28 28" className="w-full h-full drop-shadow-lg">
            <path d="M14 26 L6 4 L14 10 L22 4 Z" fill="#ec4899" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
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
