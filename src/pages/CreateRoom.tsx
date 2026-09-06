import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Chip from '../components/ui/Chip'
import Toggle from '../components/ui/Toggle'
import { cn } from '../lib/utils'
import type { Intensity, Visibility, Topic } from '../types'
import { api } from '../lib/api'
import { GlobeRegular } from '@fluentui/react-icons'

const defaultTopics: Topic[] = [
  { id: 'funny', label: 'Funny' },
  { id: 'friendship', label: 'Friendship' },
  { id: 'memories', label: 'Memories' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'college', label: 'College' },
  { id: 'random', label: 'Random' },
  { id: 'embarrassing', label: 'Embarrassing' },
  { id: 'personal', label: 'Personal' },
  { id: 'creative', label: 'Creative' },
]

const intensityConfig: Record<Intensity, { label: string; description: string; color: string }> = {
  general: { label: 'General', description: 'Light, fun, for everyone', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  close: { label: 'Close', description: 'Personal, friendly, bold', color: 'text-purple-600 bg-purple-50 border-purple-200' },
  deep: { label: 'Deep', description: 'Meaningful, introspective', color: 'text-pink-600 bg-pink-50 border-pink-200' },
}

export default function CreateRoom() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [visibility, setVisibility] = useState<Visibility>('public')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [customTopic, setCustomTopic] = useState('')
  const [intensity, setIntensity] = useState<Intensity>('general')
  const [allowSkipping, setAllowSkipping] = useState(true)
  const [skipsPerPlayer, setSkipsPerPlayer] = useState(3)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!name.trim() || selectedTopics.length === 0 || isLoading) return
    setError('')
    setIsLoading(true)
    try {
      const topics = [...selectedTopics]
      if (customTopic.trim()) {
        topics.push(customTopic.trim())
      }
      const res = await api.createRoom({
        name: name.trim(),
        visibility,
        topics,
        intensity,
        allowSkipping,
        skipsPerPlayer,
        hostName: 'Host',
        hostAvatarId: 'Cat',
      })
      navigate('/host-identity', {
        state: {
          roomCode: res.room.roomCode,
          roomId: res.room.id,
          roomName: res.room.name,
          visibility,
          topics,
          intensity,
          allowSkipping,
          skipsPerPlayer,
          hostId: res.player.id,
        },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    )
  }

  const addCustomTopic = () => {
    if (customTopic.trim() && !selectedTopics.includes(customTopic.trim())) {
      setSelectedTopics((prev) => [...prev, customTopic.trim()])
      setCustomTopic('')
    }
  }

  return (
    <div className="min-h-screen bg-off-white flex flex-col items-center justify-start px-4 sm:px-6 py-10 sm:py-16">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-text-primary mb-3">Create a room</h1>
          <p className="text-base sm:text-lg text-text-secondary">Set it up your way. We'll handle the rest.</p>
        </div>

        <div className="space-y-4 sm:space-y-5">
          <div className="bg-surface border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">Room name</label>
              <Input
                placeholder="Friday Night 🎉"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 sm:h-14 text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-3">Visibility</label>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={cn(
                    'flex items-center gap-3 p-4 sm:p-5 rounded-xl border-2 text-left transition-all',
                    visibility === 'public'
                      ? 'border-truth bg-truth-light shadow-md shadow-truth/10'
                      : 'border-border bg-surface hover:border-lavender/40'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center',
                    visibility === 'public' ? 'bg-truth text-white' : 'bg-off-white text-text-secondary'
                  )}>
                    <GlobeRegular className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-semibold text-text-primary">Public</p>
                    <p className="text-xs sm:text-sm text-text-secondary">Anyone can discover</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('private')}
                  className={cn(
                    'flex items-center gap-3 p-4 sm:p-5 rounded-xl border-2 text-left transition-all',
                    visibility === 'private'
                      ? 'border-truth bg-truth-light shadow-md shadow-truth/10'
                      : 'border-border bg-surface hover:border-lavender/40'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center',
                    visibility === 'private' ? 'bg-truth text-white' : 'bg-off-white text-text-secondary'
                  )}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="sm:w-6 sm:h-6">
                      <rect x="3" y="9" width="14" height="8" rx="2" />
                      <path d="M7 9V6a3 3 0 016 0v3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-semibold text-text-primary">Private</p>
                    <p className="text-xs sm:text-sm text-text-secondary">Invite only</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-text-primary">Topics</label>
              <span className="text-xs text-text-secondary">{selectedTopics.length} selected</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {defaultTopics.map((topic) => (
                <Chip
                  key={topic.id}
                  label={topic.label}
                  selected={selectedTopics.includes(topic.id)}
                  onClick={() => toggleTopic(topic.id)}
                />
              ))}
              {selectedTopics
                .filter((id) => !defaultTopics.find((t) => t.id === id))
                .map((id) => (
                  <Chip
                    key={id}
                    label={id}
                    selected
                    onClick={() => setSelectedTopics((prev) => prev.filter((tid) => tid !== id))}
                  />
                ))}
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Input
                placeholder="+ Add custom topic"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTopic())}
                className="!h-10 sm:!h-12"
              />
              <Button size="sm" variant="secondary" onClick={addCustomTopic} className="px-4 sm:px-6">Add</Button>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 space-y-4 sm:space-y-5">
            <label className="block text-sm font-semibold text-text-primary">Intensity</label>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {(['general', 'close', 'deep'] as Intensity[]).map((level) => {
                const config = intensityConfig[level]
                const isSelected = intensity === level
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setIntensity(level)}
                    className={cn(
                      'p-4 sm:p-5 rounded-xl border-2 text-center transition-all',
                      isSelected
                        ? cn('border-truth shadow-md', config.color)
                        : 'border-border bg-surface hover:border-lavender/40'
                    )}
                  >
                    <span className="block text-sm sm:text-base font-semibold capitalize mb-1">{config.label}</span>
                    <span className="block text-xs sm:text-sm text-text-secondary leading-relaxed">{config.description}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-semibold text-text-primary block">Allow skipping</label>
                <p className="text-xs sm:text-sm text-text-secondary mt-0.5">Players can skip challenges</p>
              </div>
              <Toggle
                checked={allowSkipping}
                onChange={setAllowSkipping}
              />
            </div>
            {allowSkipping && (
              <div className="flex items-center justify-center gap-6 sm:gap-8 pt-2">
                <button
                  type="button"
                  onClick={() => setSkipsPerPlayer((n) => Math.max(1, n - 1))}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-border flex items-center justify-center hover:bg-off-white hover:border-lavender/40 transition-all"
                >
                  <span className="text-xl sm:text-2xl font-semibold text-text-primary">−</span>
                </button>
                <div className="text-center">
                  <span className="block text-3xl sm:text-4xl font-bold text-text-primary">{skipsPerPlayer}</span>
                  <span className="text-xs sm:text-sm text-text-secondary">skips per player</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSkipsPerPlayer((n) => Math.min(10, n + 1))}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-border flex items-center justify-center hover:bg-off-white hover:border-lavender/40 transition-all"
                >
                  <span className="text-xl sm:text-2xl font-semibold text-text-primary">+</span>
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button
            size="lg"
            className="w-full h-14 sm:h-16 text-base sm:text-lg shadow-lg shadow-truth/20"
            onClick={handleCreate}
            disabled={!name.trim() || selectedTopics.length === 0 || isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Room →'}
          </Button>
        </div>
      </div>
    </div>
  )
}
