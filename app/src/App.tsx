import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'
import { parseSubmissions } from './loadSubmissions.ts'
import type { Submission, Stage, LineupState } from './types.ts'
import { SubmissionList } from './components/SubmissionList.tsx'
import type { SortField, SortDir, ScoreMetric } from './components/SubmissionList.tsx'
import { SubmissionDetail } from './components/SubmissionDetail.tsx'
import { CsvImport } from './components/CsvImport.tsx'
import { LineupGrid } from './components/LineupGrid.tsx'
import { StageConfigPanel } from './components/StageConfigPanel.tsx'
import { saveLineup, loadLineup, clearLineup } from './lineupStorage.ts'

const DEFAULT_TITLE = 'Pickup - DJ Submission Manager'

const EMPTY_LINEUP: LineupState = { stages: [], assignments: [], rowCount: 0 }

function App() {
  const [submissions, setSubmissions] = useState<Submission[] | null>(null)
  const [importedFileName, setImportedFileName] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [scoreMetric, setScoreMetric] = useState<ScoreMetric>('avg')
  const [activeDays, setActiveDays] = useState<Set<string>>(new Set())
  const [dropError, setDropError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  // Lineup Builder state
  const [activeMode, setActiveMode] = useState<'submissions' | 'lineup'>('submissions')
  const [lineup, setLineup] = useState<LineupState>(EMPTY_LINEUP)
  const [showStageConfig, setShowStageConfig] = useState(false)
  const [rowCountMismatch, setRowCountMismatch] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // Debounced auto-save
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoSave = useCallback(
    (fileName: string, state: LineupState) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        saveLineup(fileName, state)
      }, 800)
    },
    []
  )

  async function handleImport(subs: Submission[], fileName: string) {
    setSubmissions(subs)
    setImportedFileName(fileName)
    setSelectedIndex(null)
    setDropError(null)
    setRowCountMismatch(false)

    // Attempt to restore saved lineup
    const result = await loadLineup(fileName, subs.length)
    if (result) {
      setLineup(result.state)
      if (result.rowCountMismatch) setRowCountMismatch(true)
    } else {
      setLineup({ ...EMPTY_LINEUP, rowCount: subs.length })
    }
  }

  // Auto-save whenever lineup changes (and a file is imported)
  useEffect(() => {
    if (importedFileName) {
      autoSave(importedFileName, lineup)
    }
  }, [lineup, importedFileName, autoSave])

  function handleAssign(stageId: string, evening: string, slotIndex: number, djName: string) {
    setLineup((prev) => ({
      ...prev,
      assignments: [
        ...prev.assignments.filter(
          (a) => !(a.stageId === stageId && a.evening === evening && a.slotIndex === slotIndex)
        ),
        { stageId, evening, slotIndex, djName },
      ],
    }))
  }

  function handleRemove(stageId: string, evening: string, slotIndex: number) {
    setLineup((prev) => ({
      ...prev,
      assignments: prev.assignments.filter(
        (a) => !(a.stageId === stageId && a.evening === evening && a.slotIndex === slotIndex)
      ),
    }))
  }

  function handleSaveStages(stages: Stage[]) {
    // Warn about orphaned assignments handled inside StageConfigPanel; clean up here.
    const stageIds = new Set(stages.map((s) => s.id))
    setLineup((prev) => ({
      ...prev,
      stages,
      assignments: prev.assignments.filter((a) => stageIds.has(a.stageId)),
    }))
    setShowStageConfig(false)
  }

  async function handleClearLineup() {
    if (!importedFileName) return
    await clearLineup(importedFileName)
    setLineup({ ...EMPTY_LINEUP, rowCount: submissions?.length ?? 0 })
    setRowCountMismatch(false)
    setShowClearConfirm(false)
  }

  function handleHeaderClick(field: SortField) {
    if (field === sortField) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  function handleDayToggle(day: string) {
    setActiveDays((prev) => {
      const next = new Set(prev)
      if (next.has(day)) next.delete(day)
      else next.add(day)
      return next
    })
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>{importedFileName ?? DEFAULT_TITLE}</h1>
        {submissions !== null && (
          <span className="submission-count">{submissions.length} submissions</span>
        )}
        {submissions !== null && (
          <nav className="mode-tabs">
            <button
              type="button"
              className={`mode-tab${activeMode === 'submissions' ? ' active' : ''}`}
              onClick={() => setActiveMode('submissions')}
            >
              Submissions
            </button>
            <button
              type="button"
              className={`mode-tab${activeMode === 'lineup' ? ' active' : ''}`}
              onClick={() => setActiveMode('lineup')}
            >
              Lineup Builder
            </button>
          </nav>
        )}
        <CsvImport onImport={handleImport} />
      </header>
      <main className="app-main">
        {submissions === null ? (
          <div
            className={`drop-zone${isDragOver ? ' drop-zone--active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={async (e) => {
              e.preventDefault()
              setIsDragOver(false)
              const file = e.dataTransfer.files[0]
              if (!file) return
              try {
                const text = await file.text()
                const subs = parseSubmissions(text)
                setDropError(null)
                await handleImport(subs, file.name)
              } catch (err) {
                setDropError(err instanceof Error ? err.message : 'Failed to parse CSV')
              }
            }}
          >
            <div className="drop-zone-inner">
              <p className="drop-zone-prompt">Drop a CSV file here, or use the Import CSV button above.</p>
              {dropError && <p className="import-error">{dropError}</p>}
            </div>
          </div>
        ) : activeMode === 'submissions' ? (
          <div className={`split-layout${selectedIndex !== null ? ' has-selection' : ''}`}>
            <div className="split-list">
              <SubmissionList
                submissions={submissions}
                sortField={sortField}
                sortDir={sortDir}
                scoreMetric={scoreMetric}
                activeDays={activeDays}
                onHeaderClick={handleHeaderClick}
                onMetricChange={setScoreMetric}
                onDayToggle={handleDayToggle}
                onSelect={setSelectedIndex}
              />
            </div>
            <div className="split-detail">
              {selectedIndex !== null ? (
                <SubmissionDetail
                  submission={submissions[selectedIndex]}
                  onBack={() => setSelectedIndex(null)}
                />
              ) : (
                <p className="no-selection">Select a submission to view details</p>
              )}
            </div>
          </div>
        ) : (
          <div className="lineup-layout">
            {rowCountMismatch && (
              <div className="mismatch-banner">
                ⚠ The submission count has changed since this lineup was saved. Some assignments may
                reference DJs no longer in the spreadsheet.
                <button type="button" className="mismatch-dismiss" onClick={() => setRowCountMismatch(false)}>
                  Dismiss
                </button>
              </div>
            )}
            <div className="lineup-main">
              <LineupGrid
                submissions={submissions}
                stages={lineup.stages}
                assignments={lineup.assignments}
                onAssign={handleAssign}
                onRemove={handleRemove}
                onConfigureStages={() => setShowStageConfig(true)}
              />
            </div>
            <div className="lineup-footer">
              <button
                type="button"
                className="btn-danger btn-small"
                onClick={() => setShowClearConfirm(true)}
              >
                Clear Lineup
              </button>
            </div>

            {showClearConfirm && (
              <div className="confirm-overlay">
                <div className="confirm-dialog">
                  <p>Clear all lineup data and stage configuration? This cannot be undone.</p>
                  <div className="confirm-actions">
                    <button type="button" className="btn-secondary" onClick={() => setShowClearConfirm(false)}>
                      Cancel
                    </button>
                    <button type="button" className="btn-danger" onClick={handleClearLineup}>
                      Clear Lineup
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showStageConfig && (
              <StageConfigPanel
                stages={lineup.stages}
                assignments={lineup.assignments}
                onSave={handleSaveStages}
                onClose={() => setShowStageConfig(false)}
              />
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
