import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProject } from '../projectStore'

export function ProjectCreate() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Project name is required.')
      return
    }
    const project = await createProject(trimmed)
    navigate(`/project/${project.id}`)
  }

  return (
    <div className="project-create-page">
      <header className="app-header">
        <h1 className="app-title">New Project</h1>
      </header>
      <main className="app-main">
        <form className="project-create-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="project-name" className="form-label">
              Project Name
            </label>
            <input
              id="project-name"
              type="text"
              className="form-input"
              placeholder="e.g. FWA 2026"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError(null)
              }}
              autoFocus
            />
            {error && <p className="form-error">{error}</p>}
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Project
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
