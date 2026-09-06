import { cn } from '../../lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ className, label, error, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full h-11 px-3 rounded-xl border border-border bg-surface text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-truth focus-visible:ring-offset-2 transition-all',
          error && 'border-red-400 focus-visible:ring-red-400',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
