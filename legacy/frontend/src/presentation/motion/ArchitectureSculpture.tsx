import { memo, useEffect, useRef } from 'react'
import './motion.css'

const faces = ['top', 'bottom', 'front', 'back', 'left', 'right'] as const

/** CSS geometry keeps the decorative scene independent of WebGL and asset loading. */
export const ArchitectureSculpture = memo(function ArchitectureSculpture() {
  const scene = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = scene.current
    if (!element || !('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(([entry]) => {
      element.dataset.offscreen = String(!entry.isIntersecting)
    })
    observer.observe(element)
    const updateVisibility = () => { element.dataset.hidden = String(document.hidden) }
    document.addEventListener('visibilitychange', updateVisibility)
    updateVisibility()

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', updateVisibility)
    }
  }, [])

  return (
    <div className="sculpture" ref={scene}>
      <div className="sculpture-art" aria-hidden="true">
        <div className="sculpture-shadow" />
        <div className="sculpture-world">
          {['foundation', 'logic', 'experience'].map((layer) => (
            <div key={layer} className={`sculpture-slab slab-${layer}`}>
              {faces.map((face) => (
                <div key={face} className={`slab-face face-${face}`}>
                  {face === 'top' && layer === 'experience' && <span className="sculpture-symbol">{'{ }'}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})
