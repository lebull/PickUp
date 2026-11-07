import { useState, useEffect, useRef, useCallback } from 'react'
import { Routes, Route, Navigate, NavLink, Outlet, useParams, Link } from 'react-router-dom'
import './App.css'
import { parseSubmissions } from './loadSubmissions.ts'
import type { Submission, Project, SlotCoord } from './types.ts'
import { ProjectList } from './features/projects/components/ProjectList.tsx'
import { ProjectCreate } from './features/projects/components/ProjectCreate.tsx'
import { SubmissionsView } from './features/submissions/components/SubmissionsView.tsx'
import { LineupView } from './features/lineup/components/LineupView.tsx'
import { ResultsList } from './features/results/components/ResultsList.tsx'
import { getProject, saveProject, applySetAcceptanceStatus, applyReplaceWithDeclineHistory } from './projectStore.ts'
import { ProjectContext } from './shared/context/ProjectContext.ts'
import { AppPreferencesContext, useAppPreferencesState } from './shared/context/AppPreferencesContext.ts'
import { NavActionsMenu } from './features/navigation/components/NavActionsMenu.tsx'
import { AuthGate } from './features/auth/components/AuthGate.tsx'
import { CsvImport } from './features/submissions/components/CsvImport.tsx'
import { UserManagement } from './features/admin/components/UserManagement.tsx'

// ── Project Workspace ────────────────────────────────────────────────────────

function ProjectWorkspace() {
  const { id } = useParams<{ id: string }>()

  const [project, setProject] = useState<Project | null>(null)
  const [notFound, setNotFound] = useState(false)

  const [submissions, setSubmissions] = useState<Submission[] | null>(null)
  const [rowCountMismatch, setRowCountMismatch] = useState(false)

  // Debounced auto-save for lineup/stage changes
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoSave = useCallback((updated: Project) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      saveProject(updated)
    }, 800)
  }, [])

  // Load project on mount
  useEffect(() => {
    if (!id) return
    getProject(id).then((p) => {
      if (!p) { setNotFound(true); return }
      // Restore submissions from stored CSV
      let subs: Submission[] | null = null
      if (p.csvText) {
        try {
          subs = parseSubmissions(p.csvText, p.submissionConverterId)
          setSubmissions(subs)
          if (p.rowCount > 0 && p.rowCount !== subs.length) setRowCountMismatch(true)
        } catch {
          // CSV stored but can't parse — start empty
        }
      }
      // Migrate legacy djName-keyed assignments to submissionNumber
      if (subs && p.assignments.some((a) => !('submissionNumber' in (a as object)))) {
        const migrated = p.assignments
          .map((a) => {
            const aAny = a as unknown as Record<string, unknown>
            if ('submissionNumber' in aAny || aAny.type === 'blank') return a
            const legacy = aAny as { djName: string } & Record<string, unknown>
            const match = subs!.find((s) => s.djName === legacy.djName)
            if (!match) {
              console.warn(`[migration] Could not resolve legacy assignment for djName="${String(legacy.djName)}" — dropping`)
              return null
            }
            const { djName: _dropped, ...rest } = legacy
            void _dropped
            return { ...rest, submissionNumber: match.submissionNumber } as typeof a
          })
          .filter((a): a is NonNullable<typeof a> => a !== null)
        p = { ...p, assignments: migrated }
      }
      setProject(p)
    })
  }, [id])

  // Auto-save whenever project lineup/stage state changes
  useEffect(() => {
    if (project) {
      autoSave(project)
    }
  }, [project, autoSave])

  async function handleImport(subs: Submission[], _fileName: string, csvText: string, converterId: string) {
    if (!project) return
    const mismatch = project.stages.length > 0 && subs.length !== project.rowCount
    const updated: Project = {
      ...project,
      csvText,
      submissionConverterId: converterId,
      rowCount: subs.length,
    }
    setProject(updated)
    setSubmissions(subs)
    setRowCountMismatch(mismatch)
    // Save immediately so csvText is persisted
    await saveProject(updated)
  }

  function handleSetAcceptanceStatus(slotCoord: SlotCoord, status: 'pending' | 'yes' | 'no') {
    if (!project) return
    const updated = applySetAcceptanceStatus(project, slotCoord, status)
    setProject(updated)
    saveProject(updated)
  }

  function handleReplaceWithDeclineHistory(slotCoord: SlotCoord, newSubmissionNumber: string) {
    if (!project) return
    const updated = applyReplaceWithDeclineHistory(project, slotCoord, newSubmissionNumber)
    setProject(updated)
    saveProject(updated)
  }

  function handleToggleDiscard(submissionNumber: string) {
    if (!project) return
    const current = project.discardedSubmissions ?? []
    const updated: Project = current.includes(submissionNumber)
      ? { ...project, discardedSubmissions: current.filter((n) => n !== submissionNumber) }
      : { ...project, discardedSubmissions: [...current, submissionNumber] }
    setProject(updated)
    saveProject(updated)
  }

  if (notFound) {
    return (
      <div className="app">
        <main className="app-main">
          <div className="empty-state">
            <p className="empty-state-message">Project not found.</p>
            <Link to="/" className="btn-primary">Back to Projects</Link>
          </div>
        </main>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="app">
        <main className="app-main">
          <p className="loading-message">Loading…</p>
        </main>
      </div>
    )
  }

  const hasRequiredDates = Boolean(project.startDate && project.endDate)

  return (
    <ProjectContext.Provider value={{ project, setProject, submissions, setSubmissions, rowCountMismatch, setRowCountMismatch, toggleDiscardSubmission: handleToggleDiscard, setAcceptanceStatus: handleSetAcceptanceStatus, replaceWithDeclineHistory: handleReplaceWithDeclineHistory }}>
      <div className="app">
        <header className="app-header">
          <Link to="/" className="back-link">← Projects</Link>
          <h1 className="project-title">{project.name}</h1>
          {submissions !== null && (
            <nav className="mode-tabs">
              <NavLink
                to="submissions"
                className={({ isActive }) => `mode-tab${isActive ? ' active' : ''}`}
              >
                Submissions
              </NavLink>
              <NavLink
                to="lineup"
                className={({ isActive }) => `mode-tab${isActive ? ' active' : ''}`}
              >
                Lineup Builder
              </NavLink>
              <NavLink
                to="results"
                className={({ isActive }) => `mode-tab${isActive ? ' active' : ''}`}
              >
                Results
              </NavLink>
            </nav>
          )}
          <div className="header-actions">
            <NavActionsMenu
              project={project}
              onImport={handleImport}
              onProjectChange={(updated) => {
                setProject(updated)
                saveProject(updated)
              }}
            />
          </div>
        </header>

        <main className="app-main">
          {!hasRequiredDates ? (
            <div className="empty-state">
              <p className="empty-state-message">Project start and end dates are required.</p>
              <p className="empty-state-message">Open Settings to set both dates before continuing.</p>
            </div>
          ) : submissions === null ? (
            <div className="drop-zone">
              <div className="drop-zone-inner">
                <p className="drop-zone-prompt">Import submissions to start this project. You can use the button below or open Settings.</p>
                <div className="drop-zone-import-actions">
                  <CsvImport onImport={handleImport} />
                </div>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </ProjectContext.Provider>
  )
}

// ── App (routes) ─────────────────────────────────────────────────────────────

function App() {
  const prefs = useAppPreferencesState()
  return (
    <AppPreferencesContext.Provider value={prefs}>
      <AuthGate>
      <Routes>
        <Route path="/" element={<ProjectList />} />
        <Route path="/new" element={<ProjectCreate />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/project/:id" element={<ProjectWorkspace />}>
          <Route index element={<Navigate replace to="submissions" />} />
          <Route path="submissions" element={<SubmissionsView />} />
          <Route path="submissions/:djIndex" element={<SubmissionsView />} />
          <Route path="lineup" element={<LineupView />} />
          <Route path="lineup/:day" element={<LineupView />} />
          <Route path="results" element={<ResultsList />} />
        </Route>
      </Routes>
      </AuthGate>
    </AppPreferencesContext.Provider>
  )
}

export default App
