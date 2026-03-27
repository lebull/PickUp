import { describe, it, expect } from 'vitest'
import { normalizeProject, applySetAcceptanceStatus, applyReplaceWithDeclineHistory } from '../projectStore'
import type { Project, SlotCoord } from '../types'

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

// ── applySetAcceptanceStatus ──────────────────────────────────────────────────

function makeProjectWithDJAssignment(submissionNumber = 'S001'): Project {
  return {
    ...makeBaseProject(),
    stages: [{ id: 'stage-1', name: 'Main', stageType: 'sequential', activeDays: ['Friday'], schedule: { Friday: [{ startTime: '20:00', endTime: '22:00' }] }, slotDuration: 60 }],
    assignments: [
      { type: 'dj', stageId: 'stage-1', evening: 'Friday', slotIndex: 0, eventIndex: 0, submissionNumber },
    ],
  }
}

const coord: SlotCoord = { stageId: 'stage-1', evening: 'Friday', slotIndex: 0, eventIndex: 0 }

describe('applySetAcceptanceStatus', () => {
  it('sets acceptanceStatus to yes on the matching assignment', () => {
    const project = makeProjectWithDJAssignment()
    const result = applySetAcceptanceStatus(project, coord, 'yes')
    const assignment = result.assignments[0] as { acceptanceStatus?: string }
    expect(assignment.acceptanceStatus).toBe('yes')
  })

  it('sets acceptanceStatus to no on the matching assignment', () => {
    const project = makeProjectWithDJAssignment()
    const result = applySetAcceptanceStatus(project, coord, 'no')
    const assignment = result.assignments[0] as { acceptanceStatus?: string }
    expect(assignment.acceptanceStatus).toBe('no')
  })

  it('sets acceptanceStatus to pending on the matching assignment', () => {
    const project = makeProjectWithDJAssignment()
    const result = applySetAcceptanceStatus(project, coord, 'pending')
    const assignment = result.assignments[0] as { acceptanceStatus?: string }
    expect(assignment.acceptanceStatus).toBe('pending')
  })

  it('does not modify other assignments', () => {
    const project: Project = {
      ...makeBaseProject(),
      stages: [{ id: 'stage-1', name: 'Main', stageType: 'sequential', activeDays: ['Friday'], schedule: { Friday: [{ startTime: '20:00', endTime: '22:00' }] }, slotDuration: 60 }],
      assignments: [
        { type: 'dj', stageId: 'stage-1', evening: 'Friday', slotIndex: 0, eventIndex: 0, submissionNumber: 'S001' },
        { type: 'dj', stageId: 'stage-1', evening: 'Friday', slotIndex: 1, eventIndex: 0, submissionNumber: 'S002' },
      ],
    }
    const result = applySetAcceptanceStatus(project, coord, 'yes')
    const other = result.assignments[1] as { acceptanceStatus?: string }
    expect(other.acceptanceStatus).toBeUndefined()
  })

  it('does not mutate the input project', () => {
    const project = makeProjectWithDJAssignment()
    applySetAcceptanceStatus(project, coord, 'yes')
    const original = project.assignments[0] as { acceptanceStatus?: string }
    expect(original.acceptanceStatus).toBeUndefined()
  })
})

// ── applyReplaceWithDeclineHistory ────────────────────────────────────────────

describe('applyReplaceWithDeclineHistory', () => {
  it('replaces the submissionNumber on the matching assignment', () => {
    const project = makeProjectWithDJAssignment('S001')
    const result = applyReplaceWithDeclineHistory(project, coord, 'S002')
    const assignment = result.assignments[0] as { submissionNumber: string }
    expect(assignment.submissionNumber).toBe('S002')
  })

  it('appends the outgoing DJ to declinedBy', () => {
    const project = makeProjectWithDJAssignment('S001')
    const result = applyReplaceWithDeclineHistory(project, coord, 'S002')
    const assignment = result.assignments[0] as { declinedBy: string[] }
    expect(assignment.declinedBy).toContain('S001')
  })

  it('preserves existing declinedBy entries', () => {
    const project: Project = {
      ...makeBaseProject(),
      stages: [{ id: 'stage-1', name: 'Main', stageType: 'sequential', activeDays: ['Friday'], schedule: { Friday: [{ startTime: '20:00', endTime: '22:00' }] }, slotDuration: 60 }],
      assignments: [
        { type: 'dj', stageId: 'stage-1', evening: 'Friday', slotIndex: 0, eventIndex: 0, submissionNumber: 'S002', declinedBy: ['S001'] },
      ],
    }
    const result = applyReplaceWithDeclineHistory(project, coord, 'S003')
    const assignment = result.assignments[0] as { declinedBy: string[] }
    expect(assignment.declinedBy).toEqual(['S001', 'S002'])
  })

  it('resets acceptanceStatus to pending', () => {
    const project: Project = {
      ...makeBaseProject(),
      stages: [{ id: 'stage-1', name: 'Main', stageType: 'sequential', activeDays: ['Friday'], schedule: { Friday: [{ startTime: '20:00', endTime: '22:00' }] }, slotDuration: 60 }],
      assignments: [
        { type: 'dj', stageId: 'stage-1', evening: 'Friday', slotIndex: 0, eventIndex: 0, submissionNumber: 'S001', acceptanceStatus: 'no' },
      ],
    }
    const result = applyReplaceWithDeclineHistory(project, coord, 'S002')
    const assignment = result.assignments[0] as { acceptanceStatus: string }
    expect(assignment.acceptanceStatus).toBe('pending')
  })

  it('does not mutate the input project', () => {
    const project = makeProjectWithDJAssignment('S001')
    applyReplaceWithDeclineHistory(project, coord, 'S002')
    const original = project.assignments[0] as { submissionNumber: string; declinedBy?: string[] }
    expect(original.submissionNumber).toBe('S001')
    expect(original.declinedBy).toBeUndefined()
  })
})
