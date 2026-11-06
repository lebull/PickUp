import { coerceSetLength } from './types.ts'
import type { Stage } from './types.ts'
import type { TimeFormat } from './AppPreferencesContext.ts'

export function getStageEventType(event: { eventType?: 'timed' | 'special' }): 'timed' | 'special' {
  return event.eventType ?? 'timed'
}

function normalizeDayKey(day: string): string {
  return day.trim().toLowerCase()
}

/**
 * Returns schedule events for a day, tolerant of case/whitespace mismatches in stored keys.
 */
export function getScheduleEventsForDay(
  schedule: Record<string, { eventType?: 'timed' | 'special'; startTime?: string; endTime?: string; label?: string }[]> | undefined,
  day: string
): { eventType?: 'timed' | 'special'; startTime?: string; endTime?: string; label?: string }[] {
  if (!schedule) return []

  const direct = schedule[day]
  if (direct) return direct

  const target = normalizeDayKey(day)
  for (const [key, events] of Object.entries(schedule)) {
    if (normalizeDayKey(key) === target) {
      return events
    }
  }
  return []
}

/** Convention days in display order. */
export const CONVENTION_DAYS = ['Thursday', 'Friday', 'Saturday', 'Sunday'] as const

export function getProjectDayNames(startDate?: string, endDate?: string): string[] {
  if (!startDate || !endDate) return []

  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return []
  }

  const names: string[] = []
  const current = new Date(start)
  while (current <= end) {
    names.push(current.toLocaleDateString('en-US', { weekday: 'long' }))
    current.setDate(current.getDate() + 1)
  }

  return names
}

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

function normalizeEventRange(startMinutes: number, endMinutes: number): { startMinutes: number; endMinutes: number } {
  let nextEnd = endMinutes
  if (nextEnd <= startMinutes) {
    nextEnd += 24 * 60
  }
  return { startMinutes, endMinutes: nextEnd }
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y !== 0) {
    const t = y
    y = x % y
    x = t
  }
  return x || 1
}

/**
 * Returns an array of "HH:MM" slot start-time labels for a specific event on a stage on a given evening.
 * Handles events that cross midnight (endTime < startTime).
 * Returns [] if the stage has no schedule configured for that evening or the eventIndex is out of range.
 */
export function getSlotLabels(stage: Stage, evening: string, eventIndex = 0): string[] {
  // Simultaneous stages have no slot rows — all DJs play the full event window.
  if (stage.stageType === 'simultaneous') return []

  const events = getScheduleEventsForDay(stage.schedule, evening)
  if (!events || events.length === 0) return []
  const daySchedule = events[eventIndex]
  if (!daySchedule || getStageEventType(daySchedule) === 'special') return []
  const slotDuration = coerceSetLength(stage.slotDuration)
  if (!daySchedule.startTime || !daySchedule.endTime) return []

  const startMinutes = timeToMinutes(daySchedule.startTime)
  const { endMinutes } = normalizeEventRange(startMinutes, timeToMinutes(daySchedule.endTime))

  const labels: string[] = []
  for (let t = startMinutes; t + slotDuration <= endMinutes; t += slotDuration) {
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
 * Uses the greatest common factor (GCF) of sequential slot durations as the
 * base timeline step, spanning earliest event start to latest event end.
 * Explicit slot starts and event boundaries are always included in the axis.
 * This keeps row alignment stable across mixed stage durations while allowing
 * slot cells to span vertically where no real schedule gap exists.
 * Times before 06:00 are treated as "next day" for sort order.
 */
export function getEveningTimeAxis(stages: Stage[], evening: string): string[] {
  const activeStages = stages.filter((s) => (s.activeDays ?? []).includes(evening))
  if (activeStages.length === 0) return []

  const sequentialSlotLabels = new Set<string>()
  const explicitBoundaryLabels = new Set<string>()
  const slotDurations: number[] = []
  let earliestStart = Infinity
  let latestEnd = -Infinity

  for (const stage of activeStages) {
    const events = getScheduleEventsForDay(stage.schedule, evening)

    if (stage.stageType === 'sequential') {
      slotDurations.push(coerceSetLength(stage.slotDuration))
    }

    for (const event of events) {
      if (getStageEventType(event) === 'special') continue
      if (!event.startTime || !event.endTime) continue

      explicitBoundaryLabels.add(event.startTime)
      explicitBoundaryLabels.add(event.endTime)

      const startM = timeToMinutes(event.startTime)
      const { endMinutes: endM } = normalizeEventRange(startM, timeToMinutes(event.endTime))
      const startSortable = toSortableMinutes(startM)
      const endSortable = startSortable + (endM - startM)

      if (startSortable < earliestStart) earliestStart = startSortable
      if (endSortable > latestEnd) latestEnd = endSortable
    }

    for (let eventIndex = 0; eventIndex < events.length; eventIndex++) {
      for (const slotLabel of getSlotLabels(stage, evening, eventIndex)) {
        sequentialSlotLabels.add(slotLabel)
      }
    }
  }

  if (!isFinite(earliestStart) || !isFinite(latestEnd)) return []

  let axisStep = 60
  if (slotDurations.length > 0) {
    axisStep = slotDurations.reduce((acc, value) => gcd(acc, value), slotDurations[0])
  }
  if (!Number.isFinite(axisStep) || axisStep <= 0) axisStep = 60

  const generatedLabels = new Set<string>()
  for (let t = earliestStart; t < latestEnd; t += axisStep) {
    const actualMinutes = t >= 24 * 60 ? t - 24 * 60 : t
    generatedLabels.add(minutesToTime(actualMinutes))
  }

  const allLabels = new Set<string>(generatedLabels)
  for (const label of explicitBoundaryLabels) allLabels.add(label)
  for (const label of sequentialSlotLabels) allLabels.add(label)

  return [...allLabels].sort((a, b) => toSortableMinutes(timeToMinutes(a)) - toSortableMinutes(timeToMinutes(b)))
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
  const events = getScheduleEventsForDay(stage.schedule, evening)
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
  const events = getScheduleEventsForDay(stage.schedule, evening)
  const event = events?.[eventIndex]
  if (!event?.startTime || !event?.endTime) return fullSpan

  const startMinutes = timeToMinutes(event.startTime)
  const { endMinutes } = normalizeEventRange(startMinutes, timeToMinutes(event.endTime))
  const startM = toSortableMinutes(startMinutes)
  const endM = toSortableMinutes(endMinutes)

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
