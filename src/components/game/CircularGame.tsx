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
    if (typeof window === 'undefined') return 460
    const vw = window.innerWidth
    if (vw < 360) return 360
    if (vw < 480) return 400
    return 460
  }, [])

  const center = size / 2
  const tableRadius = size / 2 - 20
  const bottleSize = Math.max(80, size * 0.24)

  const radius = useMemo(() => {
    return tableRadius - bottleSize / 2 - 32
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
  }, [spinning, players, currentRotation, controls, onSpinEnd, triggerHaptic, roomId])

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
    <div className="relative flex flex-col items-center justify-center w-full" style={{ height: size + 160 }}>
      <div className="relative" style={{ width: size, height: size }}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-surface via-off-white to-surface border-2 border-border shadow-2xl shadow-truth/10" />

        <div className="absolute inset-6 rounded-full border border-border/40" />

        <div className="absolute inset-0 rounded-full" style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(236,72,153,0.04) 0%, transparent 60%)'
        }} />

        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
          {positions.map((pos, i) => {
            const start = polarToCartesian(center, center, 38, pos.angle)
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
                strokeWidth={isSelected ? 2.5 : 1.5}
                strokeDasharray={isSelected ? '0' : '3 4'}
                className={cn('transition-all duration-500', isSelected && 'drop-shadow-sm')}
              />
            )
          })}
        </svg>

        {selectedPlayerId && selectedAngle !== null && (
          <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
            {(() => {
              const start = polarToCartesian(center, center, 38, selectedAngle)
              const end = polarToCartesian(center, center, radius + 24, selectedAngle)
              return (
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="#ec4899"
                  strokeWidth={3}
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
                <div className="absolute -inset-6 rounded-full bg-truth/15 blur-2xl transition-opacity duration-500" />
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
                'absolute flex flex-col items-center gap-1.5 transition-all duration-500',
                isSelected && 'z-20'
              )}
              style={{
                left: p.x - 30,
                top: p.y - 30,
              }}
            >
              <div className={cn('relative p-1.5 rounded-full transition-all', isSelected && 'scale-110')}>
                <div className={cn('absolute -inset-1.5 rounded-full transition-opacity duration-500', isSelected ? 'bg-truth/25 animate-pulse' : 'bg-transparent')} />
                <Avatar alt={player.nickname} avatarId={player.avatarId} size="md" />
                {isSelected && (
                  <motion.span
                    layoutId="turn-indicator"
                    className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-white bg-truth px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-lg shadow-truth/40"
                  >
                    your turn
                  </motion.span>
                )}
              </div>
              <span className={cn('text-[11px] font-medium text-text-secondary line-clamp-1 max-w-[64px] text-center', isSelected && 'text-truth font-bold')}>
                {player.nickname}
              </span>
            </div>
          )
        })}

        <div
          className="absolute z-20"
          style={{
            left: center - 16,
            top: 6,
            width: 32,
            height: 32,
          }}
        >
          <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-xl">
            <path d="M16 30 L5 4 L13 12 L16 6 L19 12 L27 4 Z" fill="#ec4899" stroke="white" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        {isMyTurn && !spinning && !selectedPlayerId && (
          <Button size="lg" onClick={spin} className="shadow-lg shadow-truth/20">
            Spin the bottle
          </Button>
        )}
        {spinning && <span className="text-sm text-text-secondary">Spinning...</span>}
        {isMyTurn && selectedPlayerId && !spinning && (
          <div className="flex items-center gap-3">
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
