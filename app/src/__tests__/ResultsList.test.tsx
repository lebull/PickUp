import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { ProjectContext } from '../ProjectContext'
import { ResultsList } from '../components/ResultsList'
import { AppPreferencesContext } from '../AppPreferencesContext'
import type { Project, Stage, Submission } from '../types'

function makeSubmission(id: string, name: string, overrides: Partial<Submission> = {}): Submission {
  return {
    submissionNumber: id,
    djName: name,
    furName: '',
    contactEmail: '',
    telegramDiscord: '',
    socialMedia: '',
    phone: '',
    submissionLink: '',
    genre: 'House',
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
    j1Technical: null,
    j1Flow: null,
    j1Entertainment: null,
    j1Notes: '',
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
    mainScore: { avg: null, sum: null, partial: false },
    mlScore: { avg: null, sum: null },
    ...overrides,
  }
}

const testStage: Stage = {
  id: 'stage-1',
  name: 'Main Stage',
  stageType: 'sequential',
  activeDays: ['Friday'],
  schedule: {
    Friday: [{ startTime: '20:00', endTime: '22:00' }],
  },
  slotDuration: 60,
}

function makeProject(): Project {
  return {
    id: 'project-1',
    name: 'PickUp Test Project',
    csvText: '',
    stages: [testStage],
    assignments: [
      {
        type: 'dj',
        stageId: 'stage-1',
        evening: 'Friday',
        slotIndex: 0,
        eventIndex: 0,
        submissionNumber: 'S001',
      },
    ],
    discardedSubmissions: [],
    rowCount: 3,
    createdAt: '2026-03-27T00:00:00.000Z',
    updatedAt: '2026-03-27T00:00:00.000Z',
  }
}

function renderResults(project: Project, submissions: Submission[], hiddenNames = false) {
  return render(
    <AppPreferencesContext.Provider
      value={{
        timeFormat: '24h',
        setTimeFormat: vi.fn(),
        hiddenNames,
        setHiddenNames: vi.fn(),
      }}
    >
      <ProjectContext.Provider
        value={{
          project,
          setProject: vi.fn(),
          submissions,
          setSubmissions: vi.fn(),
          rowCountMismatch: false,
          setRowCountMismatch: vi.fn(),
          toggleDiscardSubmission: vi.fn(),
        }}
      >
        <ResultsList />
      </ProjectContext.Provider>
    </AppPreferencesContext.Provider>
  )
}

describe('ResultsList bulk email copy', () => {
  beforeEach(() => {
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn(() => new Promise<void>(() => {})),
      },
    })
  })

  it('opens a rejection-section email modal and copies only rejected DJs with email addresses', async () => {
    const project = makeProject()
    const submissions = [
      makeSubmission('S001', 'DJ Accepted', { contactEmail: 'accepted@example.com' }),
      makeSubmission('S002', 'DJ Rejected', { contactEmail: 'rejected@example.com' }),
      makeSubmission('S003', 'DJ Missing Email'),
    ]

    renderResults(project, submissions)

    const rejectionSection = screen
      .getByRole('heading', { name: 'Did Not Make the Cut' })
      .closest('section')
    expect(rejectionSection).toBeTruthy()

    fireEvent.click(within(rejectionSection as HTMLElement).getByRole('button', { name: 'Copy emails' }))

    const modal = screen.getByRole('dialog', { name: 'Did Not Make the Cut emails' })
    const textarea = within(modal).getByRole('textbox') as HTMLTextAreaElement
    expect(textarea.value).toBe('rejected@example.com')
    expect(textarea.value).not.toContain('accepted@example.com')

    fireEvent.click(within(modal).getByRole('button', { name: 'Copy to clipboard' }))

    await waitFor(() => {
      expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith('rejected@example.com')
    })
  })

  it('still opens accepted-stage bulk copy with accepted DJ email addresses', () => {
    const project = makeProject()
    const submissions = [
      makeSubmission('S001', 'DJ Accepted', { contactEmail: 'accepted@example.com' }),
      makeSubmission('S002', 'DJ Rejected', { contactEmail: 'rejected@example.com' }),
    ]

    renderResults(project, submissions)

    const stageSection = screen
      .getByRole('heading', { name: /Main Stage/ })
      .closest('section')
    expect(stageSection).toBeTruthy()

    fireEvent.click(within(stageSection as HTMLElement).getByRole('button', { name: 'Copy emails' }))

    const modal = screen.getByRole('dialog', { name: 'Main Stage emails' })
    const textarea = within(modal).getByRole('textbox') as HTMLTextAreaElement
    expect(textarea.value).toBe('accepted@example.com')
    expect(textarea.value).not.toContain('rejected@example.com')
  })

  it('renders special-event picks below rejection and keeps them out of the rejection list', () => {
    const specialStage: Stage = {
      id: 'stage-special',
      name: 'Partner Stage',
      stageType: 'special',
    }
    const project: Project = {
      ...makeProject(),
      stages: [testStage, specialStage],
      assignments: [
        {
          type: 'dj',
          stageId: 'stage-1',
          evening: 'Friday',
          slotIndex: 0,
          eventIndex: 0,
          submissionNumber: 'S001',
        },
        {
          type: 'dj',
          stageId: 'stage-special',
          evening: '',
          slotIndex: 0,
          eventIndex: 0,
          submissionNumber: 'S002',
        },
      ],
    }
    const submissions = [
      makeSubmission('S001', 'DJ Accepted', { contactEmail: 'accepted@example.com' }),
      makeSubmission('S002', 'DJ Special', { contactEmail: 'special@example.com' }),
      makeSubmission('S003', 'DJ Rejected', { contactEmail: 'rejected@example.com' }),
    ]

    renderResults(project, submissions)

    const rejectionHeading = screen.getByRole('heading', { name: 'Did Not Make the Cut' })
    const specialHeading = screen.getByRole('heading', { name: 'Special Events' })
    expect(rejectionHeading.compareDocumentPosition(specialHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    const rejectionSection = rejectionHeading.closest('section') as HTMLElement
    expect(within(rejectionSection).queryByText('DJ Special')).toBeNull()
    expect(within(rejectionSection).getByText('DJ Rejected')).toBeTruthy()

    const specialSection = specialHeading.closest('section') as HTMLElement
    expect(within(specialSection).getByText('DJ Special')).toBeTruthy()
    expect(within(specialSection).queryByText(/Friday/)).toBeNull()
  })

  it('applies hidden-name behavior to special-event results', () => {
    const specialStage: Stage = {
      id: 'stage-special',
      name: 'Partner Stage',
      stageType: 'special',
    }
    const project: Project = {
      ...makeProject(),
      stages: [testStage, specialStage],
      assignments: [
        {
          type: 'dj',
          stageId: 'stage-1',
          evening: 'Friday',
          slotIndex: 0,
          eventIndex: 0,
          submissionNumber: 'S001',
        },
        {
          type: 'dj',
          stageId: 'stage-special',
          evening: '',
          slotIndex: 0,
          eventIndex: 0,
          submissionNumber: 'S002',
        },
      ],
    }
    const submissions = [
      makeSubmission('S001', 'DJ Accepted', { contactEmail: 'accepted@example.com' }),
      makeSubmission('S002', 'DJ Special', { contactEmail: 'special@example.com' }),
      makeSubmission('S003', 'DJ Rejected', { contactEmail: 'rejected@example.com' }),
    ]

    renderResults(project, submissions, true)

    const specialHeading = screen.getByRole('heading', { name: 'Special Events' })
    const specialSection = specialHeading.closest('section') as HTMLElement
    expect(within(specialSection).queryByText('DJ Special')).toBeNull()
    expect(within(specialSection).getByText('DJ #2')).toBeTruthy()
  })
})