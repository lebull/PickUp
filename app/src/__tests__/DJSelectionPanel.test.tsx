import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { DJSelectionPanel, type ActiveSlot } from '../components/DJSelectionPanel'
import { AppPreferencesContext } from '../AppPreferencesContext'
import type { Submission, SlotAssignment, Stage } from '../types'

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

const testStage: Stage = {
  id: 'stage1',
  name: 'Main Stage',
  stageType: 'sequential',
  activeDays: ['Friday'],
  schedule: {
    Friday: [{ startTime: '20:00', endTime: '22:00' }],
  },
  slotDuration: 60,
}

const activeSlot: ActiveSlot = {
  stageId: 'stage1',
  evening: 'Friday',
  slotIndex: 0,
  eventIndex: 0,
  timeLabel: '20:00',
}

function renderPanel(
  submissions: Submission[],
  assignments: SlotAssignment[],
  onAssign: ReturnType<typeof vi.fn>,
  stages: Stage[] = []
) {
  return render(
    <Wrapper>
      <DJSelectionPanel
        submissions={submissions}
        stages={stages}
        assignments={assignments}
        discardedSubmissionNumbers={new Set()}
        activeSlot={activeSlot}
        currentEvening="Friday"
        onAssign={onAssign}
        onRemove={vi.fn()}
        onAddSimultaneous={vi.fn()}
        onRemoveSimultaneous={vi.fn()}
        onAssignBlank={vi.fn()}
        onAddBlankSimultaneous={vi.fn()}
        onPositionSelect={vi.fn()}
        onSelectSlot={vi.fn()}
        onClose={vi.fn()}
      />
    </Wrapper>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('DJSelectionPanel — misclick guard', () => {
  it('does NOT call onAssign when the active slot is already occupied by a real DJ', () => {
    const onAssign = vi.fn()
    const dj1 = makeSubmission('S001', 'DJ Alpha')
    const dj2 = makeSubmission('S002', 'DJ Beta')
    const assignment: SlotAssignment = {
      type: 'dj',
      stageId: 'stage1',
      evening: 'Friday',
      slotIndex: 0,
      eventIndex: 0,
      submissionNumber: 'S001',
    }

    renderPanel([dj1, dj2], [assignment], onAssign)

    // DJ Beta is the only unassigned DJ that appears as a card
    fireEvent.click(screen.getByRole('button', { name: 'Assign DJ Beta' }))

    expect(onAssign).not.toHaveBeenCalled()
  })

  it('DOES call onAssign when the active slot is empty', () => {
    const onAssign = vi.fn()
    const dj1 = makeSubmission('S001', 'DJ Alpha')
    const dj2 = makeSubmission('S002', 'DJ Beta')

    renderPanel([dj1, dj2], [], onAssign)

    fireEvent.click(screen.getByRole('button', { name: 'Assign DJ Alpha' }))

    expect(onAssign).toHaveBeenCalledOnce()
    expect(onAssign).toHaveBeenCalledWith('stage1', 'Friday', 0, 'S001', 0)
  })

  it('DOES call onAssign when the active slot has a blank/blocked assignment', () => {
    const onAssign = vi.fn()
    const dj1 = makeSubmission('S001', 'DJ Alpha')
    const dj2 = makeSubmission('S002', 'DJ Beta')
    const blankAssignment: SlotAssignment = {
      type: 'blank',
      stageId: 'stage1',
      evening: 'Friday',
      slotIndex: 0,
      eventIndex: 0,
    }

    renderPanel([dj1, dj2], [blankAssignment], onAssign)

    fireEvent.click(screen.getByRole('button', { name: 'Assign DJ Alpha' }))

    expect(onAssign).toHaveBeenCalledOnce()
    expect(onAssign).toHaveBeenCalledWith('stage1', 'Friday', 0, 'S001', 0)
  })
})

// ── 5.2: Slot tray score and format/gear display ───────────────────────────────

describe('DJSelectionPanel — slot tray details', () => {
  it('shows score and format/gear for a slotted DJ in a sequential tray row', () => {
    const dj = makeSubmission('S001', 'DJ Alpha', {
      formatGear: 'CDJs',
      mainScore: { avg: 8.5, sum: 25.5, partial: false },
      j1Technical: 8, j1Flow: 9, j1Entertainment: 8,
    })
    const assignment: SlotAssignment = {
      type: 'dj',
      stageId: 'stage1',
      evening: 'Friday',
      slotIndex: 0,
      eventIndex: 0,
      submissionNumber: 'S001',
    }

    renderPanel([dj], [assignment], vi.fn(), [testStage])

    expect(screen.getByText('8.50')).toBeTruthy()
    expect(screen.getAllByTitle('CDJs').length).toBeGreaterThanOrEqual(1)
  })

  it('shows — for score when the slotted DJ has no scores', () => {
    const dj = makeSubmission('S001', 'DJ Alpha')
    const assignment: SlotAssignment = {
      type: 'dj',
      stageId: 'stage1',
      evening: 'Friday',
      slotIndex: 0,
      eventIndex: 0,
      submissionNumber: 'S001',
    }

    renderPanel([dj], [assignment], vi.fn(), [testStage])

    // "—" score span should be present in the tray row
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })

  it('shows peek tooltip on hover over score in a filled sequential tray row', async () => {
    const user = userEvent.setup()
    const dj = makeSubmission('S001', 'DJ Alpha', {
      formatGear: 'CDJs',
      mainScore: { avg: 8.5, sum: 25.5, partial: false },
      j1Technical: 8, j1Flow: 9, j1Entertainment: 8,
    })
    const assignment: SlotAssignment = {
      type: 'dj',
      stageId: 'stage1',
      evening: 'Friday',
      slotIndex: 0,
      eventIndex: 0,
      submissionNumber: 'S001',
    }

    renderPanel([dj], [assignment], vi.fn(), [testStage])

    // The score span in the tray row triggers peek; tooltip should appear containing the avg
    const scoreCells = screen.getAllByText('8.50')
    await user.hover(scoreCells[0])
    // Tooltip shows the peek content (avg label "Avg" + value)
    expect(screen.getByText('Avg')).toBeTruthy()
  })
})
