import { useState, useEffect, useRef, useCallback } from 'react'
import { Routes, Route, Navigate, NavLink, Outlet, useParams, Link } from 'react-router-dom'
import './App.css'
import { parseSubmissions } from './loadSubmissions.ts'
import type { Submission, Project } from './types.ts'
import { ProjectList } from './components/ProjectList.tsx'
import { ProjectCreate } from './components/ProjectCreate.tsx'
import { SubmissionsView } from './components/SubmissionsView.tsx'
import { LineupView } from './components/LineupView.tsx'
import { getProject, saveProject } from './projectStore.ts'
import { ProjectContext } from './ProjectContext.ts'
import { AppPreferencesContext, useAppPreferencesState } from './AppPreferencesContext.ts'
import { NavActionsMenu } from './components/NavActionsMenu.tsx'

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
      setProject(p)
      // Restore submissions from stored CSV
      if (p.csvText) {
        try {
          const subs = parseSubmissions(p.csvText)
          setSubmissions(subs)
          if (p.rowCount > 0 && p.rowCount !== subs.length) setRowCountMismatch(true)
        } catch {
          // CSV stored but can't parse — start empty
        }
      }
    })
  }, [id])

  // Auto-save whenever project lineup/stage state changes
  useEffect(() => {
    if (project) {
      autoSave(project)
    }
  }, [project, autoSave])

  async function handleImport(subs: Submission[], _fileName: string, csvText: string) {
    if (!project) return
    const mismatch = project.stages.length > 0 && subs.length !== project.rowCount
    const updated: Project = {
      ...project,
      csvText,
      rowCount: subs.length,
    }
    setProject(updated)
    setSubmissions(subs)
    setRowCountMismatch(mismatch)
    // Save immediately so csvText is persisted
    await saveProject(updated)
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

  return (
    <ProjectContext.Provider value={{ project, setProject, submissions, setSubmissions, rowCountMismatch, setRowCountMismatch }}>
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
            </nav>
          )}
          <div className="header-actions">
            <NavActionsMenu project={project} onImport={handleImport} />
          </div>
        </header>

        <main className="app-main">
          {submissions === null ? (
            <div className="drop-zone">
              <div className="drop-zone-inner">
                <p className="drop-zone-prompt">Use the Import CSV button above to load submissions.</p>
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
      <Routes>
        <Route path="/" element={<ProjectList />} />
        <Route path="/new" element={<ProjectCreate />} />
        <Route path="/project/:id" element={<ProjectWorkspace />}>
          <Route index element={<Navigate replace to="submissions" />} />
          <Route path="submissions" element={<SubmissionsView />} />
          <Route path="submissions/:djIndex" element={<SubmissionsView />} />
          <Route path="lineup" element={<LineupView />} />
        </Route>
      </Routes>
    </AppPreferencesContext.Provider>
  )
}

export default App
