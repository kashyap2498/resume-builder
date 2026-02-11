import { Modal } from './Modal'

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)
const MOD = isMac ? 'Cmd' : 'Ctrl'

const SHORTCUTS = [
  { keys: [MOD, 'S'], description: 'Save & export JSON' },
  { keys: [MOD, 'P'], description: 'Export PDF' },
  { keys: [MOD, 'Shift', 'D'], description: 'Export DOCX' },
  { keys: [MOD, 'Z'], description: 'Undo' },
  { keys: [MOD, 'Shift', 'Z'], description: 'Redo' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export function KeyboardShortcutsModal({ open, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} title="Keyboard Shortcuts" size="sm">
      <div className="space-y-2">
        {SHORTCUTS.map((s, i) => (
          <div key={i} className="flex items-center justify-between py-1.5">
            <span className="text-sm text-gray-600">{s.description}</span>
            <div className="flex items-center gap-1">
              {s.keys.map((k) => (
                <kbd
                  key={k}
                  className="inline-flex items-center rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs font-mono text-gray-600"
                >
                  {k}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-gray-500">
        {isMac ? 'Using Cmd as the modifier key.' : 'On Mac, use Cmd instead of Ctrl.'}
      </p>
    </Modal>
  )
}
