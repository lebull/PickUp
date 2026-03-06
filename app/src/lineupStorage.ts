import { openDB } from 'idb'
import type { LineupState } from './types'

const DB_NAME = 'pickup-lineups'
const STORE_NAME = 'lineups'
const DB_VERSION = 1

function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME)
    },
  })
}

export async function saveLineup(fileName: string, state: LineupState): Promise<void> {
  const db = await getDB()
  await db.put(STORE_NAME, state, fileName)
}

export interface LoadLineupResult {
  state: LineupState
  rowCountMismatch: boolean
}

export async function loadLineup(
  fileName: string,
  currentRowCount: number
): Promise<LoadLineupResult | null> {
  const db = await getDB()
  const state: LineupState | undefined = await db.get(STORE_NAME, fileName)
  if (!state) return null
  return {
    state,
    rowCountMismatch: state.rowCount !== currentRowCount,
  }
}

export async function clearLineup(fileName: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, fileName)
}
