import { openDB } from 'idb'
import type { Project } from './types'

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
function normalizeProject(project: Project): Project {
  return {
    ...project,
    // stageType was added in the silent-disco-event-type change.
    // Legacy stages without the field default to "sequential".
    stages: project.stages.map((s) => ({
      ...s,
      stageType: s.stageType ?? 'sequential',
    })),
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

  await saveProject(project)
  return project
}
