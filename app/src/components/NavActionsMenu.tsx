import { useRef, useState, useEffect } from 'react'
import type { Project } from '../types.ts'
import { exportProject } from '../projectStore.ts'
import { useAppPreferences } from '../AppPreferencesContext.ts'
import { CsvImport } from './CsvImport.tsx'
import type { Submission } from '../types.ts'

interface Props {
  project: Project
  onImport: (subs: Submission[], fileName: string, csvText: string) => void
}

export function NavActionsMenu({ project, onImport }: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { hiddenNames, setHiddenNames, timeFormat, setTimeFormat } = useAppPreferences()

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
          <div className="nav-actions-divider" />
          <div className="nav-actions-row">
            <CsvImport onImport={(subs, name, csv) => { onImport(subs, name, csv); setOpen(false) }} />
            <button
              type="button"
              className="btn-secondary btn-small"
              onClick={() => { exportProject(project); setOpen(false) }}
            >
              Export
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
