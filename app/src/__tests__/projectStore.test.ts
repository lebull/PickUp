import { describe, it, expect } from 'vitest'
import { normalizeProject } from '../projectStore'
import type { Project } from '../types'

function makeBaseProject(): Project {
  return {
    id: 'project-1',
    name: 'Test Project',
    csvText: '',
    stages: [],
    assignments: [],
    discardedSubmissions: [],
    rowCount: 0,
    createdAt: '2026-03-27T00:00:00.000Z',
    updatedAt: '2026-03-27T00:00:00.000Z',
  }
}

describe('projectStore normalization', () => {
  it('defaults missing legacy stageType to sequential', () => {
    const legacy = {
      ...makeBaseProject(),
      stages: [
        {
          id: 'stage-1',
          name: 'Legacy Stage',
          activeDays: ['Friday'],
          schedule: {
            Friday: [{ startTime: '20:00', endTime: '22:00' }],
          },
          slotDuration: 60,
        },
      ],
    } as unknown as Project

    const normalized = normalizeProject(legacy)
    expect(normalized.stages[0].stageType).toBe('sequential')
  })

  it('preserves special stage without requiring days, schedule, or slotDuration', () => {
    const input: Project = {
      ...makeBaseProject(),
      stages: [
        {
          id: 'stage-special',
          name: 'VIP Showcase',
          stageType: 'special',
        },
      ],
    }

    const normalized = normalizeProject(input)
    expect(normalized.stages[0].stageType).toBe('special')
    expect(normalized.stages[0].activeDays).toEqual([])
    expect(normalized.stages[0].schedule).toEqual({})
    expect(normalized.stages[0].slotDuration).toBeUndefined()
  })

  it('keeps open-ended special assignments intact', () => {
    const input: Project = {
      ...makeBaseProject(),
      stages: [
        {
          id: 'stage-special',
          name: 'Partner Event',
          stageType: 'special',
        },
      ],
      assignments: [
        { type: 'dj', stageId: 'stage-special', submissionNumber: 'S001' },
        { type: 'dj', stageId: 'stage-special', submissionNumber: 'S002' },
        { type: 'dj', stageId: 'stage-special', submissionNumber: 'S003' },
      ],
    }

    const normalized = normalizeProject(input)
    expect(normalized.assignments.length).toBe(3)
    expect(normalized.assignments.every((a) => !('evening' in a))).toBe(true)
  })
})
