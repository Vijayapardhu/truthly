import { useEffect } from 'react'
import { cn } from '../../lib/utils'
import { DismissRegular } from '@fluentui/react-icons'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export default function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative bg-surface rounded-2xl shadow-lg border border-border max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto',
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-off-white transition-colors"
            >
              <DismissRegular className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
