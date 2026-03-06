/** Column index map for the FWA 2026 DJ Submissions CSV (0-based). */
export const COL = {
  SUBMISSION_NUMBER: 0,
  TIMESTAMP: 1,
  EMAIL: 2,
  DJ_NAME: 3,
  FUR_NAME: 4,
  CONTACT_EMAIL: 5,
  TELEGRAM_DISCORD: 6,
  SOCIAL_MEDIA: 7,
  PHONE: 8,
  SUBMISSION_LINK: 9,
  GENRE: 10,
  PRIOR_EXPERIENCE: 11,
  FORMAT_GEAR: 12,
  BIO: 13,
  DAYS_AVAILABLE: 14,
  MOONLIGHT_INTEREST: 15,
  STAGE_PREF_1: 16,
  STAGE_PREF_2: 17,
  STAGE_PREF_3: 18,
  STAGE_PREF_4: 19,
  STAGE_PREF_5: 20,
  ML_KINK_WHY: 21,
  ML_GENRE: 22,
  ML_SUBMISSION_LINK: 23,
  NOTES_FOR_JUDGES: 24,
  J1_TECHNICAL: 25,
  J1_FLOW: 26,
  J1_ENTERTAINMENT: 27,
  J1_NOTES: 28,
  J2_TECHNICAL: 29,
  J2_FLOW: 30,
  J2_ENTERTAINMENT: 31,
  J2_NOTES: 32,
  ML_TECHNICAL: 33,
  ML_FLOW: 34,
  ML_ENTERTAINMENT: 35,
  ML_VIBEFIT: 36,
  ML_NOTES: 37,
  ML_NOTES_2: 38,
} as const

/** Expected partial header text at key indices for sanity-checking at load time. */
const EXPECTED_HEADERS: Record<number, string> = {
  3: 'DJ Name',
  10: 'Genre',
  14: 'days',
  25: 'Judge 1',
  29: 'Judge 2',
  33: 'Judge ML',
}

export function validateHeaders(headerRow: string[]): void {
  for (const [idxStr, expected] of Object.entries(EXPECTED_HEADERS)) {
    const idx = Number(idxStr)
    const actual = headerRow[idx] ?? ''
    if (!actual.toLowerCase().includes(expected.toLowerCase())) {
      console.warn(
        `[CSV] Header mismatch at column ${idx}: expected to contain "${expected}", got "${actual}"`
      )
    }
  }
}
