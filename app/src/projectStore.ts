import { collection, doc, getDoc, getDocs, setDoc, deleteDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import type { Project, SlotAssignment, Assignment, SlotCoord, DJSlotAssignment } from './types'
import { isSlotAssignment, isBlankAssignment, isSimultaneousCoord } from './types'
import { getSubmissionConverter } from './submissionConverters'

function projectsCol() {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Not signed in.')
  return collection(db, 'users', uid, 'projects')
}

export async function createProject(name: string, startDate?: string, endDate?: string): Promise<Project> {
  if (!startDate || !endDate) {
    throw new Error('Project start and end dates are required.')
  }
  if (startDate > endDate) {
    throw new Error('Project start date must be before the end date.')
  }

  const now = new Date().toISOString()
  const project: Project = {
    id: crypto.randomUUID(),
    name,
    supportsMoonlight: false,
    startDate,
    endDate,
    csvText: '',
    stages: [],
    assignments: [],
    discardedSubmissions: [],
    rowCount: 0,
    createdAt: now,
    updatedAt: now,
  }
  await setDoc(doc(projectsCol(), project.id), project)
  return project
}

/**
 * Normalizes a project loaded from IndexedDB to ensure fields added in later
 * versions are present. This provides backward compatibility without a DB migration.
 */
export function normalizeProject(project: Project): Project {
  const inferredMoonlightSupport = getSubmissionConverter(project.submissionConverterId).supportsMoonlight
  return {
    ...project,
    supportsMoonlight: project.supportsMoonlight ?? inferredMoonlightSupport,
    startDate: project.startDate ?? '',
    endDate: project.endDate ?? '',
    // stageType was added in the silent-disco-event-type change.
    // Legacy stages without the field default to "sequential".
    stages: project.stages.map((s) => {
      const normalizedStageType = s.stageType ?? 'sequential'
      const normalizedSlotDuration = (() => {
        const raw = typeof s.slotDuration === 'number' ? s.slotDuration : Number(s.slotDuration)
        return Number.isFinite(raw) && raw > 0 ? raw : 60
      })()
      // For special stages, don't require schedule or slotDuration
      if (normalizedStageType === 'special') {
        return {
          ...s,
          stageType: normalizedStageType,
          activeDays: s.activeDays ?? [],
          schedule: s.schedule ?? {},
          // slotDuration omitted for special stages
        }
      }
      // For sequential/simultaneous stages, keep existing schedule normalization
      return {
        ...s,
        stageType: normalizedStageType,
        activeDays: s.activeDays ?? [],
        schedule: Object.fromEntries(
          Object.entries(s.schedule ?? {}).map(([day, events]) => {
            const normalizedEvents = (Array.isArray(events) ? events : [events]).map((event) => ({
              ...event,
              eventType: event.eventType ?? 'timed',
            }))
            return [day, normalizedEvents]
          })
        ),
        slotDuration: normalizedSlotDuration,
      }
    }),
    // discardedSubmissions was added in the discard-submission change.
    // Legacy projects without the field default to an empty array.
    discardedSubmissions: project.discardedSubmissions ?? [],
    // type was added in the blank-slot-assignment change.
    // Legacy DJ assignments without the field default to type: 'dj'.
    // Also handle new special assignments.
    assignments: (project.assignments ?? []).map((a): Assignment => {
      const aAny = a as unknown as Record<string, unknown>
      // Special assignments (no 'evening' field)
      if (!('evening' in a)) {
        return {
          ...a,
          type: (aAny.type === 'blank' || aAny.type === 'dj') ? aAny.type : 'dj',
        } as Assignment
      }
      // Slot assignments
      const normalized = (aAny.type === 'blank' || aAny.type === 'dj')
        ? ({ ...a } as SlotAssignment)
        : ({ ...a, type: 'dj' } as SlotAssignment)
      if (normalized.slotIndex != null && normalized.eventIndex == null) {
        return { ...normalized, eventIndex: 0 }
      }
      return normalized
    }),
  }
}

export async function getProject(id: string): Promise<Project | null> {
  const snap = await getDoc(doc(projectsCol(), id))
  return snap.exists() ? normalizeProject(snap.data() as Project) : null
}

export async function listProjects(): Promise<Project[]> {
  const snap = await getDocs(projectsCol())
  const all = snap.docs.map((d) => d.data() as Project)
  return all
    .map(normalizeProject)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export async function saveProject(project: Project): Promise<void> {
  const updated: Project = { ...project, updatedAt: new Date().toISOString() }
  await setDoc(doc(projectsCol(), updated.id), updated)
}

export async function deleteProject(id: string): Promise<void> {
  await deleteDoc(doc(projectsCol(), id))
}

export function exportProject(project: Project): void {
  const json = JSON.stringify(project, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${project.name}.pickup.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importProjectFromFile(file: File): Promise<Project> {
  const text = await file.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('File is not valid JSON.')
  }

  // Basic schema validation
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    typeof (parsed as Record<string, unknown>).name !== 'string' ||
    typeof (parsed as Record<string, unknown>).startDate !== 'string' ||
    typeof (parsed as Record<string, unknown>).endDate !== 'string' ||
    !Array.isArray((parsed as Record<string, unknown>).stages) ||
    !Array.isArray((parsed as Record<string, unknown>).assignments)
  ) {
    throw new Error('File does not appear to be a valid Pickup project export.')
  }

  const source = parsed as Project
  const now = new Date().toISOString()
  const project: Project = {
    ...source,
    id: crypto.randomUUID(), // assign a new UUID to avoid collisions
    createdAt: source.createdAt ?? now,
    updatedAt: now,
  }

  const normalized = normalizeProject(project)
  await saveProject(normalized)
  return normalized
}

// ── Pure acceptance-tracking mutations ────────────────────────────────────────

function matchesSlotCoord(a: SlotAssignment, slotCoord: SlotCoord): boolean {
  if (isSimultaneousCoord(slotCoord)) {
    return a.stageId === slotCoord.stageId && a.evening === slotCoord.evening &&
      a.positionIndex === slotCoord.positionIndex && (a.eventIndex ?? 0) === slotCoord.eventIndex
  }
  return a.stageId === slotCoord.stageId && a.evening === slotCoord.evening &&
    a.slotIndex === slotCoord.slotIndex && (a.eventIndex ?? 0) === slotCoord.eventIndex
}

/**
 * Returns a new Project with the acceptance status of the specified slot assignment updated.
 */
export function applySetAcceptanceStatus(
  project: Project,
  slotCoord: SlotCoord,
  status: 'pending' | 'yes' | 'no'
): Project {
  return {
    ...project,
    assignments: project.assignments.map((a): Assignment => {
      if (!isSlotAssignment(a) || isBlankAssignment(a)) return a
      if (!matchesSlotCoord(a, slotCoord)) return a
      return { ...(a as DJSlotAssignment), acceptanceStatus: status }
    }),
  }
}

/**
 * Returns a new Project with the declining DJ replaced by a new DJ in the specified slot.
 * The outgoing DJ's submissionNumber is appended to declinedBy, and acceptanceStatus resets to 'pending'.
 */
export function applyReplaceWithDeclineHistory(
  project: Project,
  slotCoord: SlotCoord,
  newSubmissionNumber: string
): Project {
  return {
    ...project,
    assignments: project.assignments.map((a): Assignment => {
      if (!isSlotAssignment(a) || isBlankAssignment(a)) return a
      if (!matchesSlotCoord(a, slotCoord)) return a
      const dj = a as DJSlotAssignment
      const accumulated = [...(dj.declinedBy ?? []), dj.submissionNumber]
      return { ...dj, submissionNumber: newSubmissionNumber, acceptanceStatus: 'pending', declinedBy: accumulated }
    }),
  }
}
