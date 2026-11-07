import type { CSSProperties } from 'react'

const EDGE_PADDING_PX = 8
const OFFSET_PX = 6

/**
 * Positions peek tooltip on the side (above/below) with more viewport space.
 */
export function getPeekTooltipStyle(rect: DOMRect): CSSProperties {
  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth
  const spaceAbove = rect.top
  const spaceBelow = viewportHeight - rect.bottom
  const placeAbove = spaceAbove >= spaceBelow

  const right = Math.max(EDGE_PADDING_PX, viewportWidth - rect.right)

  if (placeAbove) {
    return {
      position: 'fixed',
      bottom: `${Math.max(EDGE_PADDING_PX, viewportHeight - rect.top + OFFSET_PX)}px`,
      right: `${right}px`,
      maxHeight: `${Math.max(120, viewportHeight - EDGE_PADDING_PX * 2)}px`,
      overflowY: 'auto',
    }
  }

  return {
    position: 'fixed',
    top: `${Math.max(EDGE_PADDING_PX, rect.bottom + OFFSET_PX)}px`,
    right: `${right}px`,
    maxHeight: `${Math.max(120, viewportHeight - EDGE_PADDING_PX * 2)}px`,
    overflowY: 'auto',
  }
}
