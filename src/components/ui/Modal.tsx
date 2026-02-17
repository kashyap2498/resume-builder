import { type ReactNode, useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}

const sizeStyles: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 400, damping: 30 },
  },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } },
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className,
  closeOnBackdrop = true,
  closeOnEscape = true,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);
  const titleId = useId();

  // Save the previously focused element when modal opens; restore on close
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement;
    } else if (previousFocusRef.current) {
      const el = previousFocusRef.current as HTMLElement;
      previousFocusRef.current = null;
      // Restore after a microtask so the modal has time to unmount
      requestAnimationFrame(() => el?.focus?.());
    }
  }, [open]);

  // Focus trap and Escape key handling
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
        return;
      }

      if (e.key === 'Tab' && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift+Tab: if focus is on first element, wrap to last
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: if focus is on last element, wrap to first
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, closeOnEscape]);

  // Focus first focusable element when modal opens
  useEffect(() => {
    if (!open || !panelRef.current) return;

    // Small delay to let the animation start and DOM settle
    const timerId = setTimeout(() => {
      if (!panelRef.current) return;
      const firstFocusable = panelRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }, 50);

    return () => clearTimeout(timerId);
  }, [open]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/30 backdrop-blur-md"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            onClick={closeOnBackdrop ? onClose : undefined}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-label={title ? undefined : 'Dialog'}
            className={cn(
              'relative z-10 w-full rounded-2xl bg-white/92 dark:bg-dark-overlay backdrop-blur-xl shadow-[var(--shadow-glass-xl)] border border-gray-200 dark:border-dark-edge',
              sizeStyles[size],
              className
            )}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-dark-edge px-6 py-4">
                <h2 id={titleId} className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className={cn(
                    'rounded-lg p-1.5 text-gray-500 transition-colors',
                    'hover:bg-white/60 hover:text-gray-700',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
                  )}
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Close button when no title */}
            {!title && (
              <button
                onClick={onClose}
                className={cn(
                  'absolute right-3 top-3 rounded-lg p-1.5 text-gray-500 transition-colors',
                  'hover:bg-gray-100 hover:text-gray-600',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
                )}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {/* Body */}
            <div className="px-6 py-4">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="border-t border-gray-200 dark:border-dark-edge px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
