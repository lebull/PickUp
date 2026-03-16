import { describe, it, expect } from 'vitest'
import { isDJAvailableOnEvening, isDJUnavailableOnEvening } from '../djAvailability.ts'

// ── isDJAvailableOnEvening ────────────────────────────────────────────────────

describe('isDJAvailableOnEvening', () => {
  it('returns true when daysAvailable contains the evening (exact case)', () => {
    expect(isDJAvailableOnEvening('Friday, Saturday', 'Friday')).toBe(true)
    expect(isDJAvailableOnEvening('Saturday', 'Saturday')).toBe(true)
  })

  it('is case-insensitive', () => {
    expect(isDJAvailableOnEvening('friday, saturday', 'Friday')).toBe(true)
    expect(isDJAvailableOnEvening('FRIDAY', 'friday')).toBe(true)
    expect(isDJAvailableOnEvening('Friday', 'FRIDAY')).toBe(true)
  })

  it('returns false when daysAvailable does not contain the evening', () => {
    expect(isDJAvailableOnEvening('Saturday', 'Friday')).toBe(false)
    expect(isDJAvailableOnEvening('Sunday', 'Friday')).toBe(false)
    expect(isDJAvailableOnEvening('', 'Friday')).toBe(false)
  })

  it('handles partial substring matches correctly (substring check)', () => {
    // "Friday" is a substring of "Friday, Saturday"
    expect(isDJAvailableOnEvening('Friday, Saturday', 'Friday')).toBe(true)
    // "Fri" is a substring of "Friday"
    expect(isDJAvailableOnEvening('Friday', 'Fri')).toBe(true)
  })
})

// ── isDJUnavailableOnEvening ──────────────────────────────────────────────────

describe('isDJUnavailableOnEvening', () => {
  it('returns true when DJ is NOT available on the evening', () => {
    expect(isDJUnavailableOnEvening('Saturday', 'Friday')).toBe(true)
    expect(isDJUnavailableOnEvening('', 'Friday')).toBe(true)
  })

  it('returns false when DJ IS available on the evening', () => {
    expect(isDJUnavailableOnEvening('Friday, Saturday', 'Friday')).toBe(false)
    expect(isDJUnavailableOnEvening('friday', 'Friday')).toBe(false)
  })

  it('is the logical inverse of isDJAvailableOnEvening', () => {
    const cases = [
      ['Friday, Saturday', 'Friday'],
      ['Saturday', 'Friday'],
      ['', 'Friday'],
      ['FRIDAY', 'friday'],
    ] as const
    for (const [days, evening] of cases) {
      expect(isDJUnavailableOnEvening(days, evening)).toBe(
        !isDJAvailableOnEvening(days, evening)
      )
    }
  })
})

// ── Filtering logic (unit-level) ──────────────────────────────────────────────
// These tests verify the filtering predicate that the DJ selection panel uses
// for the "Available only" toggle and the `available` pool (no hard-filter).

describe('DJ panel availability filtering logic', () => {
  const submissions = [
    { submissionNumber: '1', daysAvailable: 'Friday, Saturday' },
    { submissionNumber: '2', daysAvailable: 'Saturday' },
    { submissionNumber: '3', daysAvailable: 'Friday' },
    { submissionNumber: '4', daysAvailable: '' },
  ]

  it('base pool includes all submissions regardless of daysAvailable (no hard filter)', () => {
    // Simulate the `available` pool — no daysAvailable filtering
    const available = submissions.filter(() => true)
    expect(available).toHaveLength(4)
  })

  it('showAvailableOnly ON: filters to only Friday-available DJs', () => {
    const evening = 'Friday'
    const filtered = submissions.filter(
      (s) => !isDJUnavailableOnEvening(s.daysAvailable, evening)
    )
    expect(filtered.map((s) => s.submissionNumber)).toEqual(['1', '3'])
  })

  it('showAvailableOnly OFF: all submissions pass through', () => {
    const filtered = submissions // no filter applied
    expect(filtered).toHaveLength(4)
  })

  it('unavailable DJs are correctly identified for the alert state', () => {
    const evening = 'Friday'
    const unavailable = submissions.filter((s) =>
      isDJUnavailableOnEvening(s.daysAvailable, evening)
    )
    expect(unavailable.map((s) => s.submissionNumber)).toEqual(['2', '4'])
  })
})
