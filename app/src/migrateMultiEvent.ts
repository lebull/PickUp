/**
 * Pure migration logic for the multi-event-per-stage-per-day change.
 * Converts legacy Pickup project JSON (single StageSchedule per day, no eventIndex
 * on slot assignments) to the new format (StageSchedule[] per day, eventIndex on
 * sequential slot assignments).
 *
 * Imported by both the CLI migration script and unit tests.
 */

export interface LegacyStageSchedule {
  eventType?: 'timed' | 'special'
  startTime?: string
  endTime?: string
  label?: string
}

export interface LegacyStage {
  id: string
  name: string
  schedule: Record<string, LegacyStageSchedule | LegacyStageSchedule[]>
  [key: string]: unknown
}

export interface LegacyAssignment {
  stageId: string
  evening: string
  eventIndex?: number
  slotIndex?: number
  positionIndex?: number
  [key: string]: unknown
}

export interface LegacyProject {
  stages: LegacyStage[]
  assignments: LegacyAssignment[]
  [key: string]: unknown
}

export function migrateProject(project: LegacyProject): LegacyProject {
  const stages = project.stages.map((stage) => {
    const newSchedule: Record<string, LegacyStageSchedule[]> = {}
    for (const [day, value] of Object.entries(stage.schedule)) {
      if (Array.isArray(value)) {
        // Already in new format — leave as-is (idempotent).
        newSchedule[day] = (value as LegacyStageSchedule[]).map((event) => ({
          ...event,
          eventType: event.eventType ?? 'timed',
        }))
      } else {
        // Legacy single-object form — wrap in array.
        newSchedule[day] = [{ ...(value as LegacyStageSchedule), eventType: (value as LegacyStageSchedule).eventType ?? 'timed' }]
      }
    }
    return { ...stage, schedule: newSchedule }
  })

  const assignments = project.assignments.map((a) => {
    // Only sequential slot assignments need eventIndex (positionIndex = simultaneous).
    if (a.slotIndex != null && a.eventIndex == null) {
      return { ...a, eventIndex: 0 }
    }
    return a
  })

  return { ...project, stages, assignments }
}
