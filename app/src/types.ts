import type { MainScore, MLScore } from './scoreCalculation.ts'

export interface StageSchedule {
  /** Defaults to 'timed' when omitted. Special events are unscheduled pick lists. */
  eventType?: 'timed' | 'special'
  startTime?: string   // "HH:MM" 24-hour
  endTime?: string     // "HH:MM" 24-hour (may be earlier than startTime for cross-midnight events)
  /** Optional human-readable label for this event block (e.g. "Afternoon Set"). */
  label?: string
}

export interface Stage {
  id: string
  name: string
  /** Stage type: 'sequential' (time-slot based), 'simultaneous' (concurrent 3-DJ), or 'special' (open-ended pick list). */
  stageType: 'sequential' | 'simultaneous' | 'special'
  /** Active convention days. Required for sequential/simultaneous stages; omitted for special stages. */
  activeDays?: string[]
  /** Per-day event schedule. Key is the day name (e.g. "Friday"). Each day holds one or more timed event blocks. Only used for sequential/simultaneous stages. */
  schedule?: Record<string, StageSchedule[]>
  /** Slot duration in minutes. Required for sequential stages; omitted for simultaneous/special stages. */
  slotDuration?: number
  /** Optional display color as a hex string (e.g. "#6366f1"). Chosen from the curated stage color palette. */
  color?: string
  /** When true, this stage uses ML scores for sorting and Moonlight-interest filtering in the DJ selection panel. */
  useMoonlightScores?: boolean
}

interface SlotAssignmentBase {
  stageId: string
  evening: string
  /** Zero-based index into the stage's schedule array for this evening. Identifies which event this slot belongs to. Sequential stages only. */
  eventIndex?: number
  /** Time-slot index for sequential stage assignments. Omitted for simultaneous assignments. */
  slotIndex?: number
  /** Position index (1–3) for simultaneous stage assignments. Omitted for sequential assignments. */
  positionIndex?: 1 | 2 | 3
}

export interface DJSlotAssignment extends SlotAssignmentBase {
  type: 'dj'
  submissionNumber: string
}

export interface BlankSlotAssignment extends SlotAssignmentBase {
  type: 'blank'
  blankLabel?: string
}

export interface SpecialDJAssignment {
  type: 'dj'
  stageId: string
  submissionNumber: string
}

export interface SpecialBlankAssignment {
  type: 'blank'
  stageId: string
  blankLabel?: string
}

export type SlotAssignment = DJSlotAssignment | BlankSlotAssignment
export type SpecialAssignment = SpecialDJAssignment | SpecialBlankAssignment
export type Assignment = SlotAssignment | SpecialAssignment

export function isBlankAssignment(a: SlotAssignment): a is BlankSlotAssignment {
  return a.type === 'blank'
}

export function getBlankLabel(a: BlankSlotAssignment): string {
  return a.blankLabel || 'Blocked'
}

export function isSlotAssignment(a: Assignment): a is SlotAssignment {
  return 'evening' in a
}

export function isSpecialAssignment(a: Assignment): a is SpecialAssignment {
  return !('evening' in a) && 'stageId' in a
}

export function isSpecialBlankAssignment(a: SpecialAssignment): a is SpecialBlankAssignment {
  return a.type === 'blank'
}

export function getSpecialBlankLabel(a: SpecialBlankAssignment): string {
  return a.blankLabel || 'Blocked'
}

/** Identifies a slot for drag-and-drop move operations. */
export type SlotCoord =
  | { stageId: string; evening: string; slotIndex: number; eventIndex: number }
  | { stageId: string; evening: string; positionIndex: 1 | 2 | 3; eventIndex: number }

export function isSimultaneousCoord(c: SlotCoord): c is { stageId: string; evening: string; positionIndex: 1 | 2 | 3; eventIndex: number } {
  return 'positionIndex' in c
}

export interface LineupState {
  stages: Stage[]
  assignments: Assignment[]
  rowCount: number
}

export interface Project {
  id: string
  name: string
  csvText: string
  stages: Stage[]
  assignments: Assignment[]
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
