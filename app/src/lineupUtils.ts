import type { Stage } from './types.ts'
import type { TimeFormat } from './AppPreferencesContext.ts'

export function getStageEventType(event: { eventType?: 'timed' | 'special' }): 'timed' | 'special' {
  return event.eventType ?? 'timed'
}

/** Convention days in display order. */
export const CONVENTION_DAYS = ['Thursday', 'Friday', 'Saturday', 'Sunday'] as const

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/**
 * Formats a "HH:MM" 24-hour time string for display.
 * In '12h' mode returns "h:MM am/pm" (e.g. "8:00 pm", "12:00 am").
 * In '24h' mode returns the string unchanged.
 */
export function formatTimeLabel(hhmm: string, format: TimeFormat): string {
  if (format === '24h') return hhmm
  const [h, m] = hhmm.split(':').map(Number)
  const suffix = h < 12 ? 'am' : 'pm'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`
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
 * Returns an array of "HH:MM" slot start-time labels for a specific event on a stage on a given evening.
 * Handles events that cross midnight (endTime < startTime).
 * Returns [] if the stage has no schedule configured for that evening or the eventIndex is out of range.
 */
export function getSlotLabels(stage: Stage, evening: string, eventIndex = 0): string[] {
  // Simultaneous stages have no slot rows — all DJs play the full event window.
  if (stage.stageType === 'simultaneous') return []

  const events = stage.schedule?.[evening]
  if (!events || events.length === 0) return []
  const daySchedule = events[eventIndex]
  if (!daySchedule || getStageEventType(daySchedule) === 'special') return []
  if (!daySchedule.startTime || !daySchedule.endTime || !stage.slotDuration) return []

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
 * Returns the display label for a stage event.
 * Uses the event's label if set, otherwise generates "Set N" (1-based).
 */
export function getEventLabel(event: { label?: string }, index: number): string {
  return event.label?.trim() || `Set ${index + 1}`
}

/**
 * Returns the unified, chronologically sorted time axis for an evening.
 * Spans from the earliest start time to the latest end time across all active
 * sequential stages on that evening, stepping by the minimum slotDuration.
 * This produces a continuous axis — stages with no slot at a given time will
 * render empty cells (gap rows) rather than the axis collapsing.
 * Simultaneous stages contribute no rows to the axis.
 * Times before 06:00 are treated as "next day" for sort order.
 */
export function getEveningTimeAxis(stages: Stage[], evening: string): string[] {
  const sequentialStages = stages.filter(
    (s) => s.stageType !== 'simultaneous' && (s.activeDays ?? []).includes(evening)
  )
  if (sequentialStages.length === 0) return []

  let earliestStart = Infinity
  let latestEnd = -Infinity
  let minDuration = Infinity

  for (const stage of sequentialStages) {
    const events = stage.schedule?.[evening]
    if (!events || events.length === 0 || !stage.slotDuration) continue

    for (const event of events) {
      if (getStageEventType(event) === 'special') continue
      if (!event.startTime || !event.endTime) continue

      const startM = timeToMinutes(event.startTime)
      let endM = timeToMinutes(event.endTime)
      if (endM <= startM) endM += 24 * 60

      const startSortable = toSortableMinutes(startM)
      const endSortable = startSortable + (endM - startM)

      if (startSortable < earliestStart) earliestStart = startSortable
      if (endSortable > latestEnd) latestEnd = endSortable
      if (stage.slotDuration < minDuration) minDuration = stage.slotDuration
    }
  }

  // Expand axis bounds to cover simultaneous stages so getSimultaneousRowRange can map
  // their start/end times onto the correct grid rows even when they fall outside the
  // sequential stage range (e.g. a silent disco running 1pm–3pm before DJs start at 3pm).
  for (const stage of stages) {
    if (stage.stageType !== 'simultaneous' || !(stage.activeDays ?? []).includes(evening)) continue
    const events = stage.schedule?.[evening]
    if (!events || events.length === 0) continue
    // Simultaneous stages only use the first event for time-axis bounds
    const event = events[0]
    if (event && getStageEventType(event) === 'special') continue
    if (!event?.startTime || !event?.endTime) continue

    const startM = timeToMinutes(event.startTime)
    let endM = timeToMinutes(event.endTime)
    if (endM <= startM) endM += 24 * 60

    const startSortable = toSortableMinutes(startM)
    const endSortable = startSortable + (endM - startM)

    if (startSortable < earliestStart) earliestStart = startSortable
    if (endSortable > latestEnd) latestEnd = endSortable
  }

  if (!isFinite(earliestStart) || !isFinite(latestEnd) || !isFinite(minDuration)) return []

  const labels: string[] = []
  for (let t = earliestStart; t < latestEnd; t += minDuration) {
    // Convert back from sortable minutes to actual HH:MM
    const actualMinutes = t >= 24 * 60 ? t - 24 * 60 : t
    labels.push(minutesToTime(actualMinutes))
  }
  return labels
}

/**
 * Returns all slot labels across every event for a stage on a given evening, in time order.
 * Each entry carries the timeLabel, the eventIndex it belongs to, and the slotIndex within that event.
 * Returns [] for simultaneous stages or when no events are configured.
 */
export function getStageEventSlots(
  stage: Stage,
  evening: string
): { timeLabel: string; eventIndex: number; slotIndex: number }[] {
  if (stage.stageType === 'simultaneous') return []
  const events = stage.schedule?.[evening] ?? []
  const result: { timeLabel: string; eventIndex: number; slotIndex: number }[] = []
  for (let ei = 0; ei < events.length; ei++) {
    const labels = getSlotLabels(stage, evening, ei)
    for (let si = 0; si < labels.length; si++) {
      result.push({ timeLabel: labels[si], eventIndex: ei, slotIndex: si })
    }
  }
  return result
}

/**
 * Returns false if either range is missing start/end times.
 */
export function eventsOverlap(
  a: { startTime: string; endTime: string },
  b: { startTime: string; endTime: string }
): boolean {
  if (!a.startTime || !a.endTime || !b.startTime || !b.endTime) return false
  function toMin(t: string) {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  function dur(start: number, end: number): number {
    return end <= start ? end + 24 * 60 - start : end - start
  }
  const aStartRaw = toMin(a.startTime)
  const bStartRaw = toMin(b.startTime)
  // Use toSortableMinutes so post-midnight times (00:00–05:59) sort after evening times.
  const aStart = toSortableMinutes(aStartRaw)
  const aEnd = aStart + dur(aStartRaw, toMin(a.endTime))
  const bStart = toSortableMinutes(bStartRaw)
  const bEnd = bStart + dur(bStartRaw, toMin(b.endTime))
  return aStart < bEnd && bStart < aEnd
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
  timeAxis: string[],
  eventIndex = 0
): { gridRowStart: number; gridRowEnd: number } {
  if (timeAxis.length === 0) return { gridRowStart: 2, gridRowEnd: 3 }

  const fullSpan = { gridRowStart: 2, gridRowEnd: 2 + timeAxis.length }
  const events = stage.schedule?.[evening]
  const event = events?.[eventIndex]
  if (!event?.startTime || !event?.endTime) return fullSpan

  const startM = toSortableMinutes(timeToMinutes(event.startTime))
  const endM = toSortableMinutes(timeToMinutes(event.endTime))

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
