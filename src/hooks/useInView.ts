import { useRef, useState, useEffect } from 'react'

interface UseInViewOptions {
  threshold?: number
  rootMargin?: string
}

export function useInView(options: UseInViewOptions = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          // Once in view, stop observing (lazy load once)
          observer.unobserve(element)
        }
      },
      {
        threshold: options.threshold ?? 0,
        rootMargin: options.rootMargin ?? '100px',
      }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [options.threshold, options.rootMargin])

  return { ref, isInView }
}
