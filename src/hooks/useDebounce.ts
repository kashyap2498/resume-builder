// =============================================================================
// Resume Builder - Debounce Hook
// =============================================================================
// Delays updating a value until a specified time has elapsed since the last
// change. Useful for search inputs, auto-save triggers, and similar scenarios.

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
