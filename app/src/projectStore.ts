import { openDB } from 'idb'
import type { Project, SlotAssignment, Assignment } from './types'

const DB_NAME = 'pickup-lineups'
const STORE_NAME = 'projects'
const DB_VERSION = 2

function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // Drop the old filename-keyed lineups store if it exists
      if (oldVersion < 2 && db.objectStoreNames.contains('lineups')) {
        db.deleteObjectStore('lineups')
      }
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    },
  })
}

export async function createProject(name: string): Promise<Project> {
  const now = new Date().toISOString()
  const project: Project = {
    id: crypto.randomUUID(),
    name,
    csvText: '',
    stages: [],
    assignments: [],
    discardedSubmissions: [],
    rowCount: 0,
    createdAt: now,
    updatedAt: now,
  }
  const db = await getDB()
  await db.put(STORE_NAME, project, project.id)
  return project
}

/**
 * Normalizes a project loaded from IndexedDB to ensure fields added in later
 * versions are present. This provides backward compatibility without a DB migration.
 */
export function normalizeProject(project: Project): Project {
  return {
    ...project,
    // stageType was added in the silent-disco-event-type change.
    // Legacy stages without the field default to "sequential".
    stages: project.stages.map((s) => {
      const normalizedStageType = s.stageType ?? 'sequential'
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
        slotDuration: s.slotDuration ?? 60,
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
  const db = await getDB()
  const project: Project | undefined = await db.get(STORE_NAME, id)
  return project ? normalizeProject(project) : null
}

export async function listProjects(): Promise<Project[]> {
  const db = await getDB()
  const all: Project[] = await db.getAll(STORE_NAME)
  return all
    .map(normalizeProject)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export async function saveProject(project: Project): Promise<void> {
  const updated: Project = { ...project, updatedAt: new Date().toISOString() }
  const db = await getDB()
  await db.put(STORE_NAME, updated, updated.id)
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
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
