import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { createRef } from 'react'
import type { Project, Stage, Submission, SlotAssignment } from '../types'
import { SubmissionList } from '../components/SubmissionList'
import { SubmissionDetail } from '../components/SubmissionDetail'
import { ProjectContext } from '../ProjectContext'
import { AppPreferencesContext } from '../AppPreferencesContext'

function makeSubmission(id: string, name: string): Submission {
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
  }
}

const sequentialStage: Stage = {
  id: 'stage-1',
  name: 'Main Stage',
  stageType: 'sequential',
  activeDays: ['Friday'],
  schedule: {
    Friday: [{ startTime: '20:00', endTime: '22:00' }],
  },
  slotDuration: 60,
}

function renderSubmissionList(args: {
  submissions: Submission[]
  assignments: SlotAssignment[]
  discarded?: string[]
  showStageAssignments?: boolean
}) {
  const { submissions, assignments, discarded = [], showStageAssignments = true } = args
  return render(
    <SubmissionList
      submissions={submissions}
      stages={[sequentialStage]}
      assignments={assignments}
      sortField="number"
      sortDir="asc"
      scoreMetric="avg"
      nameSearch=""
      showStageAssignments={showStageAssignments}
      cursorIndex={null}
      lineupSubmissionNumbers={new Set(assignments.filter((a) => a.type === 'dj').map((a) => a.submissionNumber))}
      discardedSubmissionNumbers={new Set(discarded)}
      hiddenNames={false}
      listRef={createRef<HTMLDivElement>()}
      onHeaderClick={vi.fn()}
      onMetricChange={vi.fn()}
      onNameSearchChange={vi.fn()}
      onStageAssignmentsToggle={vi.fn()}
      onSelect={vi.fn()}
      onCursorChange={vi.fn()}
    />
  )
}

function renderSubmissionDetail(project: Project, submission: Submission) {
  return render(
    <AppPreferencesContext.Provider
      value={{
        timeFormat: '24h',
        setTimeFormat: vi.fn(),
        hiddenNames: false,
        setHiddenNames: vi.fn(),
      }}
    >
      <ProjectContext.Provider
        value={{
          project,
          setProject: vi.fn(),
          submissions: [submission],
          setSubmissions: vi.fn(),
          rowCountMismatch: false,
          setRowCountMismatch: vi.fn(),
          toggleDiscardSubmission: vi.fn(),
          setAcceptanceStatus: vi.fn(),
          replaceWithDeclineHistory: vi.fn(),
        }}
      >
        <SubmissionDetail submission={submission} onBack={vi.fn()} />
      </ProjectContext.Provider>
    </AppPreferencesContext.Provider>
  )
}

describe('Declined visibility in submission list', () => {
  it('shows declined badge and suppresses duplicate badge for declined rows', () => {
    const submissions = [makeSubmission('S001', 'DJ Alpha'), makeSubmission('S002', 'DJ Alpha')]
    renderSubmissionList({
      submissions,
      assignments: [
        {
          type: 'dj',
          stageId: 'stage-1',
          evening: 'Friday',
          slotIndex: 0,
          eventIndex: 0,
          submissionNumber: 'S001',
          acceptanceStatus: 'no',
        },
      ],
    })

    const declinedRow = screen.getAllByText('DJ Alpha')[0].closest('tr') as HTMLTableRowElement
    expect(within(declinedRow).getByText('! Declined')).toBeTruthy()
    expect(within(declinedRow).queryByText('⚠ Duplicate Name')).toBeNull()
  })

  it('keeps discarded state precedence over declined badge', () => {
    const submissions = [makeSubmission('S001', 'DJ Alpha')]
    renderSubmissionList({
      submissions,
      discarded: ['S001'],
      assignments: [
        {
          type: 'dj',
          stageId: 'stage-1',
          evening: 'Friday',
          slotIndex: 0,
          eventIndex: 0,
          submissionNumber: 'S001',
          acceptanceStatus: 'no',
        },
      ],
    })

    expect(screen.getByText('✕ Discarded')).toBeTruthy()
    expect(screen.queryByText('! Declined')).toBeNull()
  })
})

describe('Declined visibility in submission detail', () => {
  it('shows top-of-detail declined notice with sequential slot context', () => {
    const submission = makeSubmission('S001', 'DJ Alpha')
    const project: Project = {
      id: 'project-1',
      name: 'Test',
      csvText: '',
      stages: [sequentialStage],
      assignments: [
        {
          type: 'dj',
          stageId: 'stage-1',
          evening: 'Friday',
          slotIndex: 0,
          eventIndex: 0,
          submissionNumber: 'S001',
          acceptanceStatus: 'no',
        },
      ],
      discardedSubmissions: [],
      rowCount: 1,
      createdAt: '2026-03-27T00:00:00.000Z',
      updatedAt: '2026-03-27T00:00:00.000Z',
    }

    renderSubmissionDetail(project, submission)

    expect(screen.getByText('This DJ declined their assigned slot.')).toBeTruthy()
    expect(screen.getByText('Main Stage · Friday · 20:00')).toBeTruthy()
  })

  it('shows top-of-detail declined notice with simultaneous slot context', () => {
    const submission = makeSubmission('S001', 'DJ Alpha')
    const simultaneousStage: Stage = {
      id: 'stage-sim',
      name: 'Silent Disco',
      stageType: 'simultaneous',
      activeDays: ['Friday'],
      schedule: {
        Friday: [{ startTime: '21:00', endTime: '23:00' }],
      },
    }
    const project: Project = {
      id: 'project-1',
      name: 'Test',
      csvText: '',
      stages: [simultaneousStage],
      assignments: [
        {
          type: 'dj',
          stageId: 'stage-sim',
          evening: 'Friday',
          positionIndex: 2,
          eventIndex: 0,
          submissionNumber: 'S001',
          acceptanceStatus: 'no',
        },
      ],
      discardedSubmissions: [],
      rowCount: 1,
      createdAt: '2026-03-27T00:00:00.000Z',
      updatedAt: '2026-03-27T00:00:00.000Z',
    }

    renderSubmissionDetail(project, submission)

    expect(screen.getByText('This DJ declined their assigned slot.')).toBeTruthy()
    expect(screen.getByText('Silent Disco · Friday · Set 1 · Position 2')).toBeTruthy()
  })
})
