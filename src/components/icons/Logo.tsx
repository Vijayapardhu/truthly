import { cn } from '../../lib/utils'

interface LogoProps {
  className?: string
}

export default function Logo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 200 44" className={cn('h-10 w-auto', className)} aria-label="truthly">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="7" fill="url(#logoGrad)" />
      <text x="16" y="21" fontSize="15" fontWeight="700" textAnchor="middle" fill="white" fontFamily="Inter, system-ui, sans-serif">
        T
      </text>
      <text x="40" y="28" fontSize="22" fontWeight="700" fill="#1c1917" fontFamily="Matcha Mint, cursive">
        truthly
      </text>
    </svg>
  )
}
