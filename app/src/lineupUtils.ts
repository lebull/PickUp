import type { Stage } from './types.ts'

/** Convention days in display order. */
export const CONVENTION_DAYS = ['Thursday', 'Friday', 'Saturday', 'Sunday'] as const

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(totalMinutes: number): string {
  const normalized = totalMinutes % (24 * 60)
  const h = Math.floor(normalized / 60)
  const m = normalized % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
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
 * Times in the early morning (before 06:00) are treated as "next day" for sort order.
 * Simultaneous stages contribute no slot labels (getSlotLabels returns []) so they
 * do not affect the time axis — this is intentional and correct.
 */
export function getEveningTimeAxis(stages: Stage[], evening: string): string[] {
  const timeSet = new Set<string>()
  for (const stage of stages) {
    for (const label of getSlotLabels(stage, evening)) {
      timeSet.add(label)
    }
  }
  return [...timeSet].sort((a, b) => {
    const ma = timeToMinutes(a)
    const mb = timeToMinutes(b)
    // Treat 00:00–05:59 as post-midnight (add 24h for sort key)
    const wa = ma < 360 ? ma + 24 * 60 : ma
    const wb = mb < 360 ? mb + 24 * 60 : mb
    return wa - wb
  })
}
