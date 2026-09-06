import { useEffect } from 'react'
import { cn } from '../../lib/utils'
import { DismissRegular } from '@fluentui/react-icons'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export default function Drawer({ open, onClose, title, children, className }: DrawerProps) {
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

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <div
            className={cn(
              'absolute bottom-0 left-0 right-0 bg-surface rounded-t-2xl shadow-lg border-t border-border max-h-[80vh] overflow-y-auto transform transition-transform',
              className
            )}
          >
            {title && (
              <div className="sticky top-0 bg-surface border-b border-border px-5 py-4 flex items-center justify-between">
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
      )}
    </>
  )
}
