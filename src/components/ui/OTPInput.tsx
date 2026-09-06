import { useState, useRef, useEffect } from 'react'

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
}

export default function OTPInput({ length = 6, value, onChange, onComplete }: OTPInputProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (value.length >= length && onComplete) {
      onComplete(value)
    }
  }, [value, length, onComplete])

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const char = e.target.value.slice(-1).toUpperCase()
    if (!/^[A-Z0-9]$/.test(char)) return

    const newValue = value.split('')
    newValue[index] = char
    onChange(newValue.join(''))

    if (index < length - 1) {
      setActiveIndex(index + 1)
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      setActiveIndex(index - 1)
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, length)
    onChange(pasted)
    setActiveIndex(Math.min(pasted.length, length - 1))
    inputsRef.current[Math.min(pasted.length, length - 1)]?.focus()
  }

  return (
    <div className="flex gap-2 sm:gap-3 justify-center">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => { inputsRef.current[index] = el }}
          type="text"
          maxLength={1}
          inputMode="text"
          autoComplete="off"
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => setActiveIndex(index)}
          className={cn(
            'w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-semibold text-text-primary bg-surface border-2 rounded-xl transition-all',
            activeIndex === index
              ? 'border-truth shadow-lg shadow-truth/20'
              : 'border-border hover:border-lavender/40',
            value[index] && 'border-truth/60'
          )}
        />
      ))}
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
