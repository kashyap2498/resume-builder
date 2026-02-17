import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, FileText, LogOut } from 'lucide-react'

interface ResumeResult {
  id: string
  name: string
  templateName: string
  timeAgo: string
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  resumes: ResumeResult[]
  onSelectResume: (id: string) => void
  onCreateResume: () => void
  onSignOut: () => void
}

export function CommandPalette({
  open,
  onClose,
  resumes,
  onSelectResume,
  onCreateResume,
  onSignOut,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Build filtered items
  const filteredResumes = query.trim()
    ? resumes.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()))
    : resumes

  type ActionItem = { type: 'action'; id: string; label: string; icon: typeof Plus; onSelect: () => void }
  type ResumeItem = { type: 'resume'; data: ResumeResult }

  const items: (ActionItem | ResumeItem)[] = [
    ...((!query.trim() || 'create new resume'.includes(query.toLowerCase()))
      ? [{ type: 'action' as const, id: 'create', label: 'Create New Resume', icon: Plus, onSelect: onCreateResume }]
      : []),
    ...filteredResumes.map((r) => ({ type: 'resume' as const, data: r })),
    ...((!query.trim() || 'sign out'.includes(query.toLowerCase()))
      ? [{ type: 'action' as const, id: 'signout', label: 'Sign Out', icon: LogOut, onSelect: onSignOut }]
      : []),
  ]

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  // Reset query when opening
  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return
    const activeEl = listRef.current.children[activeIndex] as HTMLElement | undefined
    activeEl?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const handleSelect = useCallback(
    (index: number) => {
      const item = items[index]
      if (!item) return
      onClose()
      if (item.type === 'action') {
        item.onSelect()
      } else {
        onSelectResume(item.data.id)
      }
    },
    [items, onClose, onSelectResume],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setActiveIndex((prev) => (prev + 1) % Math.max(items.length, 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setActiveIndex((prev) => (prev - 1 + items.length) % Math.max(items.length, 1))
          break
        case 'Enter':
          e.preventDefault()
          handleSelect(activeIndex)
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    },
    [items.length, activeIndex, handleSelect, onClose],
  )

  if (!open) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="relative z-10 w-full max-w-lg rounded-2xl bg-white/95 dark:bg-dark-overlay backdrop-blur-xl shadow-[var(--shadow-glass-xl)] border border-gray-200 dark:border-dark-edge overflow-hidden"
            onKeyDown={handleKeyDown}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-dark-edge">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search resumes or type a command..."
                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-dark-raised rounded border border-gray-200 dark:border-dark-edge">
                ESC
              </kbd>
            </div>

            {/* Results list */}
            <div ref={listRef} className="max-h-72 overflow-y-auto py-2">
              {items.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                  No results found
                </div>
              )}
              {items.map((item, i) => {
                const isActive = i === activeIndex
                if (item.type === 'action') {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(i)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  )
                } else {
                  return (
                    <button
                      key={item.data.id}
                      onClick={() => handleSelect(i)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <FileText className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                      <div className="flex-1 text-left">
                        <span className="font-medium">{item.data.name}</span>
                        <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                          {item.data.templateName} &middot; {item.data.timeAgo}
                        </span>
                      </div>
                    </button>
                  )
                }
              })}
            </div>

            {/* Footer hint */}
            <div className="border-t border-gray-200 dark:border-dark-edge px-4 py-2 flex items-center gap-4 text-[11px] text-gray-400 dark:text-gray-500">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-dark-raised rounded text-[10px]">&uarr;&darr;</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-dark-raised rounded text-[10px]">&crarr;</kbd>
                select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-dark-raised rounded text-[10px]">esc</kbd>
                close
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
