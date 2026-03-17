import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { buildPeekContent, hasAnyScore } from '../scorePeekUtils'
import type { Submission } from '../types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeSubmission(overrides: Partial<Submission> = {}): Submission {
  return {
    submissionNumber: 'S001',
    djName: 'DJ Alpha',
    furName: '',
    contactEmail: '',
    telegramDiscord: '',
    socialMedia: '',
    phone: '',
    submissionLink: '',
    genre: 'Techno',
    priorExperience: '',
    formatGear: 'CDJs',
    bio: '',
    daysAvailable: 'Friday',
    notesForJudges: '',
    stagePreferences: [],
    moonlightInterest: false,
    mlKinkWhy: '',
    mlGenre: '',
    mlSubmissionLink: '',
    j1Technical: 8,
    j1Flow: 7,
    j1Entertainment: 9,
    j1Notes: 'Great energy',
    j2Technical: null,
    j2Flow: null,
    j2Entertainment: null,
    j2Notes: '',
    j3Technical: null,
    j3Flow: null,
    j3Entertainment: null,
    j3Notes: '',
    mlTechnical: null,
    mlFlow: null,
    mlEntertainment: null,
    mlVibefit: '',
    mlNotes: '',
    mainScore: { avg: 8.0, sum: 24, partial: true },
    mlScore: { avg: null, sum: null },
    ...overrides,
  }
}

// ── 5.1: buildPeekContent header ──────────────────────────────────────────────

describe('buildPeekContent', () => {
  it('includes the avg score header when scores are present', () => {
    const sub = makeSubmission()
    const content = buildPeekContent(sub, false)
    const { getByText } = render(<>{content}</>)
    expect(getByText('8.00')).toBeTruthy()
  })

  it('includes format/gear in the header', () => {
    const sub = makeSubmission()
    const content = buildPeekContent(sub, false)
    const { getByText } = render(<>{content}</>)
    expect(getByText('CDJs')).toBeTruthy()
  })

  it('returns null when no scores are present', () => {
    const sub = makeSubmission({
      j1Technical: null, j1Flow: null, j1Entertainment: null,
      mainScore: { avg: null, sum: null, partial: false },
    })
    expect(buildPeekContent(sub, false)).toBeNull()
  })

  it('shows ML avg and gear in moonlight context', () => {
    const sub = makeSubmission({
      mlTechnical: 9, mlFlow: 8, mlEntertainment: 7,
      mlScore: { avg: 8.0, sum: 24 },
      moonlightInterest: true,
    })
    const content = buildPeekContent(sub, true)
    const { getAllByText } = render(<>{content}</>)
    // avg 8.00 appears in both main and ml, getAllByText handles duplicates
    expect(getAllByText('8.00').length).toBeGreaterThanOrEqual(1)
    expect(getAllByText('CDJs').length).toBeGreaterThanOrEqual(1)
  })
})

describe('hasAnyScore', () => {
  it('returns true when at least one judge score exists', () => {
    expect(hasAnyScore(makeSubmission(), false)).toBe(true)
  })

  it('returns false when all judge scores are null', () => {
    const sub = makeSubmission({ j1Technical: null, j1Flow: null, j1Entertainment: null })
    expect(hasAnyScore(sub, false)).toBe(false)
  })

  it('returns true for ML scores when useMoonlight=true', () => {
    const sub = makeSubmission({ mlTechnical: 7, j1Technical: null, j1Flow: null, j1Entertainment: null })
    expect(hasAnyScore(sub, true)).toBe(true)
  })

  it('returns false for ML when all ML scores are null', () => {
    const sub = makeSubmission()
    expect(hasAnyScore(sub, true)).toBe(false)
  })
})
