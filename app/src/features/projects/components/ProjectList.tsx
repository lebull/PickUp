import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Project } from '../../../types.ts'
import {
  listProjects,
  deleteProject,
  exportProject,
  importProjectFromFile,
} from '../../../projectStore.ts'

export function ProjectList() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelled = false

    listProjects()
      .then((nextProjects: Project[]) => {
        if (!cancelled) setProjects(nextProjects)
      })
      .catch((error: unknown) => {
        console.error('Failed to load projects.', error)
        if (!cancelled) {
          setProjects([])
          setLoadError('Could not load projects. Make sure you are signed in with a coordinator account for this Firebase project.')
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function handleDelete(id: string) {
    await deleteProject(id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
    setDeletingId(null)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setImportError(null)
    try {
      const project = await importProjectFromFile(file)
      navigate(`/project/${project.id}`)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to import project.')
    }
  }

  return (
    <div className="project-list-page">
      <header className="app-header">
        <h1 className="app-title">Pickup</h1>
        <div className="project-list-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/admin/users')}
          >
            Manage Users
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => importInputRef.current?.click()}
          >
            Import Project
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate('/new')}
          >
            + New Project
          </button>
        </div>
      </header>

      <main className="app-main">
        {importError && <p className="import-error">{importError}</p>}
        {loadError && <p className="import-error">{loadError}</p>}

        {projects.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-message">No projects yet.</p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate('/new')}
            >
              Create your first project
            </button>
          </div>
        ) : (
          <ul className="project-list">
            {projects.map((project) => (
              <li key={project.id} className="project-list-item">
                <button
                  type="button"
                  className="project-list-item__name"
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  {project.name}
                </button>
                <span className="project-list-item__meta">
                  {project.startDate && project.endDate
                    ? `${new Date(project.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} – ${new Date(project.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
                    : 'Dates required'}
                </span>
                <div className="project-list-item__actions">
                  <button
                    type="button"
                    className="btn-secondary btn-small"
                    onClick={() => exportProject(project)}
                  >
                    Export
                  </button>
                  {/* <button
                    type="button"
                    className="btn-danger btn-small"
                    onClick={() => setDeletingId(project.id)}
                  >
                    Delete
                  </button> */}
                </div>

                {deletingId === project.id && (
                  <div className="confirm-overlay">
                    <div className="confirm-dialog">
                      <p>Delete project <strong>{project.name}</strong>? This cannot be undone.</p>
                      <div className="confirm-actions">
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setDeletingId(null)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => handleDelete(project.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
