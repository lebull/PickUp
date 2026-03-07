import Papa from 'papaparse'
import { buildColIndex } from './csvColumns.ts'
import { parseScore, computeMainScore, computeMLScore } from './scoreCalculation.ts'
import type { Submission } from './types.ts'

function str(row: string[], idx: number): string {
  return (row[idx] ?? '').trim()
}

export function parseSubmissions(csvText: string): Submission[] {
  const result = Papa.parse<string[]>(csvText, {
    skipEmptyLines: true,
  })

  const rows = result.data as string[][]
  if (rows.length < 2) return []

  const COL = buildColIndex(rows[0])

  return rows.slice(1).map((row): Submission => ({
    submissionNumber: str(row, COL.SUBMISSION_NUMBER),
    djName: str(row, COL.DJ_NAME),
    furName: str(row, COL.FUR_NAME),
    contactEmail: str(row, COL.CONTACT_EMAIL),
    telegramDiscord: str(row, COL.TELEGRAM_DISCORD),
    socialMedia: str(row, COL.SOCIAL_MEDIA),
    phone: str(row, COL.PHONE),
    submissionLink: str(row, COL.SUBMISSION_LINK),
    genre: str(row, COL.GENRE),
    priorExperience: str(row, COL.PRIOR_EXPERIENCE),
    formatGear: str(row, COL.FORMAT_GEAR),
    bio: str(row, COL.BIO),
    daysAvailable: str(row, COL.DAYS_AVAILABLE),
    notesForJudges: str(row, COL.NOTES_FOR_JUDGES),
    stagePreferences: [
      str(row, COL.STAGE_PREF_1),
      str(row, COL.STAGE_PREF_2),
      str(row, COL.STAGE_PREF_3),
      str(row, COL.STAGE_PREF_4),
      str(row, COL.STAGE_PREF_5),
    ].filter(Boolean),
    moonlightInterest: str(row, COL.MOONLIGHT_INTEREST).toLowerCase() === 'yes',
    mlKinkWhy: str(row, COL.ML_KINK_WHY),
    mlGenre: str(row, COL.ML_GENRE),
    mlSubmissionLink: str(row, COL.ML_SUBMISSION_LINK),
    j1Technical: parseScore(row[COL.J1_TECHNICAL]),
    j1Flow: parseScore(row[COL.J1_FLOW]),
    j1Entertainment: parseScore(row[COL.J1_ENTERTAINMENT]),
    j1Notes: str(row, COL.J1_NOTES),
    j2Technical: parseScore(row[COL.J2_TECHNICAL]),
    j2Flow: parseScore(row[COL.J2_FLOW]),
    j2Entertainment: parseScore(row[COL.J2_ENTERTAINMENT]),
    j2Notes: str(row, COL.J2_NOTES),
    j3Technical: parseScore(row[COL.J3_TECHNICAL]),
    j3Flow: parseScore(row[COL.J3_FLOW]),
    j3Entertainment: parseScore(row[COL.J3_ENTERTAINMENT]),
    j3Notes: str(row, COL.J3_NOTES),
    mlTechnical: parseScore(row[COL.ML_TECHNICAL]),
    mlFlow: parseScore(row[COL.ML_FLOW]),
    mlEntertainment: parseScore(row[COL.ML_ENTERTAINMENT]),
    mlVibefit: str(row, COL.ML_VIBEFIT),
    mlNotes: str(row, COL.ML_NOTES),
    mainScore: computeMainScore(row, COL),
    mlScore: computeMLScore(row, COL),
  }))
}
