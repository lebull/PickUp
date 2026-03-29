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

function renderResults(project: Project, submissions: Submission[], hiddenNames = false, extraContext: { setAcceptanceStatus?: ReturnType<typeof vi.fn>; replaceWithDeclineHistory?: ReturnType<typeof vi.fn> } = {}) {
  const setAcceptanceStatus = (extraContext.setAcceptanceStatus ?? vi.fn()) as (slotCoord: import('../types').SlotCoord, status: 'pending' | 'yes' | 'no') => void
  const replaceWithDeclineHistory = (extraContext.replaceWithDeclineHistory ?? vi.fn()) as (slotCoord: import('../types').SlotCoord, newSubmissionNumber: string) => void
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
          setAcceptanceStatus,
          replaceWithDeclineHistory,
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

  it('renders special-event picks above rejection and keeps them out of the rejection list', () => {
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
    expect(specialHeading.compareDocumentPosition(rejectionHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

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

// ── Acceptance controls ────────────────────────────────────────────────────────

describe('ResultsList acceptance controls', () => {
  it('renders Yes and No buttons on each assigned DJ row', () => {
    const project = makeProject()
    const submissions = [makeSubmission('S001', 'DJ One')]
    renderResults(project, submissions)
    expect(screen.getByRole('button', { name: 'Mark as accepted' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Mark as declined' })).toBeTruthy()
  })

  it('calls setAcceptanceStatus with yes when Yes button is clicked', () => {
    const setAcceptanceStatus = vi.fn()
    const project = makeProject()
    const submissions = [makeSubmission('S001', 'DJ One')]
    renderResults(project, submissions, false, { setAcceptanceStatus })
    fireEvent.click(screen.getByRole('button', { name: 'Mark as accepted' }))
    expect(setAcceptanceStatus).toHaveBeenCalledWith(
      expect.objectContaining({ stageId: 'stage-1', evening: 'Friday' }),
      'yes'
    )
  })

  it('calls setAcceptanceStatus with no when No button is clicked', () => {
    const setAcceptanceStatus = vi.fn()
    const project = makeProject()
    const submissions = [makeSubmission('S001', 'DJ One')]
    renderResults(project, submissions, false, { setAcceptanceStatus })
    fireEvent.click(screen.getByRole('button', { name: 'Mark as declined' }))
    expect(setAcceptanceStatus).toHaveBeenCalledWith(
      expect.objectContaining({ stageId: 'stage-1', evening: 'Friday' }),
      'no'
    )
  })

  it('yes button has aria-pressed=true when acceptanceStatus is yes', () => {
    const project: Project = {
      ...makeProject(),
      assignments: [
        { type: 'dj', stageId: 'stage-1', evening: 'Friday', slotIndex: 0, eventIndex: 0, submissionNumber: 'S001', acceptanceStatus: 'yes' },
      ],
    }
    const submissions = [makeSubmission('S001', 'DJ One')]
    renderResults(project, submissions)
    expect(screen.getByRole('button', { name: 'Mark as accepted' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: 'Mark as declined' }).getAttribute('aria-pressed')).toBe('false')
  })

  it('no button has aria-pressed=true when acceptanceStatus is no', () => {
    const project: Project = {
      ...makeProject(),
      assignments: [
        { type: 'dj', stageId: 'stage-1', evening: 'Friday', slotIndex: 0, eventIndex: 0, submissionNumber: 'S001', acceptanceStatus: 'no' },
      ],
    }
    const submissions = [makeSubmission('S001', 'DJ One')]
    renderResults(project, submissions)
    expect(screen.getByRole('button', { name: 'Mark as declined' }).getAttribute('aria-pressed')).toBe('true')
  })
})

// ── Replacement picker ─────────────────────────────────────────────────────────

describe('ResultsList replacement picker', () => {
  it('clicking a declined row opens the replacement picker', () => {
    const project: Project = {
      ...makeProject(),
      assignments: [
        { type: 'dj', stageId: 'stage-1', evening: 'Friday', slotIndex: 0, eventIndex: 0, submissionNumber: 'S001', acceptanceStatus: 'no' },
      ],
    }
    const submissions = [makeSubmission('S001', 'DJ Declined'), makeSubmission('S002', 'DJ Available')]
    renderResults(project, submissions)
    fireEvent.click(screen.getByText('DJ Declined').closest('button')!)
    expect(screen.getByRole('button', { name: 'Close panel' })).toBeTruthy()
  })

  it('clicking the same declined row again closes the picker', () => {
    const project: Project = {
      ...makeProject(),
      assignments: [
        { type: 'dj', stageId: 'stage-1', evening: 'Friday', slotIndex: 0, eventIndex: 0, submissionNumber: 'S001', acceptanceStatus: 'no' },
      ],
    }
    const submissions = [makeSubmission('S001', 'DJ Declined'), makeSubmission('S002', 'DJ Available')]
    renderResults(project, submissions)
    // First click: opens picker (layout changes from full-width to SplitPane)
    fireEvent.click(screen.getByText('DJ Declined').closest('button')!)
    expect(screen.getByRole('button', { name: 'Close panel' })).toBeTruthy()
    // Second click: re-query after DOM reorganization, then close
    fireEvent.click(screen.getByText('DJ Declined').closest('button')!)
    expect(screen.queryByRole('button', { name: 'Close panel' })).toBeNull()
  })

  it('selecting a DJ in the replacement picker calls replaceWithDeclineHistory', () => {
    const replaceWithDeclineHistory = vi.fn()
    const project: Project = {
      ...makeProject(),
      assignments: [
        { type: 'dj', stageId: 'stage-1', evening: 'Friday', slotIndex: 0, eventIndex: 0, submissionNumber: 'S001', acceptanceStatus: 'no', declinedBy: [] },
      ],
    }
    const submissions = [makeSubmission('S001', 'DJ Declined'), makeSubmission('S002', 'DJ Available')]
    renderResults(project, submissions, false, { replaceWithDeclineHistory })
    fireEvent.click(screen.getByText('DJ Declined').closest('button')!)
    fireEvent.click(screen.getByRole('button', { name: 'Assign DJ Available' }))
    expect(replaceWithDeclineHistory).toHaveBeenCalledWith(
      expect.objectContaining({ stageId: 'stage-1', evening: 'Friday' }),
      'S002'
    )
  })

  it('current declining DJ and declinedBy entries are excluded from the replacement picker', () => {
    const project: Project = {
      ...makeProject(),
      assignments: [
        { type: 'dj', stageId: 'stage-1', evening: 'Friday', slotIndex: 0, eventIndex: 0, submissionNumber: 'S002', acceptanceStatus: 'no', declinedBy: ['S001'] },
      ],
    }
    const submissions = [
      makeSubmission('S001', 'DJ PriorDecline'),
      makeSubmission('S002', 'DJ Current'),
      makeSubmission('S003', 'DJ Available'),
    ]
    renderResults(project, submissions)
    fireEvent.click(screen.getByText('DJ Current').closest('button')!)
    const panel = document.querySelector('.dj-selection-panel')!
    expect(within(panel as HTMLElement).queryByText('DJ PriorDecline')).toBeNull()
    expect(within(panel as HTMLElement).queryByText('DJ Current')).toBeNull()
    expect(within(panel as HTMLElement).getByText('DJ Available')).toBeTruthy()
  })
})

// ── Search ─────────────────────────────────────────────────────────────────────

describe('ResultsList search', () => {
  function makeMultiProject() {
    const project: Project = {
      ...makeProject(),
      assignments: [
        { type: 'dj', stageId: 'stage-1', evening: 'Friday', slotIndex: 0, eventIndex: 0, submissionNumber: 'S001' },
      ],
    }
    const submissions = [
      makeSubmission('S001', 'DJ Wren', { furName: 'WolfyMc', contactEmail: 'wren@test.com', telegramDiscord: '@wrenny', phone: '555-0001' }),
      makeSubmission('S002', 'DJ Raven', { contactEmail: 'raven@test.com' }),
    ]
    return { project, submissions }
  }

  it('shows a search input at the top of the results list', () => {
    const { project, submissions } = makeMultiProject()
    renderResults(project, submissions)
    expect(screen.getByRole('searchbox', { name: 'Search DJs' })).toBeTruthy()
  })

  it('filters DJ rows by DJ name', () => {
    const { project, submissions } = makeMultiProject()
    renderResults(project, submissions)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Wren' } })
    expect(screen.queryByText('DJ Wren')).toBeTruthy()
    expect(screen.queryByText('DJ Raven')).toBeNull()
  })

  it('filters by furry name', () => {
    const { project, submissions } = makeMultiProject()
    renderResults(project, submissions)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'WolfyMc' } })
    expect(screen.queryByText('DJ Wren')).toBeTruthy()
    expect(screen.queryByText('DJ Raven')).toBeNull()
  })

  it('filters by email', () => {
    const { project, submissions } = makeMultiProject()
    renderResults(project, submissions)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'raven@test.com' } })
    expect(screen.queryByText('DJ Raven')).toBeTruthy()
    expect(screen.queryByText('DJ Wren')).toBeNull()
  })

  it('keeps stage section headings visible when all rows are filtered', () => {
    const { project, submissions } = makeMultiProject()
    renderResults(project, submissions)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzznomatch' } })
    expect(screen.getByRole('heading', { name: /Main Stage/ })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Did Not Make the Cut' })).toBeTruthy()
  })

  it('clears filter when search is emptied', () => {
    const { project, submissions } = makeMultiProject()
    renderResults(project, submissions)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Wren' } })
    expect(screen.queryByText('DJ Raven')).toBeNull()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '' } })
    expect(screen.getByText('DJ Raven')).toBeTruthy()
  })
})

// ── Day grouping ───────────────────────────────────────────────────────────────

describe('ResultsList day grouping', () => {
  it('renders a day heading for each active evening within a stage section', () => {
    const multiDayStage: Stage = {
      id: 'stage-multi',
      name: 'Multi Day Stage',
      stageType: 'sequential',
      activeDays: ['Friday', 'Saturday'],
      schedule: {
        Friday: [{ startTime: '20:00', endTime: '22:00' }],
        Saturday: [{ startTime: '20:00', endTime: '22:00' }],
      },
      slotDuration: 60,
    }
    const project: Project = {
      ...makeProject(),
      stages: [multiDayStage],
      assignments: [
        { type: 'dj', stageId: 'stage-multi', evening: 'Friday', slotIndex: 0, eventIndex: 0, submissionNumber: 'S001' },
        { type: 'dj', stageId: 'stage-multi', evening: 'Saturday', slotIndex: 0, eventIndex: 0, submissionNumber: 'S002' },
      ],
    }
    const submissions = [
      makeSubmission('S001', 'DJ Friday'),
      makeSubmission('S002', 'DJ Saturday'),
    ]
    renderResults(project, submissions)
    expect(screen.getByRole('heading', { name: 'Friday' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Saturday' })).toBeTruthy()
  })

  it('renders a day heading even when a stage has only one active day', () => {
    const project = makeProject()
    const submissions = [makeSubmission('S001', 'DJ One')]
    renderResults(project, submissions)
    expect(screen.getByRole('heading', { name: 'Friday' })).toBeTruthy()
  })
})

// ── Prior-decline status ─────────────────────────────────────────────────────

describe('ResultsList prior-decline status', () => {
  it('shows prior-decline status at top of detail panel when a selected slot has decline history', () => {
    const project: Project = {
      ...makeProject(),
      assignments: [
        {
          type: 'dj',
          stageId: 'stage-1',
          evening: 'Friday',
          slotIndex: 0,
          eventIndex: 0,
          submissionNumber: 'S001',
          acceptanceStatus: 'pending',
          declinedBy: ['S002'],
        },
      ],
    }
    const submissions = [
      makeSubmission('S001', 'DJ Current'),
      makeSubmission('S002', 'DJ Prior'),
    ]

    renderResults(project, submissions)
    fireEvent.click(screen.getByText('DJ Current').closest('button')!)

    const status = document.querySelector('.results-prior-decline-status') as HTMLElement
    expect(status).toBeTruthy()
    expect(within(status).getByText('Previously declined:')).toBeTruthy()
    expect(within(status).getByText('DJ Prior')).toBeTruthy()
    expect(within(status).getByText('Main Stage · Friday · 20:00')).toBeTruthy()
  })

  it('shows prior-decline status at top of replacement picker in hidden-name mode', () => {
    const project: Project = {
      ...makeProject(),
      assignments: [
        {
          type: 'dj',
          stageId: 'stage-1',
          evening: 'Friday',
          slotIndex: 0,
          eventIndex: 0,
          submissionNumber: 'S001',
          acceptanceStatus: 'no',
          declinedBy: ['S002'],
        },
      ],
    }
    const submissions = [
      makeSubmission('S001', 'DJ Current'),
      makeSubmission('S002', 'DJ Prior'),
      makeSubmission('S003', 'DJ Available'),
    ]

    renderResults(project, submissions, true)
    fireEvent.click(screen.getByText('DJ #1').closest('button')!)

    const status = document.querySelector('.results-prior-decline-status') as HTMLElement
    expect(status).toBeTruthy()
    expect(within(status).getByText('Previously declined:')).toBeTruthy()
    expect(within(status).getByText('DJ #2')).toBeTruthy()
  })

  it('supports prior-decline status for simultaneous-slot replacement picker', () => {
    const simStage: Stage = {
      id: 'stage-sim',
      name: 'Silent Disco',
      stageType: 'simultaneous',
      activeDays: ['Friday'],
      schedule: {
        Friday: [{ startTime: '21:00', endTime: '23:00' }],
      },
    }
    const project: Project = {
      ...makeProject(),
      stages: [simStage],
      assignments: [
        {
          type: 'dj',
          stageId: 'stage-sim',
          evening: 'Friday',
          positionIndex: 2,
          eventIndex: 0,
          submissionNumber: 'S001',
          acceptanceStatus: 'no',
          declinedBy: ['S002'],
        },
      ],
    }
    const submissions = [
      makeSubmission('S001', 'DJ Current'),
      makeSubmission('S002', 'DJ Prior'),
      makeSubmission('S003', 'DJ Available'),
    ]

    renderResults(project, submissions)
    fireEvent.click(screen.getByText('DJ Current').closest('button')!)

    const status = document.querySelector('.results-prior-decline-status') as HTMLElement
    expect(status).toBeTruthy()
    expect(within(status).getByText('Previously declined:')).toBeTruthy()
    expect(within(status).getByText('Silent Disco · Friday · Set 1 · Position 2')).toBeTruthy()
  })
})