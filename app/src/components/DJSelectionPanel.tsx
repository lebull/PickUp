import { useEffect, useMemo, useState } from 'react'
import type { Submission, Stage, SlotAssignment } from '../types.ts'
import { useAppPreferences } from '../AppPreferencesContext.ts'

export interface ActiveSlot {
  stageId: string
  evening: string
  /** Set for sequential slots. Omitted for simultaneous slots. */
  slotIndex?: number
  timeLabel: string
  /** Set for simultaneous slots. Omitted for sequential slots. */
  positionIndex?: 1 | 2 | 3
}

interface Props {
  submissions: Submission[]
  stages: Stage[]
  assignments: SlotAssignment[]
  discardedSubmissionNumbers: Set<string>
  activeSlot: ActiveSlot
  onAssign: (stageId: string, evening: string, slotIndex: number, submissionNumber: string) => void
  onRemove: (stageId: string, evening: string, slotIndex: number) => void
  onAddSimultaneous: (stageId: string, evening: string, positionIndex: 1 | 2 | 3, submissionNumber: string) => void
  onClose: () => void
}

function fmt(n: number | null): string {
  return n === null ? '—' : n.toFixed(2)
}

const BUCKET_LABELS = ['1st Choice', '2nd Choice', '3rd Choice', '4th / 5th Choice', 'No Preference']

function getPreferenceRank(s: Submission, stage: string): number {
  const prefs = s.stagePreferences.filter(Boolean)
  const idx = prefs.indexOf(stage)
  if (idx === 0) return 0
  if (idx === 1) return 1
  if (idx === 2) return 2
  if (idx === 3 || idx === 4) return 3
  return 4 // not listed
}

export function DJSelectionPanel({
  submissions,
  stages,
  assignments,
  discardedSubmissionNumbers,
  activeSlot,
  onAssign,
  onRemove,
  onAddSimultaneous,
  onClose,
}: Props) {
  const { appContext, hiddenNames } = useAppPreferences()
  const [focusStage, setFocusStage] = useState<string | null>(null)

  const isSimultaneous = activeSlot.positionIndex != null
  const stage = stages.find((s) => s.id === activeSlot.stageId)

  // Derive grouping options from the actual preference values in submissions,
  // so the labels always match the spreadsheet strings exactly.
  const prefStageNames = useMemo(() => {
    const seen = new Set<string>()
    for (const s of submissions) {
      for (const p of s.stagePreferences) {
        if (p) seen.add(p)
      }
    }
    return [...seen].sort()
  }, [submissions])

  // Reset focus stage only when the evening changes, not on every slot advance
  useEffect(() => {
    setFocusStage(null)
  }, [activeSlot.evening])

  // For sequential slots: the currently assigned DJ for this exact slot
  const currentAssignment = isSimultaneous
    ? undefined
    : assignments.find(
        (a) =>
          a.stageId === activeSlot.stageId &&
          a.evening === activeSlot.evening &&
          a.slotIndex === activeSlot.slotIndex
      )

  // Submissions already assigned anywhere (by submissionNumber)
  const assignedNumbers = useMemo(() => new Set(assignments.map((a) => a.submissionNumber)), [assignments])

  const available = useMemo(() => {
    return submissions.filter((s) => {
      // Exclude currently assigned submission (shown in header instead)
      if (currentAssignment && s.submissionNumber === currentAssignment.submissionNumber) return false
      // Exclude submissions assigned elsewhere
      if (assignedNumbers.has(s.submissionNumber)) return false
      // Exclude discarded submissions
      if (discardedSubmissionNumbers.has(s.submissionNumber)) return false
      // Must be available this evening
      if (!s.daysAvailable.toLowerCase().includes(activeSlot.evening.toLowerCase())) return false
      // In moonlight context, only show moonlight-opted-in submissions
      if (appContext === 'moonlight' && !s.moonlightInterest) return false
      return true
    })
  }, [submissions, currentAssignment, assignedNumbers, discardedSubmissionNumbers, activeSlot.evening, appContext])

  // Sort by active-context score descending
  const sorted = useMemo(() => {
    return [...available].sort((a, b) => {
      const sa = appContext === 'moonlight' ? (a.mlScore.avg ?? -Infinity) : (a.mainScore.avg ?? -Infinity)
      const sb = appContext === 'moonlight' ? (b.mlScore.avg ?? -Infinity) : (b.mainScore.avg ?? -Infinity)
      return sb - sa
    })
  }, [available, appContext])

  // Group by preference rank when a focus stage is set
  const grouped = useMemo(() => {
    if (!focusStage) return null
    const buckets: Submission[][] = [[], [], [], [], []]
    for (const s of sorted) {
      buckets[getPreferenceRank(s, focusStage)].push(s)
    }
    return buckets
  }, [sorted, focusStage])

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  function handleFocusStage(name: string) {
    setFocusStage((prev) => (prev === name ? null : name))
  }

  function handleAssign(submissionNumber: string) {
    if (isSimultaneous) {
      onAddSimultaneous(activeSlot.stageId, activeSlot.evening, activeSlot.positionIndex!, submissionNumber)
    } else {
      onAssign(activeSlot.stageId, activeSlot.evening, activeSlot.slotIndex!, submissionNumber)
    }
    // Panel stays open — parent (LineupView) advances the active slot
  }

  function djLabel(s: Submission): string {
    if (hiddenNames) {
      const origIndex = submissions.indexOf(s)
      return `DJ #${origIndex + 1}`
    }
    return s.djName
  }

  function scoreLabel(s: Submission): string {
    if (appContext === 'moonlight') return fmt(s.mlScore.avg)
    return fmt(s.mainScore.avg)
  }

  function renderCard(s: Submission) {
    return (
      <div
        key={s.submissionNumber}
        className="dj-panel-card"
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('application/dj-submission-number', s.submissionNumber)
          e.dataTransfer.effectAllowed = 'move'
        }}
        onClick={() => handleAssign(s.submissionNumber)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAssign(s.submissionNumber) }}
        aria-label={`Assign ${djLabel(s)}`}
      >
        <span className="dj-col-name">{djLabel(s)}</span>
        <span className="dj-col-score">{scoreLabel(s)}</span>
        <span className="dj-col-genre">{s.genre || '—'}</span>
        <span className="dj-col-format" title={s.formatGear || ''}>{s.formatGear || '—'}</span>
        {appContext === 'moonlight' && (
          <span className="dj-col-vibefit">{s.mlVibefit || '—'}</span>
        )}
        <span className="dj-col-stages">
          {s.stagePreferences.filter(Boolean).join(', ') || '—'}
        </span>
      </div>
    )
  }

  return (
    <div className="dj-selection-panel">
      {/* Header */}
      <div className="dj-panel-header">
        <div className="dj-panel-title">
          <strong>{stage?.name ?? 'Stage'}</strong>
          <span className="dj-panel-slot-label">
            {activeSlot.evening} ·{' '}
            {isSimultaneous
              ? `Silent Disco — Position ${activeSlot.positionIndex}`
              : activeSlot.timeLabel}
          </span>
        </div>
        <button type="button" className="close-btn" onClick={onClose} aria-label="Close panel">
          ✕
        </button>
      </div>

      {/* Current assignment */}
      {currentAssignment && (
        <div className="dj-panel-current">
          <span>
            Current:{' '}
            <strong>
              {(() => {
                const sub = submissions.find((s) => s.submissionNumber === currentAssignment.submissionNumber)
                if (hiddenNames) {
                  const origIndex = submissions.indexOf(sub!)
                  return origIndex >= 0 ? `DJ #${origIndex + 1}` : currentAssignment.submissionNumber
                }
                return sub?.djName ?? currentAssignment.submissionNumber
              })()}
            </strong>
          </span>
          <button
            type="button"
            className="btn-danger btn-small"
            onClick={() => {
              onRemove(activeSlot.stageId, activeSlot.evening, activeSlot.slotIndex!)
              // Panel stays open — slot remains selected for immediate re-assignment
            }}
          >
            Remove
          </button>
        </div>
      )}

      {/* Focus-stage selector */}
      {prefStageNames.length > 0 && (
        <div className="dj-panel-filters">
          <span className="filter-label">Focus:</span>
          {prefStageNames.map((name) => (
            <button
              key={name}
              type="button"
              className={`day-btn${focusStage === name ? ' active' : ''}`}
              onClick={() => handleFocusStage(name)}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {/* Column headers */}
      <div className="dj-panel-list-header">
        <span className="dj-col-name">DJ</span>
        <span className="dj-col-score">{appContext === 'moonlight' ? 'ML Score' : 'Main Score'}</span>
        <span className="dj-col-genre">Genre</span>
        <span className="dj-col-format">Format / Gear</span>
        {appContext === 'moonlight' && <span className="dj-col-vibefit">Vibefit</span>}
        <span className="dj-col-stages">Stage Prefs</span>
      </div>

      {/* DJ list */}
      <div className="dj-panel-list">
        {sorted.length === 0 ? (
          <p className="dj-panel-empty">No available DJs for this slot.</p>
        ) : grouped ? (
          grouped.map((bucket, i) =>
            bucket.length === 0 ? null : (
              <div key={BUCKET_LABELS[i]} className="dj-panel-group">
                <div className="dj-panel-group-heading">{BUCKET_LABELS[i]}</div>
                {bucket.map(renderCard)}
              </div>
            )
          )
        ) : (
          sorted.map(renderCard)
        )}
      </div>
    </div>
  )
}
