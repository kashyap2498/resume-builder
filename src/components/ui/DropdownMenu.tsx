import { useState, useRef, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreVertical } from 'lucide-react'

export interface DropdownMenuItem {
  label: string
  icon?: ReactNode
  onClick: () => void
  variant?: 'default' | 'danger'
  disabled?: boolean
}

interface DropdownMenuProps {
  items: DropdownMenuItem[]
  trigger?: ReactNode
}

export function DropdownMenu({ items, trigger }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen(!open)
        }}
        className="relative z-10 rounded-lg p-2 -m-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-dark-raised dark:hover:text-gray-300 transition-colors"
      >
        {trigger ?? <MoreVertical className="h-4 w-4" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-gray-200 dark:border-dark-edge bg-white/95 dark:bg-dark-overlay backdrop-blur-xl shadow-[var(--shadow-glass-lg)] py-1 z-50"
          >
            {items.map((item, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation()
                  setOpen(false)
                  item.onClick()
                }}
                disabled={item.disabled}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors disabled:opacity-50 ${
                  item.variant === 'danger'
                    ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-raised'
                }`}
              >
                {item.icon && (
                  <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{item.icon}</span>
                )}
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
