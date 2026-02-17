import { useState, useRef, useEffect, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children?: ReactNode;
  variant?: 'underline' | 'pills';
  size?: 'sm' | 'md';
  className?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onTabChange,
  children,
  variant = 'underline',
  size = 'md',
  className,
}: TabsProps) {
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
  }>({ left: 0, width: 0 });
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const tabListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeEl = tabRefs.current.get(activeTab);
    if (activeEl && tabListRef.current) {
      const listRect = tabListRef.current.getBoundingClientRect();
      const tabRect = activeEl.getBoundingClientRect();
      setIndicatorStyle({
        left: tabRect.left - listRect.left,
        width: tabRect.width,
      });
    }
  }, [activeTab, tabs]);

  return (
    <div className={className}>
      {/* Tab list */}
      <div
        ref={tabListRef}
        role="tablist"
        className={cn(
          'relative flex',
          variant === 'underline' && 'border-b border-gray-200 dark:border-gray-700/60 gap-0',
          variant === 'pills' &&
            'bg-white/40 backdrop-blur-sm rounded-lg p-1 gap-1 border border-white/20'
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => {
              if (el) tabRefs.current.set(tab.id, el);
            }}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            disabled={tab.disabled}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'relative inline-flex items-center gap-1.5 font-medium transition-colors duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              size === 'sm' && 'px-3 py-1.5 text-xs',
              size === 'md' && 'px-4 py-2 text-sm',
              variant === 'underline' &&
                (activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'),
              variant === 'pills' &&
                (activeTab === tab.id
                  ? 'text-gray-900 dark:text-gray-100 bg-white/90 dark:bg-dark-raised rounded-md shadow-[var(--shadow-glass-sm)]'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300')
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}

        {/* Animated underline indicator */}
        {variant === 'underline' && (
          <div
            className="absolute bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-200 ease-in-out"
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
            }}
          />
        )}
      </div>

      {/* Tab panels */}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

/* ---------- TabPanel ---------- */

export interface TabPanelProps {
  tabId: string;
  activeTab: string;
  children: ReactNode;
  className?: string;
}

export function TabPanel({
  tabId,
  activeTab,
  children,
  className,
}: TabPanelProps) {
  if (tabId !== activeTab) return null;

  return (
    <div
      id={`tabpanel-${tabId}`}
      role="tabpanel"
      aria-labelledby={tabId}
      className={className}
    >
      {children}
    </div>
  );
}
