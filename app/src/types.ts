import type { MainScore, MLScore } from './scoreCalculation.ts'

export interface StageSchedule {
  startTime: string   // "HH:MM" 24-hour
  endTime: string     // "HH:MM" 24-hour (may be earlier than startTime for cross-midnight events)
}

export interface Stage {
  id: string
  name: string
  /** Whether DJs play sequentially in time slots or simultaneously for the whole event. Defaults to "sequential". */
  stageType: 'sequential' | 'simultaneous'
  activeDays: string[]
  /** Per-day schedule. Key is the day name (e.g. "Friday"). Only used for sequential stages. */
  schedule: Record<string, StageSchedule>
  slotDuration: number // minutes (sequential stages only)
  /** Optional display color as a hex string (e.g. "#6366f1"). Chosen from the curated stage color palette. */
  color?: string
}

export interface SlotAssignment {
  stageId: string
  evening: string
  /** Time-slot index for sequential stage assignments. Omitted for simultaneous assignments. */
  slotIndex?: number
  /** Position index (1–3) for simultaneous stage assignments. Omitted for sequential assignments. */
  positionIndex?: 1 | 2 | 3
  submissionNumber: string
}

export interface LineupState {
  stages: Stage[]
  assignments: SlotAssignment[]
  rowCount: number
}

export interface Project {
  id: string
  name: string
  csvText: string
  stages: Stage[]
  assignments: SlotAssignment[]
  discardedSubmissions: string[]
  rowCount: number
  createdAt: string  // ISO timestamp
  updatedAt: string  // ISO timestamp
}

export interface Submission {
  // identity
  submissionNumber: string
  djName: string
  furName: string
  contactEmail: string
  telegramDiscord: string
  socialMedia: string
  phone: string
  // submission
  submissionLink: string
  genre: string
  priorExperience: string
  formatGear: string
  bio: string
  daysAvailable: string
  notesForJudges: string
  // stage preferences (up to 5)
  stagePreferences: string[]
  // moonlight
  moonlightInterest: boolean
  mlKinkWhy: string
  mlGenre: string
  mlSubmissionLink: string
  // raw judge scores
  j1Technical: number | null
  j1Flow: number | null
  j1Entertainment: number | null
  j1Notes: string
  j2Technical: number | null
  j2Flow: number | null
  j2Entertainment: number | null
  j2Notes: string
  j3Technical: number | null
  j3Flow: number | null
  j3Entertainment: number | null
  j3Notes: string
  mlTechnical: number | null
  mlFlow: number | null
  mlEntertainment: number | null
  mlVibefit: string
  mlNotes: string
  // computed
  mainScore: MainScore
  mlScore: MLScore
}
