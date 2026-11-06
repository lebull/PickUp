import type { ColKey } from './csvColumns.ts'

export const DEFAULT_SUBMISSION_CONVERTER_ID = 'nyff-2025-moonlight' as const

export type SubmissionConverterId =
  | 'nyff-2025-moonlight'
  | 'nyff-2026-standard'

export interface SubmissionConverter {
  id: SubmissionConverterId
  name: string
  description: string
  createdAt: string
  supportsMoonlight: boolean
  headers: Partial<Record<ColKey, string>>
}

const converterById: Record<SubmissionConverterId, SubmissionConverter> = {
  'nyff-2025-moonlight': {
    id: 'nyff-2025-moonlight',
    name: 'NYFF 2025 (Moonlight)',
    description: 'Legacy sheet with moonlight fields and stage preferences.',
    createdAt: '2025-01-01',
    supportsMoonlight: true,
    headers: {
      SUBMISSION_NUMBER: 'Submission #',
      TIMESTAMP: 'Timestamp',
      EMAIL: 'Email Address',
      DJ_NAME: 'DJ Name',
      FUR_NAME: 'Fur Name',
      CONTACT_EMAIL: 'Email for communication',
      TELEGRAM_DISCORD: 'Telegram/Discord',
      SOCIAL_MEDIA: 'Social Media',
      PHONE: 'Phone Number',
      SUBMISSION_LINK: 'Submission Link',
      GENRE: 'Mix Genre',
      PRIOR_EXPERIENCE: 'Have you played other shows',
      FORMAT_GEAR: 'Format',
      BIO: 'Tell us about you',
      DAYS_AVAILABLE: 'What days are you available',
      MOONLIGHT_INTEREST: 'Are you interested in DJing for the Moonlight',
      STAGE_PREF_1: 'First Choice',
      STAGE_PREF_2: 'Second Choice',
      STAGE_PREF_3: 'Third Choice',
      STAGE_PREF_4: 'Fourth Choice',
      STAGE_PREF_5: 'Fifth Choice',
      ML_KINK_WHY: 'Why do you want to perform for moonlight',
      ML_GENRE: 'Moonlight Festival Music Genre',
      ML_SUBMISSION_LINK: 'Moonlight Festival Specific Submission',
      NOTES_FOR_JUDGES: 'Notes for judges',
      J1_TECHNICAL: 'Judge 1: Technical',
      J1_FLOW: 'Judge 1: Flow',
      J1_ENTERTAINMENT: 'Judge 1: Entertainment',
      J1_NOTES: 'Judge 1: Notes',
      J2_TECHNICAL: 'Judge 2: Technical',
      J2_FLOW: 'Judge 2: Flow',
      J2_ENTERTAINMENT: 'Judge 2: Entertainment',
      J2_NOTES: 'Judge 2: Notes',
      J3_TECHNICAL: 'Judge 3: Technical',
      J3_FLOW: 'Judge 3: Flow',
      J3_ENTERTAINMENT: 'Judge 3: Entertainment',
      J3_NOTES: 'Judge 3: Notes',
      ML_TECHNICAL: 'Judge ML: Technical',
      ML_FLOW: 'Judge ML: Flow',
      ML_ENTERTAINMENT: 'Judge ML: Entertainment',
      ML_VIBEFIT: 'Judge ML: Vibefit',
      ML_NOTES: 'Judge ML: Notes',
    },
  },
  'nyff-2026-standard': {
    id: 'nyff-2026-standard',
    name: 'NYFF 2026 (Standard)',
    description: 'No moonlight scoring; 3 standard judges and reduced fields.',
    createdAt: '2026-08-17',
    supportsMoonlight: false,
    headers: {
      SUBMISSION_NUMBER: 'Submission #',
      TIMESTAMP: 'Timestamp',
      EMAIL: 'Email Address',
      DJ_NAME: 'DJ Name',
      FUR_NAME: 'Fur Name',
      CONTACT_EMAIL: 'Email for communication',
      TELEGRAM_DISCORD: 'Telegram/Discord',
      PHONE: 'Phone Number (Only for use when all other contact methods fail)',
      SUBMISSION_LINK: 'Submission Link',
      GENRE: 'Mix Genre?',
      PRIOR_EXPERIENCE: 'Have you played other shows/cons?',
      FORMAT_GEAR: 'Format',
      BIO: 'Tell us about you!',
      DAYS_AVAILABLE: 'What days are you available?',
      NOTES_FOR_JUDGES: 'Notes for Judges',
      J1_TECHNICAL: 'Judge 1: Technical',
      J1_FLOW: 'Judge 1: Flow',
      J1_ENTERTAINMENT: 'Judge 1: Entertainment',
      J1_NOTES: 'Judge 1: Notes',
      J2_TECHNICAL: 'Judge 2: Technical',
      J2_FLOW: 'Judge 2: Flow',
      J2_ENTERTAINMENT: 'Judge 2: Entertainment',
      J2_NOTES: 'Judge 2: Notes',
      J3_TECHNICAL: 'Judge 3: Technical',
      J3_FLOW: 'Judge 3: Flow',
      J3_ENTERTAINMENT: 'Judge 3: Entertainment',
      J3_NOTES: 'Judge 3: Notes',
    },
  },
}

export function listSubmissionConverters(): SubmissionConverter[] {
  return Object.values(converterById).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  )
}

export function getSubmissionConverter(
  id?: string
): SubmissionConverter {
  if (id && id in converterById) {
    return converterById[id as SubmissionConverterId]
  }
  return converterById[DEFAULT_SUBMISSION_CONVERTER_ID]
}