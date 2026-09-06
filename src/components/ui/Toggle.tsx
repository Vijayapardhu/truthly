import { cn } from '../../lib/utils'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  className?: string
}

export default function Toggle({ checked, onChange, label, className }: ToggleProps) {
  return (
    <label className={cn('inline-flex items-center gap-3 cursor-pointer', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-7 w-12 items-center rounded-full transition-all',
          checked ? 'bg-truth shadow-sm shadow-truth/20' : 'bg-border'
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-all',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
      {label && <span className="text-sm text-text-primary font-medium">{label}</span>}
    </label>
  )
}
