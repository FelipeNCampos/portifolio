import { useEffect, useRef, useState, type ReactNode } from 'react'
import { NetworkPulse } from './NetworkPulse'

export function SectionIntro({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    let inView = false
    const update = () => setActive(inView && !document.hidden)
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      update()
    }, { rootMargin: '80px 0px' })
    observer.observe(root)
    document.addEventListener('visibilitychange', update)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

  return <div className="section-intro" ref={rootRef} data-active={active}>
    <div className="section-network section-network-left" aria-hidden="true"><NetworkPulse mirrored originIcon="wifi" /></div>
    {children}
    <div className="section-network section-network-right" aria-hidden="true"><NetworkPulse originIcon="wifi" /></div>
  </div>
}
