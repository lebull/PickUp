import { useRef, useState, useEffect } from 'react'
import type { Project, StageSchedule } from '../../../types.ts'
import { exportProject } from '../../../projectStore.ts'
import { useAppPreferences } from '../../../shared/context/AppPreferencesContext.ts'
import { CsvImport } from '../../submissions/components/CsvImport.tsx'
import { getProjectDayNames } from '../../../lineupUtils.ts'
import { getSubmissionConverter } from '../../../submissionConverters.ts'
import type { Submission } from '../../../types.ts'

interface Props {
  project: Project
  onImport: (subs: Submission[], fileName: string, csvText: string, converterId: string) => void
  onProjectChange?: (project: Project) => void
}

export function NavActionsMenu({ project, onImport, onProjectChange }: Props) {
  const [open, setOpen] = useState(false)
  const [startDate, setStartDate] = useState(project.startDate ?? '')
  const [endDate, setEndDate] = useState(project.endDate ?? '')
  const [supportsMoonlight, setSupportsMoonlight] = useState(
    project.supportsMoonlight ?? getSubmissionConverter(project.submissionConverterId).supportsMoonlight
  )
  const [dateError, setDateError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { hiddenNames, setHiddenNames, timeFormat, setTimeFormat } = useAppPreferences()

  useEffect(() => {
    setStartDate(project.startDate ?? '')
    setEndDate(project.endDate ?? '')
    setSupportsMoonlight(project.supportsMoonlight ?? getSubmissionConverter(project.submissionConverterId).supportsMoonlight)
    setDateError(null)
  }, [project.startDate, project.endDate, project.supportsMoonlight, project.submissionConverterId])

  function handleSaveDates() {
    if (!startDate || !endDate) {
      setDateError('Project start and end dates are required.')
      return
    }
    if (startDate > endDate) {
      setDateError('Project start date must be before the end date.')
      return
    }
    if (!onProjectChange) return

    const projectDays = getProjectDayNames(startDate, endDate)

    const nextStages = project.stages.map((stage) => {
      const resolvedActiveDays = projectDays.length > 0
        ? ((stage.activeDays ?? []).filter((day) => projectDays.includes(day)).length > 0 ? (stage.activeDays ?? []).filter((day) => projectDays.includes(day)) : projectDays)
        : (stage.activeDays ?? [])

      const scheduleEntries: Record<string, StageSchedule[]> = {}
      for (const day of projectDays) {
        const existing = stage.schedule?.[day] ?? []
        scheduleEntries[day] = existing.length > 0 ? existing : [{ eventType: 'timed', startTime: '', endTime: '' }]
      }

      const preservedEntries: Record<string, StageSchedule[]> = {}
      for (const day of Object.keys(stage.schedule ?? {})) {
        if (!projectDays.includes(day)) continue
        preservedEntries[day] = stage.schedule?.[day] ?? []
      }

      return {
        ...stage,
        activeDays: resolvedActiveDays,
        schedule: { ...scheduleEntries, ...preservedEntries },
      }
    })

    onProjectChange({
      ...project,
      startDate,
      endDate,
      supportsMoonlight,
      stages: nextStages,
    })
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return

    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="nav-actions-menu" ref={containerRef}>
      <button
        type="button"
        className="nav-actions-trigger btn-secondary btn-small"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        ⚙ Settings
      </button>
      {open && (
        <div className="nav-actions-dropdown">
          <div className="nav-actions-row">
            <span className="nav-actions-label">Time</span>
            <div className="context-toggle" role="group" aria-label="Time format">
              <button
                type="button"
                className={`context-btn${timeFormat === '24h' ? ' active' : ''}`}
                onClick={() => setTimeFormat('24h')}
              >
                24h
              </button>
              <button
                type="button"
                className={`context-btn${timeFormat === '12h' ? ' active' : ''}`}
                onClick={() => setTimeFormat('12h')}
              >
                12h
              </button>
            </div>
          </div>
          <div className="nav-actions-row">
            <span className="nav-actions-label">Names</span>
            <button
              type="button"
              className={`hidden-names-btn${hiddenNames ? ' active' : ''}`}
              onClick={() => setHiddenNames(!hiddenNames)}
              aria-pressed={hiddenNames}
            >
              {hiddenNames ? '🙈 Hidden' : '👁 Visible'}
            </button>
          </div>
          <div className="nav-actions-row nav-actions-row--stacked">
            <span className="nav-actions-label">Project Dates</span>
            <div className="project-date-fields">
              <input
                type="date"
                className="form-input"
                required
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setDateError(null)
                }}
              />
              <span className="project-date-divider">to</span>
              <input
                type="date"
                className="form-input"
                required
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setDateError(null)
                }}
              />
            </div>
            {dateError && <span className="form-error">{dateError}</span>}
            <button type="button" className="btn-secondary btn-small" onClick={handleSaveDates}>
              Save Dates
            </button>
          </div>
          <div className="nav-actions-row">
            <span className="nav-actions-label">Moonlight</span>
            <div className="context-toggle" role="group" aria-label="Moonlight support">
              <button
                type="button"
                className={`context-btn${!supportsMoonlight ? ' active' : ''}`}
                onClick={() => setSupportsMoonlight(false)}
              >
                Off
              </button>
              <button
                type="button"
                className={`context-btn${supportsMoonlight ? ' active' : ''}`}
                onClick={() => setSupportsMoonlight(true)}
              >
                On
              </button>
            </div>
          </div>
          <div className="nav-actions-divider" />
          <div className="nav-actions-row nav-actions-row--import-export">
            <CsvImport onImport={(subs, name, csv, converterId) => { onImport(subs, name, csv, converterId); setOpen(false) }} />
            <button
              type="button"
              className="btn-secondary btn-small"
              onClick={() => { exportProject(project); setOpen(false) }}
            >
              Export
            </button>
          </div>
          {/* <div className="nav-actions-divider" />
          <button
            type="button"
            className="btn-danger btn-small nav-actions-delete-btn"
            disabled={isDeleting}
            onClick={handleDeleteProject}
          >
            {isDeleting ? 'Deleting…' : 'Delete Project'}
          </button> */}
        </div>
      )}
    </div>
  )
}
