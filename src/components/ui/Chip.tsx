import { cn } from '../../lib/utils'

interface ChipProps {
  label: string
  selected?: boolean
  onClick?: () => void
  className?: string
}

export default function Chip({ label, selected, onClick, className }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-4 py-1.5 rounded-full text-sm font-medium transition-all border',
        selected
          ? 'bg-truth-light border-truth text-truth shadow-sm shadow-truth/10'
          : 'bg-surface border-border text-text-secondary hover:border-lavender hover:text-text-primary',
        className
      )}
    >
      {label}
    </button>
  )
}
