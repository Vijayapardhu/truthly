import { cn } from '../../lib/utils'

interface AvatarProps {
  src?: string
  alt?: string
  avatarId?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children?: React.ReactNode
}

const avatarColors: Record<string, string> = {
  Cat: 'bg-lavender',
  Panda: 'bg-pink',
  Tiger: 'bg-blue',
  Pig: 'bg-peach',
  Monkey: 'bg-lavender-light',
  Bear: 'bg-pink-light',
  Wolf: 'bg-blue-light',
  Octopus: 'bg-lavender',
}

const avatarIcons: Record<string, string> = {
  Cat: 'https://img.icons8.com/?size=100&id=YFj3GqUYUMFG&format=png&color=000000',
  Tiger: 'https://img.icons8.com/?size=100&id=gtx2QwlbvAak&format=png&color=000000',
  Panda: 'https://img.icons8.com/?size=100&id=FoHlPqi8UWA4&format=png&color=000000',
  Pig: 'https://img.icons8.com/?size=100&id=oqU9v0qr6rN2&format=png&color=000000',
  Monkey: 'https://img.icons8.com/?size=100&id=OeuhdvhfDwcF&format=png&color=000000',
  Bear: 'https://img.icons8.com/?size=100&id=VbxKFvBFUSfq&format=png&color=000000',
  Wolf: 'https://img.icons8.com/?size=100&id=4Qa6Rr564oJR&format=png&color=000000',
  Octopus: 'https://img.icons8.com/?size=100&id=ruNhag1HeD0V&format=png&color=000000',
}

const sizes = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-16 w-16 text-base',
}

export default function Avatar({ src, alt, avatarId, size = 'md', className, children }: AvatarProps) {
  const iconSrc = src || (avatarId ? avatarIcons[avatarId] : undefined)

  if (iconSrc) {
    return (
      <img
        src={iconSrc}
        alt={alt || avatarId}
        className={cn('rounded-full object-cover', sizes[size], className)}
      />
    )
  }

  const label = alt?.charAt(0).toUpperCase() || '?'

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center',
        sizes[size],
        avatarId ? avatarColors[avatarId] || 'bg-surface' : 'bg-surface',
        className
      )}
    >
      {children || <span className="font-semibold text-text-primary">{label}</span>}
    </div>
  )
}
