import type { MainScore, MLScore } from './scoreCalculation.ts'

export interface StageSchedule {
  startTime: string   // "HH:MM" 24-hour
  endTime: string     // "HH:MM" 24-hour (may be earlier than startTime for cross-midnight events)
}

export interface Stage {
  id: string
  name: string
  activeDays: string[]
  /** Per-day schedule. Key is the day name (e.g. "Friday"). */
  schedule: Record<string, StageSchedule>
  slotDuration: number // minutes
}

export interface SlotAssignment {
  stageId: string
  evening: string
  slotIndex: number
  djName: string
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
  rowCount: number
  createdAt: string  // ISO timestamp
  updatedAt: string  // ISO timestamp
}

export interface Submission {
  // identity
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
