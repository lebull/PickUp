/**
 * Tests for the migration logic that converts legacy project data to the
 * multi-event-per-stage-per-day format.
 *
 * We inline the migration function here so we can test it without Node.js
 * process/fs globals (which aren't available in the Vitest browser environment).
 */
import { describe, it, expect } from 'vitest'

interface StageSchedule {
  startTime: string
  endTime: string
  label?: string
}

interface LegacyStage {
  id: string
  schedule: Record<string, StageSchedule | StageSchedule[]>
  [key: string]: unknown
}

interface LegacyAssignment {
  stageId: string
  evening: string
  eventIndex?: number
  slotIndex?: number
  positionIndex?: number
  [key: string]: unknown
}

interface LegacyProject {
  stages: LegacyStage[]
  assignments: LegacyAssignment[]
}

function migrateProject(project: LegacyProject): LegacyProject {
  const stages = project.stages.map((stage) => {
    const newSchedule: Record<string, StageSchedule[]> = {}
    for (const [day, value] of Object.entries(stage.schedule)) {
      newSchedule[day] = Array.isArray(value) ? (value as StageSchedule[]) : [value as StageSchedule]
    }
    return { ...stage, schedule: newSchedule }
  })

  const assignments = project.assignments.map((a) => {
    if (a.slotIndex != null && a.eventIndex == null) {
      return { ...a, eventIndex: 0 }
    }
    return a
  })

  return { ...project, stages, assignments }
}

describe('migrate-multi-event', () => {
  it('converts a legacy single-object schedule to a single-element array', () => {
    const project: LegacyProject = {
      stages: [
        {
          id: 'stage-1',
          schedule: {
            Friday: { startTime: '20:00', endTime: '24:00' },
          },
        },
      ],
      assignments: [],
    }

    const result = migrateProject(project)
    expect(result.stages[0].schedule['Friday']).toEqual([{ startTime: '20:00', endTime: '24:00' }])
  })

  it('adds eventIndex: 0 to legacy assignments that have slotIndex but no eventIndex', () => {
    const project: LegacyProject = {
      stages: [],
      assignments: [
        { stageId: 's1', evening: 'Friday', slotIndex: 2 },
        { stageId: 's1', evening: 'Friday', slotIndex: 3, eventIndex: 1 }, // already migrated
      ],
    }

    const result = migrateProject(project)
    expect(result.assignments[0].eventIndex).toBe(0)
    expect(result.assignments[1].eventIndex).toBe(1) // unchanged
  })

  it('does not add eventIndex to simultaneous (positionIndex-only) assignments', () => {
    const project: LegacyProject = {
      stages: [],
      assignments: [
        { stageId: 's1', evening: 'Friday', positionIndex: 1 },
      ],
    }

    const result = migrateProject(project)
    expect(result.assignments[0].eventIndex).toBeUndefined()
  })

  it('is idempotent: already-migrated projects pass through unchanged', () => {
    const project: LegacyProject = {
      stages: [
        {
          id: 'stage-1',
          schedule: {
            Friday: [{ startTime: '20:00', endTime: '24:00' }],
          },
        },
      ],
      assignments: [
        { stageId: 'stage-1', evening: 'Friday', slotIndex: 0, eventIndex: 0 },
      ],
    }

    const result = migrateProject(project)
    expect(result.stages[0].schedule['Friday']).toEqual([{ startTime: '20:00', endTime: '24:00' }])
    expect(result.assignments[0].eventIndex).toBe(0)
  })
})
