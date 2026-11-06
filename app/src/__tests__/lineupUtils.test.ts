import { describe, it, expect } from 'vitest'
import { formatTimeLabel, getEveningTimeAxis, getSlotLabels, getSimultaneousRowRange, getProjectDayNames } from '../lineupUtils.ts'
import type { Stage } from '../types.ts'

describe('formatTimeLabel', () => {
  it('passes 24h strings through unchanged', () => {
    expect(formatTimeLabel('20:00', '24h')).toBe('20:00')
    expect(formatTimeLabel('00:30', '24h')).toBe('00:30')
    expect(formatTimeLabel('12:00', '24h')).toBe('12:00')
  })

  it('converts afternoon hours to 12h pm', () => {
    expect(formatTimeLabel('20:00', '12h')).toBe('8:00 pm')
    expect(formatTimeLabel('21:30', '12h')).toBe('9:30 pm')
    expect(formatTimeLabel('23:00', '12h')).toBe('11:00 pm')
  })

  it('converts morning hours to 12h am', () => {
    expect(formatTimeLabel('08:00', '12h')).toBe('8:00 am')
    expect(formatTimeLabel('09:15', '12h')).toBe('9:15 am')
    expect(formatTimeLabel('11:45', '12h')).toBe('11:45 am')
  })

  it('converts midnight (00:00) correctly', () => {
    expect(formatTimeLabel('00:00', '12h')).toBe('12:00 am')
  })

  it('converts noon (12:00) correctly', () => {
    expect(formatTimeLabel('12:00', '12h')).toBe('12:00 pm')
  })

  it('handles cross-midnight post-midnight times', () => {
    expect(formatTimeLabel('01:00', '12h')).toBe('1:00 am')
    expect(formatTimeLabel('02:30', '12h')).toBe('2:30 am')
  })

  it('pads minutes with leading zero', () => {
    expect(formatTimeLabel('20:05', '12h')).toBe('8:05 pm')
    expect(formatTimeLabel('00:05', '12h')).toBe('12:05 am')
  })
})

// ── getEveningTimeAxis: multi-event stages ────────────────────────────────────

function makeSequentialStage(
  id: string,
  events: { eventType?: 'timed' | 'special'; startTime?: string; endTime?: string; label?: string }[]
): Stage {
  return {
    id,
    name: id,
    stageType: 'sequential',
    activeDays: ['Friday'],
    schedule: { Friday: events },
    slotDuration: 60,
  }
}

describe('getEveningTimeAxis – multi-event stages', () => {
  it('uses a continuous GCF axis with explicit event boundaries', () => {
    const stage = makeSequentialStage('disco', [
      { startTime: '14:00', endTime: '18:00' },
      { startTime: '20:00', endTime: '24:00' },
    ])
    const axis = getEveningTimeAxis([stage], 'Friday')
    expect(axis).toEqual(['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'])
  })

  it('getSlotLabels returns slots only for the specified eventIndex', () => {
    const stage = makeSequentialStage('disco', [
      { startTime: '14:00', endTime: '16:00' },
      { startTime: '20:00', endTime: '22:00' },
    ])
    expect(getSlotLabels(stage, 'Friday', 0)).toEqual(['14:00', '15:00'])
    expect(getSlotLabels(stage, 'Friday', 1)).toEqual(['20:00', '21:00'])
  })

  it('getSlotLabels returns empty array for out-of-range eventIndex', () => {
    const stage = makeSequentialStage('disco', [{ startTime: '20:00', endTime: '22:00' }])
    expect(getSlotLabels(stage, 'Friday', 5)).toEqual([])
  })

  it('getSlotLabels returns empty for special events with no time windows', () => {
    const stage = makeSequentialStage('disco', [
      { eventType: 'special', label: 'VIP Showcase' },
      { startTime: '20:00', endTime: '22:00' },
    ])
    expect(getSlotLabels(stage, 'Friday', 0)).toEqual([])
    expect(getSlotLabels(stage, 'Friday', 1)).toEqual(['20:00', '21:00'])
  })

  it('single-event stage behaves identically to before', () => {
    const stage = makeSequentialStage('main', [{ startTime: '20:00', endTime: '24:00' }])
    expect(getSlotLabels(stage, 'Friday', 0)).toEqual(['20:00', '21:00', '22:00', '23:00'])
    expect(getEveningTimeAxis([stage], 'Friday')).toEqual(['20:00', '21:00', '22:00', '23:00', '24:00'])
  })

  it('supports legacy string slotDuration values when deriving slot labels', () => {
    const stage = {
      ...makeSequentialStage('legacy-main', [{ startTime: '12:00', endTime: '15:00' }]),
      slotDuration: '90' as unknown as Stage['slotDuration'],
    }
    expect(getSlotLabels(stage, 'Friday', 0)).toEqual(['12:00', '13:30'])
  })

  it('resolves day schedules even when stored key casing differs', () => {
    const stage: Stage = {
      id: 'case-main',
      name: 'Case Main',
      stageType: 'sequential',
      activeDays: ['Wednesday'],
      schedule: {
        ' wednesday ': [{ startTime: '12:00', endTime: '15:00' }],
      },
      slotDuration: 90,
    }

    expect(getSlotLabels(stage, 'Wednesday', 0)).toEqual(['12:00', '13:30'])
  })

  it('keeps overnight simultaneous events visible through the next-day boundary', () => {
    const stage: Stage = {
      id: 'sim-night',
      name: 'Late Night',
      stageType: 'simultaneous',
      activeDays: ['Friday'],
      schedule: { Friday: [{ startTime: '23:00', endTime: '02:00' }] },
      slotDuration: 60,
    }

    const axis = getEveningTimeAxis([stage], 'Friday')
    expect(axis).toEqual(['23:00', '00:00', '01:00', '02:00'])
    expect(getSimultaneousRowRange(stage, 'Friday', axis, 0)).toEqual({
      gridRowStart: 2,
      gridRowEnd: 5,
    })
  })

  it('includes real slot starts even when they do not align to the shared axis step', () => {
    const alignedStage = makeSequentialStage('aligned', [
      { startTime: '12:00', endTime: '15:00' },
    ])

    const offsetStage = makeSequentialStage('offset', [
      { startTime: '12:15', endTime: '15:15' },
    ])

    const axis = getEveningTimeAxis([alignedStage, offsetStage], 'Friday')
    expect(axis).toContain('12:00')
    expect(axis).toContain('13:00')
    expect(axis).toContain('12:15')
    expect(axis).toContain('13:15')
  })

  it('builds day labels from the project date range instead of the legacy Thursday–Sunday default', () => {
    expect(getProjectDayNames('2026-12-30', '2027-01-01')).toEqual([
      'Wednesday',
      'Thursday',
      'Friday',
    ])
  })
})

// ── Overlap validation logic ──────────────────────────────────────────────────

// Re-implement the pure helper for testing (mirrors StageConfigPanel internals)
function toMin(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
function rangeEnd(start: number, end: number) {
  return end <= start ? end + 24 * 60 : end
}
function eventsOverlap(
  a: { startTime: string; endTime: string },
  b: { startTime: string; endTime: string }
): boolean {
  if (!a.startTime || !a.endTime || !b.startTime || !b.endTime) return false
  const aStart = toMin(a.startTime)
  const aEnd = rangeEnd(aStart, toMin(a.endTime))
  const bStart = toMin(b.startTime)
  const bEnd = rangeEnd(bStart, toMin(b.endTime))
  return aStart < bEnd && bStart < aEnd
}

describe('overlap validation', () => {
  it('non-overlapping events return false', () => {
    expect(eventsOverlap(
      { startTime: '14:00', endTime: '18:00' },
      { startTime: '20:00', endTime: '24:00' }
    )).toBe(false)
  })

  it('back-to-back events (touching but not overlapping) return false', () => {
    expect(eventsOverlap(
      { startTime: '14:00', endTime: '18:00' },
      { startTime: '18:00', endTime: '22:00' }
    )).toBe(false)
  })

  it('overlapping events return true', () => {
    expect(eventsOverlap(
      { startTime: '14:00', endTime: '20:00' },
      { startTime: '18:00', endTime: '24:00' }
    )).toBe(true)
  })

  it('fully contained events return true', () => {
    expect(eventsOverlap(
      { startTime: '14:00', endTime: '24:00' },
      { startTime: '16:00', endTime: '18:00' }
    )).toBe(true)
  })

  it('events with empty times return false (no validation without data)', () => {
    expect(eventsOverlap(
      { startTime: '', endTime: '' },
      { startTime: '20:00', endTime: '24:00' }
    )).toBe(false)
  })
})
