import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { LineupView } from '../features/lineup/components/LineupView'
import { ProjectContext, type ProjectContextValue } from '../shared/context/ProjectContext'
import { AppPreferencesContext } from '../shared/context/AppPreferencesContext'
import type { Project, Submission } from '../types'

function makeSubmission(id: string, name: string, overrides: Partial<Submission> = {}): Submission {
  return {
    submissionNumber: id,
    djName: name,
    furName: '',
    contactEmail: `${id.toLowerCase()}@example.com`,
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

function makeProject(): Project {
  return {
    id: 'project-1',
    name: 'Test Project',
    startDate: '2026-03-27',
    endDate: '2026-03-30',
    csvText: '',
    stages: [
      {
        id: 'stage-1',
        name: 'Main Stage',
        stageType: 'sequential',
        activeDays: ['Friday'],
        schedule: {
          Friday: [{ startTime: '20:00', endTime: '22:00', eventType: 'timed' }],
        },
        slotDuration: 60,
      },
      {
        id: 'stage-2',
        name: 'VIP Showcase',
        stageType: 'special',
      },
    ],
    assignments: [],
    discardedSubmissions: [],
    rowCount: 1,
    createdAt: '2026-03-27T00:00:00.000Z',
    updatedAt: '2026-03-27T00:00:00.000Z',
  }
}

function renderLineup(options: { hiddenNames?: boolean; submissions?: Submission[] } = {}) {
  const { hiddenNames = false, submissions: initialSubmissions } = options

  function Harness() {
    const [project, setProject] = useState<Project | null>(makeProject())
    const [submissions, setSubmissions] = useState<Submission[] | null>(
      initialSubmissions ?? [
        makeSubmission('S001', 'DJ Alpha'),
        makeSubmission('S002', 'DJ Beta'),
      ]
    )
    const [rowCountMismatch, setRowCountMismatch] = useState(false)

    if (!project) return null

    const value: ProjectContextValue = {
      project,
      setProject,
      submissions,
      setSubmissions,
      rowCountMismatch,
      setRowCountMismatch,
      toggleDiscardSubmission: () => undefined,
      setAcceptanceStatus: () => undefined,
      replaceWithDeclineHistory: () => undefined,
    }

    return (
      <AppPreferencesContext.Provider
        value={{
          timeFormat: '24h',
          setTimeFormat: () => undefined,
          hiddenNames,
          setHiddenNames: () => undefined,
        }}
      >
        <ProjectContext.Provider value={value}>
          <MemoryRouter initialEntries={['/project/project-1/lineup/friday']}>
            <Routes>
              <Route path="/project/:id/lineup/:day" element={<LineupView />} />
            </Routes>
          </MemoryRouter>
        </ProjectContext.Provider>
      </AppPreferencesContext.Provider>
    )
  }

  return render(<Harness />)
}

describe('LineupView special events mode', () => {
  it('shows Day, Stage, and Special Events tabs', () => {
    renderLineup()

    expect(screen.getByRole('button', { name: 'Day View' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Stage View' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Special Events' })).toBeTruthy()
  })

  it('clicking a day-view stage header opens slot context with availability filtering', async () => {
    const user = userEvent.setup()
    renderLineup({
      submissions: [
        makeSubmission('S001', 'DJ Alpha', { daysAvailable: 'Wednesday, Friday' }),
        makeSubmission('S002', 'DJ Beta', { daysAvailable: 'Thursday' }),
      ],
    })

    await user.click(screen.getByRole('button', { name: 'Main Stage' }))

    expect(screen.getAllByText('Empty — drag a DJ here').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Assign DJ Alpha' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Assign DJ Beta' })).toBeNull()
  })

  it('clicking a stage-view day header opens slot context with availability filtering', async () => {
    const user = userEvent.setup()
    renderLineup({
      submissions: [
        makeSubmission('S001', 'DJ Alpha', { daysAvailable: 'Wednesday, Friday' }),
        makeSubmission('S002', 'DJ Beta', { daysAvailable: 'Thursday' }),
      ],
    })

    await user.click(screen.getByRole('button', { name: 'Stage View' }))
    await user.click(screen.getByRole('button', { name: 'Friday' }))

    expect(screen.getAllByText('Empty — drag a DJ here').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Assign DJ Alpha' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Assign DJ Beta' })).toBeNull()
  })

  it('shows score peek tooltip in Stage view on hover of an assigned DJ', async () => {
    const user = userEvent.setup()
    renderLineup({
      submissions: [
        makeSubmission('S001', 'DJ Alpha', {
          mainScore: { avg: 8.0, sum: 24, partial: false },
          j1Technical: 8,
          j1Flow: 8,
          j1Entertainment: 8,
        }),
        makeSubmission('S002', 'DJ Beta'),
      ],
    })

    await user.click(screen.getByRole('button', { name: 'Main Stage' }))
    await user.click(screen.getByRole('button', { name: 'Assign DJ Alpha' }))
    await user.click(screen.getByRole('button', { name: 'Stage View' }))

    await user.hover(screen.getAllByText('DJ Alpha')[0])
    expect(screen.getAllByText('Avg').length).toBeGreaterThan(0)
  })

  it('closes score peek tooltip when removing a DJ from a slot', async () => {
    const user = userEvent.setup()
    renderLineup({
      submissions: [
        makeSubmission('S001', 'DJ Alpha', {
          mainScore: { avg: 8.0, sum: 24, partial: false },
          j1Technical: 8,
          j1Flow: 8,
          j1Entertainment: 8,
        }),
      ],
    })

    await user.click(screen.getByRole('button', { name: 'Main Stage' }))
    await user.click(screen.getByRole('button', { name: 'Assign DJ Alpha' }))
    await user.click(screen.getByRole('button', { name: 'Stage View' }))

    await user.hover(screen.getAllByText('DJ Alpha')[0])
    const beforeRemoveAvgCount = screen.getAllByText('Avg').length
    expect(beforeRemoveAvgCount).toBeGreaterThan(0)

    await user.click(screen.getAllByTitle('Remove DJ')[0])

    await waitFor(() => {
      expect(screen.queryAllByText('Avg').length).toBeLessThan(beforeRemoveAvgCount)
    })
  })

  it('lets user assign a DJ from Special Events mode', async () => {
    const user = userEvent.setup()
    renderLineup()

    await user.click(screen.getByRole('button', { name: 'Special Events' }))
    await user.click(screen.getByRole('heading', { name: 'VIP Showcase' }))
    await user.click(screen.getByRole('button', { name: 'Assign DJ Alpha' }))

    expect(screen.getAllByText('VIP Showcase').length).toBeGreaterThan(0)
    expect(screen.getAllByText('DJ Alpha').length).toBeGreaterThan(0)
  })

  it('keeps special event selected and allows consecutive picks', async () => {
    const user = userEvent.setup()
    renderLineup()

    await user.click(screen.getByRole('button', { name: 'Special Events' }))
    await user.click(screen.getByRole('heading', { name: 'VIP Showcase' }))

    expect(screen.getByText('Pick 1')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Assign DJ Alpha' }))
    await user.click(screen.getByRole('button', { name: 'Assign DJ Beta' }))

    expect(screen.getAllByText('DJ Alpha').length).toBeGreaterThan(0)
    expect(screen.getAllByText('DJ Beta').length).toBeGreaterThan(0)
  })

  it('shows only one empty pick slot and collapses extra empties after remove', async () => {
    const user = userEvent.setup()
    renderLineup()

    await user.click(screen.getByRole('button', { name: 'Special Events' }))
    await user.click(screen.getByRole('heading', { name: 'VIP Showcase' }))

    // No assignments yet: exactly one empty pick row.
    expect(screen.getByText('Pick 1')).toBeTruthy()
    expect(screen.queryByText('Pick 2')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Assign DJ Alpha' }))
    await user.click(screen.getByRole('button', { name: 'Assign DJ Beta' }))

    // Two assigned picks should leave only one trailing empty pick (Pick 3).
    expect(screen.getByText('Pick 3')).toBeTruthy()

    await user.click(screen.getAllByRole('button', { name: 'Remove' })[0])

    // After removal, extra trailing empties should collapse.
    expect(screen.queryByText('Pick 3')).toBeNull()
  })

  it('hides names in Special Events mode when hidden names is enabled', async () => {
    const user = userEvent.setup()
    renderLineup({ hiddenNames: true })

    await user.click(screen.getByRole('button', { name: 'Special Events' }))
    await user.click(screen.getByRole('heading', { name: 'VIP Showcase' }))
    await user.click(screen.getByRole('button', { name: 'Assign DJ #1' }))

    expect(screen.queryByText('DJ Alpha')).toBeNull()
    expect(screen.getAllByText('DJ #1').length).toBeGreaterThan(0)
  })

  it('redirects invalid day routes to the project’s actual active day instead of staying on Thursday', () => {
    function PathProbe() {
      const location = useLocation()
      return <div data-testid="path">{location.pathname}</div>
    }

    const saturdayProject: Project = {
      ...makeProject(),
      stages: [
        {
          id: 'stage-1',
          name: 'Main Stage',
          stageType: 'sequential',
          activeDays: ['Saturday'],
          schedule: {
            Saturday: [{ startTime: '20:00', endTime: '22:00', eventType: 'timed' }],
          },
          slotDuration: 60,
        },
      ],
    }

    render(
      <AppPreferencesContext.Provider
        value={{
          timeFormat: '24h',
          setTimeFormat: () => undefined,
          hiddenNames: false,
          setHiddenNames: () => undefined,
        }}
      >
        <ProjectContext.Provider
          value={{
            project: saturdayProject,
            setProject: () => undefined,
            submissions: [makeSubmission('S001', 'DJ Alpha')],
            setSubmissions: () => undefined,
            rowCountMismatch: false,
            setRowCountMismatch: () => undefined,
            toggleDiscardSubmission: () => undefined,
            setAcceptanceStatus: () => undefined,
            replaceWithDeclineHistory: () => undefined,
          }}
        >
          <MemoryRouter initialEntries={['/project/project-1/lineup/thursday']}>
            <Routes>
              <Route path="/project/:id/lineup/:day" element={<><PathProbe /><LineupView /></>} />
            </Routes>
          </MemoryRouter>
        </ProjectContext.Provider>
      </AppPreferencesContext.Provider>
    )

    expect(screen.getByTestId('path').textContent).toBe('/project/project-1/lineup/saturday')
  })
})
