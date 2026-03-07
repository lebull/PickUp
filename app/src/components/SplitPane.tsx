import { useRef, useState, useEffect, useCallback } from 'react'

interface Props {
  /** Initial left pane width as a percentage of total container width */
  initialSplit?: number
  /** Minimum left pane width in percent (default 10) */
  minLeft?: number
  /** Minimum right pane width in percent (default 10) */
  minRight?: number
  children: [React.ReactNode, React.ReactNode]
}

export function SplitPane({ initialSplit = 50, minLeft = 10, minRight = 10, children }: Props) {
  const [split, setSplit] = useState(initialSplit)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragging.current || !containerRef.current) return
      e.preventDefault()
      const rect = containerRef.current.getBoundingClientRect()
      const rawPct = ((e.clientX - rect.left) / rect.width) * 100
      const clamped = Math.min(Math.max(rawPct, minLeft), 100 - minRight)
      setSplit(clamped)
    },
    [minLeft, minRight]
  )

  const onPointerUp = useCallback(() => {
    if (!dragging.current) return
    dragging.current = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
  }, [onPointerMove])

  function onDividerPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault()
    dragging.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    ;(e.target as HTMLDivElement).setPointerCapture(e.pointerId)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [onPointerMove, onPointerUp])

  return (
    <div className="split-pane" ref={containerRef}>
      <div className="split-pane-left" style={{ flexBasis: `${split}%` }}>
        {children[0]}
      </div>
      <div
        className="split-pane-divider"
        onPointerDown={onDividerPointerDown}
        aria-hidden="true"
      />
      <div className="split-pane-right">
        {children[1]}
      </div>
    </div>
  )
}
