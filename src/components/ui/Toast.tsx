import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToastStore, type ToastVariant } from '@/hooks/useToast';
import { cn } from '@/utils/cn';

const variantConfig: Record<ToastVariant, { icon: typeof CheckCircle2; bg: string; border: string; text: string }> = {
  success: { icon: CheckCircle2, bg: 'bg-green-50/85 dark:bg-green-900/60', border: 'border-green-200/60 dark:border-green-700/60', text: 'text-green-800 dark:text-green-300' },
  error: { icon: AlertCircle, bg: 'bg-red-50/85 dark:bg-red-900/60', border: 'border-red-200/60 dark:border-red-700/60', text: 'text-red-800 dark:text-red-300' },
  info: { icon: Info, bg: 'bg-blue-50/85 dark:bg-blue-900/60', border: 'border-blue-200/60 dark:border-blue-700/60', text: 'text-blue-800 dark:text-blue-300' },
  warning: { icon: AlertTriangle, bg: 'bg-yellow-50/85 dark:bg-yellow-900/60', border: 'border-yellow-200/60 dark:border-yellow-700/60', text: 'text-yellow-800 dark:text-yellow-300' },
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = variantConfig[toast.variant];
          const Icon = config.icon;

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={cn(
                'pointer-events-auto flex items-center gap-3 rounded-xl border backdrop-blur-lg px-4 py-3 shadow-[var(--shadow-glass-lg)] min-w-[280px] max-w-[400px]',
                config.bg,
                config.border,
              )}
            >
              <Icon className={cn('h-5 w-5 shrink-0', config.text)} />
              <p className={cn('text-sm font-medium flex-1', config.text)}>{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className={cn('shrink-0 rounded-md p-0.5 transition-colors hover:bg-black/5', config.text)}
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
