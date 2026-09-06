import { cn } from '../../lib/utils'
import { DismissRegular } from '@fluentui/react-icons'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  label?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'ghost' | 'primary'
}

export default function IconButton({
  className,
  icon,
  label,
  size = 'md',
  variant = 'default',
  ...props
}: IconButtonProps) {
  const sizes = {
    sm: 'h-9 w-9',
    md: 'h-11 w-11',
    lg: 'h-12 w-12',
  }

  const variants = {
    default: 'bg-surface border border-border hover:bg-off-white hover:border-text-secondary/40',
    ghost: 'bg-transparent hover:bg-off-white',
    primary: 'bg-truth text-white hover:shadow-lg hover:shadow-truth/20',
  }

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded-full transition-all',
        sizes[size],
        variants[variant],
        className
      )}
      aria-label={label}
      {...props}
    >
      {icon}
    </button>
  )
}

export { DismissRegular }
