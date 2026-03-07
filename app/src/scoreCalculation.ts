import type { ColIndex } from './csvColumns.ts'

export function parseScore(value: string | undefined): number | null {
  if (value === undefined || value.trim() === '') return null
  const n = Number(value)
  return isFinite(n) ? n : null
}

export function computeJudgeAvg(
  technical: number | null,
  flow: number | null,
  entertainment: number | null
): number | null {
  if (technical === null || flow === null || entertainment === null) return null
  return Math.round(((technical + flow + entertainment) / 3) * 100) / 100
}

export interface MainScore {
  avg: number | null
  sum: number | null
  /** true when only one of the two judges has scored */
  partial: boolean
}

export interface MLScore {
  avg: number | null
  sum: number | null
}

export function computeMainScore(row: string[], COL: ColIndex): MainScore {
  const j1Tech = parseScore(row[COL.J1_TECHNICAL])
  const j1Flow = parseScore(row[COL.J1_FLOW])
  const j1Ent = parseScore(row[COL.J1_ENTERTAINMENT])
  const j2Tech = parseScore(row[COL.J2_TECHNICAL])
  const j2Flow = parseScore(row[COL.J2_FLOW])
  const j2Ent = parseScore(row[COL.J2_ENTERTAINMENT])
  const j3Tech = parseScore(row[COL.J3_TECHNICAL])
  const j3Flow = parseScore(row[COL.J3_FLOW])
  const j3Ent = parseScore(row[COL.J3_ENTERTAINMENT])

  const j1Avg = computeJudgeAvg(j1Tech, j1Flow, j1Ent)
  const j2Avg = computeJudgeAvg(j2Tech, j2Flow, j2Ent)
  const j3Avg = computeJudgeAvg(j3Tech, j3Flow, j3Ent)

  const hasJ1 = j1Avg !== null
  const hasJ2 = j2Avg !== null
  const hasJ3 = j3Avg !== null

  if (!hasJ1 && !hasJ2 && !hasJ3) {
    return { avg: null, sum: null, partial: false }
  }

  const judgeCount = [hasJ1, hasJ2, hasJ3].filter(Boolean).length
  const partial = judgeCount < 3

  const scores = [j1Avg, j2Avg, j3Avg].filter((s): s is number => s !== null)
  const avg = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100

  const rawComponents = [j1Tech, j1Flow, j1Ent, j2Tech, j2Flow, j2Ent, j3Tech, j3Flow, j3Ent].filter(
    (v): v is number => v !== null
  )
  const sum = rawComponents.reduce((a, b) => a + b, 0)

  return { avg, sum, partial }
}

export function computeMLScore(row: string[], COL: ColIndex): MLScore {
  const tech = parseScore(row[COL.ML_TECHNICAL])
  const flow = parseScore(row[COL.ML_FLOW])
  const ent = parseScore(row[COL.ML_ENTERTAINMENT])
  // ML_VIBEFIT (col 39) is excluded — non-numeric marker

  const avg = computeJudgeAvg(tech, flow, ent)
  if (avg === null) return { avg: null, sum: null }

  const sum = tech! + flow! + ent!
  return { avg, sum }
}
