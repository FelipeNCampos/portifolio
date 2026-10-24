import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { vertices, edges, offsets, pathDistances, vertexIcons } from './networkGraph'
import { NetworkIcon } from './NetworkIcon'
const signalSpeed = 190
const viewBoxWidth = 700
const viewBoxHeight = 520
const signalStyle = (distance: number): CSSProperties => ({ '--impulse-delay': `${distance / signalSpeed}s` } as CSSProperties)

interface NetworkPulseProps {
  readonly roleRef?: RefObject<HTMLElement | null>
  readonly mirrored?: boolean
  readonly originIcon?: 'wifi'
}

export function NetworkPulse({ roleRef, mirrored = false, originIcon }: NetworkPulseProps) {
  const glowId = `network-glow-${useId()}`
  const rootRef = useRef<HTMLDivElement>(null)
  const [origin, setOrigin] = useState({ connectorX: -400, y: 90 })

  useLayoutEffect(() => {
    const root = rootRef.current
    const role = roleRef?.current
    if (!root || !role) return

    const measure = () => {
      const rootBox = root.getBoundingClientRect()
      const roleBox = role.getBoundingClientRect()
      setOrigin({
        connectorX: (roleBox.right - rootBox.left) * viewBoxWidth / rootBox.width,
        y: (roleBox.top + roleBox.height / 2 - rootBox.top) * viewBoxHeight / rootBox.height,
      })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    observer.observe(role)
    return () => observer.disconnect()
  }, [roleRef])

  const positionFor = (id: string) => {
    const offset = offsets.get(id)!
    return { x: mirrored ? viewBoxWidth - offset.x : offset.x, y: origin.y + offset.y }
  }

  const bridge = positionFor('bridge')
  const viewportPadding = originIcon && !roleRef ? 30 : 0

  return (
    <div className="network-pulse" ref={rootRef} aria-hidden="true">
      <svg className="network-graph" viewBox={`${-viewportPadding} 0 ${viewBoxWidth + viewportPadding * 2} ${viewBoxHeight}`} preserveAspectRatio="none">
        <defs>
          <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.34" />
            <stop offset="48%" stopColor="#dbe8f5" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#dbe8f5" stopOpacity="0" />
          </radialGradient>
        </defs>
        {roleRef && <line className="graph-connector" x1={origin.connectorX} x2={bridge.x} y1={origin.y} y2={origin.y} />}
        <circle className="graph-origin-glow" fill={`url(#${glowId})`} cx={bridge.x} cy={bridge.y} r="82" />
        <g className="graph-edges">
          {edges.map(([from, to]) => {
            const start = positionFor(from)
            const end = positionFor(to)
            return (
              <line
                className="graph-edge"
                key={`${from}-${to}`}
                style={signalStyle(pathDistances.get(from)!)}
                x1={start.x}
                x2={end.x}
                y1={start.y}
                y2={end.y}
              />
            )
          })}
        </g>
        <g className="graph-origin-waves">
          <circle className="graph-origin-wave" cx={bridge.x} cy={bridge.y} r="9" />
          <circle className="graph-origin-wave graph-origin-wave-delayed" cx={bridge.x} cy={bridge.y} r="9" />
        </g>
        <g className="graph-vertices">
          {vertices.map(([id]) => {
            const point = positionFor(id)
            const kind = id === 'bridge' ? originIcon : vertexIcons[id]
            if (kind) return (
              <g className="graph-icon-node" key={id} data-vertex={id} data-kind={kind} transform={`translate(${point.x} ${point.y})`}>
                <circle className="graph-icon-backplate" r="25" />
                <g className="graph-icon-pulse" style={signalStyle(pathDistances.get(id)!)}>
                  <NetworkIcon kind={kind} />
                </g>
              </g>
            )
            return (
              <circle
                className={`graph-vertex graph-vertex-${id}`}
                cx={point.x}
                cy={point.y}
                key={id}
                r={id === 'bridge' ? 6.5 : id === 'hub' ? 5.5 : 4.25}
                style={signalStyle(pathDistances.get(id)!)}
              />
            )
          })}
        </g>
      </svg>
    </div>
  )
}
