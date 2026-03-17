import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { LineupGrid } from '../components/LineupGrid'
import { AppPreferencesContext } from '../AppPreferencesContext'
import type { Submission, Stage, SlotAssignment } from '../types'

// ── Helpers ───────────────────────────────────────────────────────────────────

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

const sequentialStage: Stage = {
  id: 'stage1',
  name: 'Main Stage',
  stageType: 'sequential',
  activeDays: ['Friday'],
  schedule: {
    Friday: [{ startTime: '20:00', endTime: '23:00' }],
  },
  slotDuration: 60,
}

const simultaneousStage: Stage = {
  id: 'stage2',
  name: 'Silent Disco',
  stageType: 'simultaneous',
  activeDays: ['Friday'],
  schedule: {},
  slotDuration: 60,
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <AppPreferencesContext.Provider
      value={{
        timeFormat: '24h',
        setTimeFormat: vi.fn(),
        hiddenNames: false,
        setHiddenNames: vi.fn(),
      }}
    >
      {children}
    </AppPreferencesContext.Provider>
  )
}

function renderGrid(stages: Stage[], submissions: Submission[], assignments: SlotAssignment[]) {
  return render(
    <Wrapper>
      <LineupGrid
        submissions={submissions}
        stages={stages}
        assignments={assignments}
        selectedEvening="Friday"
        onSelectEvening={vi.fn()}
        onAssign={vi.fn()}
        onRemove={vi.fn()}
        onAddSimultaneous={vi.fn()}
        onRemoveSimultaneous={vi.fn()}
        onMoveAssignment={vi.fn()}
        onConfigureStages={vi.fn()}
        onSlotClick={vi.fn()}
        onSimultaneousClick={vi.fn()}
        activeSlotKey={null}
      />
    </Wrapper>
  )
}

// ── 5.3: Grid peek — sequential cells ─────────────────────────────────────────

describe('LineupGrid — score peek on sequential cells', () => {
  it('shows peek tooltip when hovering an occupied cell with scores', async () => {
    const user = userEvent.setup()
    const dj = makeSubmission('S001', 'DJ Alpha', {
      mainScore: { avg: 8.0, sum: 24, partial: false },
      j1Technical: 8, j1Flow: 8, j1Entertainment: 8,
    })
    const assignment: SlotAssignment = {
      type: 'dj',
      stageId: 'stage1',
      evening: 'Friday',
      slotIndex: 0,
      eventIndex: 0,
      submissionNumber: 'S001',
    }

    const { container } = renderGrid([sequentialStage], [dj], [assignment])
    const cell = container.querySelector('.grid-slot--occupied')!
    await user.hover(cell)

    expect(screen.getByText('Avg')).toBeTruthy()
  })

  it('does NOT show peek tooltip when hovering an occupied cell with no scores', async () => {
    const user = userEvent.setup()
    const dj = makeSubmission('S001', 'DJ Alpha')
    const assignment: SlotAssignment = {
      type: 'dj',
      stageId: 'stage1',
      evening: 'Friday',
      slotIndex: 0,
      eventIndex: 0,
      submissionNumber: 'S001',
    }

    const { container } = renderGrid([sequentialStage], [dj], [assignment])
    const cell = container.querySelector('.grid-slot--occupied')!
    await user.hover(cell)

    expect(screen.queryByText('Avg')).toBeNull()
  })
})

// ── 5.4: Grid peek — simultaneous cells ───────────────────────────────────────

describe('LineupGrid — score peek on simultaneous cell DJ entries', () => {
  it('shows peek tooltip when hovering a DJ badge in a simultaneous cell with scores', async () => {
    const user = userEvent.setup()
    const dj = makeSubmission('S001', 'DJ Alpha', {
      mainScore: { avg: 7.5, sum: 22.5, partial: false },
      j1Technical: 7, j1Flow: 8, j1Entertainment: 8,
    })
    const assignment: SlotAssignment = {
      type: 'dj',
      stageId: 'stage2',
      evening: 'Friday',
      positionIndex: 1,
      eventIndex: 0,
      submissionNumber: 'S001',
    }

    renderGrid([simultaneousStage], [dj], [assignment])

    const badge = screen.getByText('DJ Alpha')
    await user.hover(badge)

    expect(screen.getByText('Avg')).toBeTruthy()
  })

  it('does NOT show peek tooltip for a simultaneous DJ badge with no scores', async () => {
    const user = userEvent.setup()
    const dj = makeSubmission('S001', 'DJ Alpha')
    const assignment: SlotAssignment = {
      type: 'dj',
      stageId: 'stage2',
      evening: 'Friday',
      positionIndex: 1,
      eventIndex: 0,
      submissionNumber: 'S001',
    }

    renderGrid([simultaneousStage], [dj], [assignment])

    const badge = screen.getByText('DJ Alpha')
    await user.hover(badge)

    expect(screen.queryByText('Avg')).toBeNull()
  })
})
