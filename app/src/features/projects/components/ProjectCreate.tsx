import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProject } from '../../../projectStore'

export function ProjectCreate() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Project name is required.')
      return
    }
    if (!startDate || !endDate) {
      setError('Project start and end dates are required.')
      return
    }
    if (startDate > endDate) {
      setError('Project start date must be before the end date.')
      return
    }
    const project = await createProject(trimmed, startDate, endDate)
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
          </div>

          <div className="form-field-row">
            <div className="form-field">
              <label htmlFor="project-start-date" className="form-label">
                Start Date
              </label>
              <input
                id="project-start-date"
                type="date"
                className="form-input"
                required
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  if (error) setError(null)
                }}
              />
            </div>
            <div className="form-field">
              <label htmlFor="project-end-date" className="form-label">
                End Date
              </label>
              <input
                id="project-end-date"
                type="date"
                className="form-input"
                required
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  if (error) setError(null)
                }}
              />
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

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
