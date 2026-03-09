import type { Stage } from './types.ts'

/** Convention days in display order. */
export const CONVENTION_DAYS = ['Thursday', 'Friday', 'Saturday', 'Sunday'] as const

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(totalMinutes: number): string {
  const normalized = totalMinutes % (24 * 60)
  const h = Math.floor(normalized / 60)
  const m = normalized % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Normalizes minutes for chronological sort order, treating 00:00–05:59 as post-midnight. */
function toSortableMinutes(m: number): number {
  return m < 360 ? m + 24 * 60 : m
}

/**
 * Returns an array of "HH:MM" slot start-time labels for a stage on a given evening.
 * Handles events that cross midnight (endTime < startTime).
 * Returns [] if the stage has no schedule configured for that evening.
 */
export function getSlotLabels(stage: Stage, evening: string): string[] {
  // Simultaneous stages have no slot rows — all DJs play the full event window.
  if (stage.stageType === 'simultaneous') return []

  const daySchedule = stage.schedule?.[evening]
  if (!daySchedule?.startTime || !daySchedule?.endTime || !stage.slotDuration) return []

  const startMinutes = timeToMinutes(daySchedule.startTime)
  let endMinutes = timeToMinutes(daySchedule.endTime)

  // Cross-midnight: if end is at or before start, add 24 hours
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60
  }

  if (stage.slotDuration <= 0) return []

  const labels: string[] = []
  for (let t = startMinutes; t + stage.slotDuration <= endMinutes; t += stage.slotDuration) {
    labels.push(minutesToTime(t))
  }
  return labels
}

/**
 * Returns the unified, chronologically sorted time axis for an evening.
 * Formed by the union of slot labels from all active stages on that evening.
/**
 * Returns the unified, chronologically sorted time axis for an evening.
 * Formed by the union of slot labels from all sequential stages on that evening,
 * plus the startTime of any simultaneous stages (so the grid has a row at the
 * point where simultaneous stages begin, even if no sequential stage starts then).
 * Times in the early morning (before 06:00) are treated as "next day" for sort order.
 */
export function getEveningTimeAxis(stages: Stage[], evening: string): string[] {
  const timeSet = new Set<string>()
  for (const stage of stages) {
    if (stage.stageType === 'simultaneous') {
      // Add the simultaneous stage's start time so the grid can anchor the cell
      // at the correct position even when no sequential stage has a slot that early.
      const startTime = stage.schedule?.[evening]?.startTime
      if (startTime) timeSet.add(startTime)
    } else {
      for (const label of getSlotLabels(stage, evening)) {
        timeSet.add(label)
      }
    }
  }
  return [...timeSet].sort((a, b) =>
    toSortableMinutes(timeToMinutes(a)) - toSortableMinutes(timeToMinutes(b))
  )
}

/**
 * Returns the CSS grid row range for a simultaneous stage cell, based on the stage's
 * configured start/end times for the evening and the unified time axis.
 * Returns 1-based CSS grid row coordinates (header = row 1, first data row = row 2).
 * Falls back to full-span if the stage has no schedule for the evening.
 */
export function getSimultaneousRowRange(
  stage: Stage,
  evening: string,
  timeAxis: string[]
): { gridRowStart: number; gridRowEnd: number } {
  if (timeAxis.length === 0) return { gridRowStart: 2, gridRowEnd: 3 }

  const fullSpan = { gridRowStart: 2, gridRowEnd: 2 + timeAxis.length }
  const daySchedule = stage.schedule?.[evening]
  if (!daySchedule?.startTime || !daySchedule?.endTime) return fullSpan

  const startM = toSortableMinutes(timeToMinutes(daySchedule.startTime))
  const endM = toSortableMinutes(timeToMinutes(daySchedule.endTime))

  // First row whose time >= stage start (inclusive lower bound)
  let startRowIdx = timeAxis.findIndex((t) => toSortableMinutes(timeToMinutes(t)) >= startM)
  if (startRowIdx === -1) startRowIdx = timeAxis.length

  // First row whose time >= stage end (exclusive upper bound)
  let endRowIdx = timeAxis.findIndex((t) => toSortableMinutes(timeToMinutes(t)) >= endM)
  if (endRowIdx === -1) endRowIdx = timeAxis.length

  // Ensure at least one row
  if (endRowIdx <= startRowIdx) endRowIdx = startRowIdx + 1

  // CSS grid rows are 1-based; add 2 to skip the header row (row 1)
  return { gridRowStart: startRowIdx + 2, gridRowEnd: endRowIdx + 2 }
}
