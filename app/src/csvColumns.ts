/**
 * Canonical header substrings for each logical column.
 * Each value is matched case-insensitively against the actual CSV header row.
 * For columns that share the same prefix (e.g. multiple "Judge 2" columns),
 * provide enough context to uniquely identify the right one.
 */
export const COL_HEADERS = {
  SUBMISSION_NUMBER:  'Submission #',
  TIMESTAMP:          'Timestamp',
  EMAIL:              'Email Address',
  DJ_NAME:            'DJ Name',
  FUR_NAME:           'Fur Name',
  CONTACT_EMAIL:      'Email for communication',
  TELEGRAM_DISCORD:   'Telegram/Discord',
  SOCIAL_MEDIA:       'Social Media',
  PHONE:              'Phone Number',
  SUBMISSION_LINK:    'Submission Link',
  GENRE:              'Mix Genre',
  PRIOR_EXPERIENCE:   'Have you played other shows',
  FORMAT_GEAR:        'Format',
  BIO:                'Tell us about you',
  DAYS_AVAILABLE:     'What days are you available',
  MOONLIGHT_INTEREST: 'Are you interested in DJing for the Moonlight',
  STAGE_PREF_1:       'First Choice',
  STAGE_PREF_2:       'Second Choice',
  STAGE_PREF_3:       'Third Choice',
  STAGE_PREF_4:       'Fourth Choice',
  STAGE_PREF_5:       'Fifth Choice',
  ML_KINK_WHY:        'Why do you want to perform for moonlight',
  ML_GENRE:           'Moonlight Festival Music Genre',
  ML_SUBMISSION_LINK: 'Moonlight Festival Specific Submission',
  NOTES_FOR_JUDGES:   'Notes for judges',
  J1_TECHNICAL:       'Judge 1: Technical',
  J1_FLOW:            'Judge 1: Flow',
  J1_ENTERTAINMENT:   'Judge 1: Entertainment',
  J1_NOTES:           'Judge 1: Notes',
  J2_TECHNICAL:       'Judge 2: Technical',
  J2_FLOW:            'Judge 2: Flow',
  J2_ENTERTAINMENT:   'Judge 2: Entertainment',
  J2_NOTES:           'Judge 2: Notes',
  J3_TECHNICAL:       'Judge 3: Technical',
  J3_FLOW:            'Judge 3: Flow',
  J3_ENTERTAINMENT:   'Judge 3: Entertainment',
  J3_NOTES:           'Judge 3: Notes',
  ML_TECHNICAL:       'Judge ML: Technical',
  ML_FLOW:            'Judge ML: Flow',
  ML_ENTERTAINMENT:   'Judge ML: Entertainment',
  ML_VIBEFIT:         'Judge ML: Vibefit',
  ML_NOTES:           'Judge ML: Notes',
} as const

export type ColKey = keyof typeof COL_HEADERS
export type ColIndex = Record<ColKey, number>

/**
 * Resolves the header-name map into a numeric index map by scanning the
 * actual CSV header row.  Logs a warning for any column that cannot be found.
 */
export function buildColIndex(headerRow: string[]): ColIndex {
  const lower = headerRow.map((h) => h.toLowerCase())
  const index = {} as ColIndex

  for (const key of Object.keys(COL_HEADERS) as ColKey[]) {
    const needle = COL_HEADERS[key].toLowerCase()
    const idx = lower.findIndex((h) => h.includes(needle))
    if (idx === -1) {
      console.warn(`[CSV] Could not find column for "${key}" (looking for "${COL_HEADERS[key]}")`)
    }
    index[key] = idx
  }

  return index
}
