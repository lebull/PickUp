import type { TimeFormat } from './AppPreferencesContext.ts'
import { formatTimeLabel, getEventLabel, getSlotLabels } from './lineupUtils.ts'
import type { DJSlotAssignment, Project, Stage } from './types.ts'
import { isSlotAssignment } from './types.ts'

export interface AssignmentDisplayContext {
  stageName: string
  eveningLabel: string
  slotLabel: string
  summary: string
}

export function getAssignmentDisplayContext(
  stages: Stage[],
  assignment: DJSlotAssignment,
  timeFormat: TimeFormat
): AssignmentDisplayContext {
  const stage = stages.find((s) => s.id === assignment.stageId)
  const stageName = stage?.name ?? 'Unknown Stage'
  const eveningLabel = assignment.evening || 'Unscheduled'

  let slotLabel: string
  if (assignment.positionIndex != null) {
    const eventIndex = assignment.eventIndex ?? 0
    const event = stage?.schedule?.[assignment.evening]?.[eventIndex]
    const eventLabel = event
      ? getEventLabel(event, eventIndex)
      : `Set ${eventIndex + 1}`
    slotLabel = `${eventLabel} · Position ${assignment.positionIndex}`
  } else if (stage && assignment.slotIndex != null) {
    const eventIndex = assignment.eventIndex ?? 0
    const labels = getSlotLabels(stage, assignment.evening, eventIndex)
    const rawLabel = labels[assignment.slotIndex] ?? `Slot ${assignment.slotIndex + 1}`
    slotLabel = /^\d{2}:\d{2}$/.test(rawLabel)
      ? formatTimeLabel(rawLabel, timeFormat)
      : rawLabel
  } else {
    slotLabel = `Slot ${(assignment.slotIndex ?? 0) + 1}`
  }

  return {
    stageName,
    eveningLabel,
    slotLabel,
    summary: `${stageName} · ${eveningLabel} · ${slotLabel}`,
  }
}

export function findDeclinedAssignmentForSubmission(
  project: Project,
  submissionNumber: string
): DJSlotAssignment | null {
  for (let i = project.assignments.length - 1; i >= 0; i--) {
    const assignment = project.assignments[i]
    if (!isSlotAssignment(assignment) || assignment.type !== 'dj') continue
    if (assignment.submissionNumber !== submissionNumber) continue
    if ((assignment.acceptanceStatus ?? 'pending') !== 'no') continue
    return assignment
  }
  return null
}

export function getSubmissionDeclinedNotice(
  project: Project,
  submissionNumber: string,
  timeFormat: TimeFormat
): { assignment: DJSlotAssignment; context: AssignmentDisplayContext } | null {
  const assignment = findDeclinedAssignmentForSubmission(project, submissionNumber)
  if (!assignment) return null
  return {
    assignment,
    context: getAssignmentDisplayContext(project.stages, assignment, timeFormat),
  }
}
