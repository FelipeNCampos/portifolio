import { useEffect, useRef, type ReactNode } from 'react'

/** Content stays readable when observers or animation APIs are unavailable. */
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element || !('IntersectionObserver' in window) || !element.animate) return
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let animation: Animation | undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      if (!preference.matches) {
        animation = element.animate([
          { opacity: 0, transform: 'perspective(1000px) translateY(18px) rotateX(5deg)' },
          { opacity: 1, transform: 'perspective(1000px) translateY(0) rotateX(0)' },
        ], { duration: 600, delay, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'backwards' })
      }
      observer.unobserve(element)
    }, { threshold: 0.12 })
    const stopForReducedMotion = () => { if (preference.matches) animation?.cancel() }
    preference.addEventListener('change', stopForReducedMotion)
    observer.observe(element)
    return () => {
      observer.disconnect()
      animation?.cancel()
      preference.removeEventListener('change', stopForReducedMotion)
    }
  }, [delay])

  return <div ref={ref} className="reveal-surface">{children}</div>
}
