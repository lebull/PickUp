import { describe, it, expect } from 'vitest'
import { getEveningTimeAxis, eventsOverlap } from '../lineupUtils.ts'
import type { Stage } from '../types.ts'
import { migrateProject, type LegacyStageSchedule } from '../migrateMultiEvent.ts'

// ── Helper ────────────────────────────────────────────────────────────────────

function makeStage(overrides: Partial<Stage> = {}): Stage {
  return {
    id: 'stage-1',
    name: 'Test Stage',
    stageType: 'sequential',
    activeDays: ['Friday'],
    schedule: {},
    slotDuration: 60,
    ...overrides,
  }
}

// ── 6.1: getEveningTimeAxis with two events on the same stage ─────────────────

describe('getEveningTimeAxis – multi-event stage', () => {
  it('includes slots from both non-overlapping events on the same stage', () => {
    const stage = makeStage({
      schedule: {
        Friday: [
          { startTime: '14:00', endTime: '16:00' },
          { startTime: '20:00', endTime: '22:00' },
        ],
      },
    })

    const axis = getEveningTimeAxis([stage], 'Friday')
    // First event: 14:00, 15:00 (2 slots). Second event: 20:00, 21:00 (2 slots).
    // Combined axis spans 14:00–22:00 at 60-min intervals = 8 labels.
    expect(axis).toEqual(['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'])
  })

  it('uses the minimum slotDuration across events when stages differ', () => {
    const stage30 = makeStage({
      id: 'stage-30',
      slotDuration: 30,
      schedule: {
        Friday: [{ startTime: '20:00', endTime: '21:00' }],
      },
    })
    const stage60 = makeStage({
      id: 'stage-60',
      slotDuration: 60,
      schedule: {
        Friday: [{ startTime: '20:00', endTime: '22:00' }],
      },
    })

    const axis = getEveningTimeAxis([stage30, stage60], 'Friday')
    // Min duration = 30. 20:00–22:00 at 30-min steps = 4 labels.
    expect(axis).toEqual(['20:00', '20:30', '21:00', '21:30'])
  })

  it('returns an empty array when no events have valid times', () => {
    const stage = makeStage({
      schedule: { Friday: [{ startTime: '', endTime: '' }] },
    })
    expect(getEveningTimeAxis([stage], 'Friday')).toEqual([])
  })

  it('handles a single-event stage the same as before', () => {
    const stage = makeStage({
      schedule: { Friday: [{ startTime: '20:00', endTime: '23:00' }] },
    })
    const axis = getEveningTimeAxis([stage], 'Friday')
    expect(axis).toEqual(['20:00', '21:00', '22:00'])
  })
})

// ── 6.2: migrate-multi-event script ──────────────────────────────────────────

describe('migrateProject', () => {
  it('converts single-object schedule to single-element array', () => {
    const input = {
      stages: [
        {
          id: 's1',
          name: 'Main',
          schedule: {
            Friday: { startTime: '20:00', endTime: '24:00' },
          },
        },
      ],
      assignments: [],
    }

    const result = migrateProject(input as Parameters<typeof migrateProject>[0])

    expect(Array.isArray(result.stages[0].schedule['Friday'])).toBe(true)
    expect(result.stages[0].schedule['Friday']).toHaveLength(1)
    expect((result.stages[0].schedule['Friday'] as LegacyStageSchedule[])[0]).toMatchObject({
      startTime: '20:00',
      endTime: '24:00',
    })
  })

  it('adds eventIndex: 0 to sequential assignments that lack it', () => {
    const input = {
      stages: [],
      assignments: [
        { stageId: 's1', evening: 'Friday', slotIndex: 2, type: 'dj', submissionNumber: 'DJ-1' },
        { stageId: 's1', evening: 'Friday', slotIndex: 3, type: 'dj', submissionNumber: 'DJ-2', eventIndex: 1 },
      ],
    }

    const result = migrateProject(input as Parameters<typeof migrateProject>[0])

    expect(result.assignments[0].eventIndex).toBe(0)
    // Already-set eventIndex must not be overwritten
    expect(result.assignments[1].eventIndex).toBe(1)
  })

  it('does not touch positionIndex (simultaneous) assignments', () => {
    const input = {
      stages: [],
      assignments: [
        { stageId: 's1', evening: 'Friday', positionIndex: 1, type: 'dj', submissionNumber: 'DJ-1' },
      ],
    }

    const result = migrateProject(input as Parameters<typeof migrateProject>[0])
    // positionIndex assignments should NOT get eventIndex added
    expect(result.assignments[0].eventIndex).toBeUndefined()
  })

  it('is idempotent: running on already-migrated data leaves it unchanged', () => {
    const input = {
      stages: [
        {
          id: 's1',
          name: 'Main',
          schedule: {
            Friday: [{ startTime: '20:00', endTime: '24:00' }],
          },
        },
      ],
      assignments: [
        { stageId: 's1', evening: 'Friday', slotIndex: 0, type: 'dj', submissionNumber: 'DJ-1', eventIndex: 0 },
      ],
    }

    const result = migrateProject(input as Parameters<typeof migrateProject>[0])

    expect(result.stages[0].schedule['Friday']).toHaveLength(1)
    expect(result.assignments[0].eventIndex).toBe(0)
  })

  it('defaults migrated events to eventType: timed when not present', () => {
    const input = {
      stages: [
        {
          id: 's1',
          name: 'Main',
          schedule: {
            Friday: { startTime: '20:00', endTime: '24:00' },
          },
        },
      ],
      assignments: [],
    }

    const result = migrateProject(input as Parameters<typeof migrateProject>[0])
    const friday = result.stages[0].schedule['Friday'] as LegacyStageSchedule[]
    expect(friday[0].eventType).toBe('timed')
  })
})

// ── 6.3: eventsOverlap ────────────────────────────────────────────────────────

describe('eventsOverlap', () => {
  it('returns false for non-overlapping events with a gap', () => {
    expect(eventsOverlap(
      { startTime: '14:00', endTime: '16:00' },
      { startTime: '20:00', endTime: '22:00' }
    )).toBe(false)
  })

  it('returns false for adjacent events (end equals start of next)', () => {
    expect(eventsOverlap(
      { startTime: '14:00', endTime: '18:00' },
      { startTime: '18:00', endTime: '22:00' }
    )).toBe(false)
  })

  it('returns true for events that overlap by one hour', () => {
    expect(eventsOverlap(
      { startTime: '14:00', endTime: '19:00' },
      { startTime: '18:00', endTime: '22:00' }
    )).toBe(true)
  })

  it('returns true when one event is fully contained in another', () => {
    expect(eventsOverlap(
      { startTime: '14:00', endTime: '22:00' },
      { startTime: '16:00', endTime: '18:00' }
    )).toBe(true)
  })

  it('returns true for identical events', () => {
    expect(eventsOverlap(
      { startTime: '20:00', endTime: '24:00' },
      { startTime: '20:00', endTime: '24:00' }
    )).toBe(true)
  })

  it('returns false when start or end times are missing', () => {
    expect(eventsOverlap(
      { startTime: '', endTime: '22:00' },
      { startTime: '20:00', endTime: '24:00' }
    )).toBe(false)
  })

  it('handles cross-midnight events correctly', () => {
    // Cross-midnight event 22:00–02:00. Second event 01:00–03:00 overlaps.
    expect(eventsOverlap(
      { startTime: '22:00', endTime: '02:00' },
      { startTime: '01:00', endTime: '03:00' }
    )).toBe(true)
    // Cross-midnight event 22:00–02:00 does NOT overlap with afternoon 14:00–18:00.
    expect(eventsOverlap(
      { startTime: '22:00', endTime: '02:00' },
      { startTime: '14:00', endTime: '18:00' }
    )).toBe(false)
  })
})
