import { cn } from '../../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export default function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium transition-all touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-truth focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
  const variants = {
    primary: 'bg-truth text-white hover:shadow-lg hover:shadow-truth/20 hover:translate-y-[-1px]',
    secondary: 'bg-surface border border-border text-text-primary hover:bg-off-white hover:border-text-secondary/40',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-off-white',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  }
  const sizes = {
    sm: 'h-9 px-4 text-sm rounded-lg',
    md: 'h-11 px-5 text-sm rounded-xl',
    lg: 'h-12 px-6 text-base rounded-xl',
  }

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  )
}
