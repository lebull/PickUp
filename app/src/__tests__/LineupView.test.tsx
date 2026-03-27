import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import { LineupView } from '../components/LineupView'
import { ProjectContext, type ProjectContextValue } from '../ProjectContext'
import { AppPreferencesContext } from '../AppPreferencesContext'
import type { Project, Submission } from '../types'

function makeSubmission(id: string, name: string): Submission {
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
  }
}

function makeProject(): Project {
  return {
    id: 'project-1',
    name: 'Test Project',
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

function renderLineup(options: { hiddenNames?: boolean } = {}) {
  const { hiddenNames = false } = options

  function Harness() {
    const [project, setProject] = useState<Project | null>(makeProject())
    const [submissions, setSubmissions] = useState<Submission[] | null>([
      makeSubmission('S001', 'DJ Alpha'),
      makeSubmission('S002', 'DJ Beta'),
    ])
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

  it('lets user assign a DJ from Special Events mode', async () => {
    const user = userEvent.setup()
    renderLineup()

    await user.click(screen.getByRole('button', { name: 'Special Events' }))
    await user.click(screen.getByRole('button', { name: 'Select Event' }))
    await user.click(screen.getByRole('button', { name: 'Assign DJ Alpha' }))

    expect(screen.getAllByText('VIP Showcase').length).toBeGreaterThan(0)
    expect(screen.getAllByText('DJ Alpha').length).toBeGreaterThan(0)
  })

  it('keeps special event selected and allows consecutive picks', async () => {
    const user = userEvent.setup()
    renderLineup()

    await user.click(screen.getByRole('button', { name: 'Special Events' }))
    await user.click(screen.getByRole('button', { name: 'Select Event' }))

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
    await user.click(screen.getByRole('button', { name: 'Select Event' }))

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
    await user.click(screen.getByRole('button', { name: 'Select Event' }))
    await user.click(screen.getByRole('button', { name: 'Assign DJ #1' }))

    expect(screen.queryByText('DJ Alpha')).toBeNull()
    expect(screen.getAllByText('DJ #1').length).toBeGreaterThan(0)
  })
})
