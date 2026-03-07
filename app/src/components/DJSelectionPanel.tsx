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
  activeSlot: ActiveSlot
  onAssign: (stageId: string, evening: string, slotIndex: number, djName: string) => void
  onRemove: (stageId: string, evening: string, slotIndex: number) => void
  onAddSimultaneous: (stageId: string, evening: string, positionIndex: 1 | 2 | 3, djName: string) => void
  onClose: () => void
}

function fmt(n: number | null): string {
  return n === null ? '—' : n.toFixed(2)
}

export function DJSelectionPanel({
  submissions,
  stages,
  assignments,
  activeSlot,
  onAssign,
  onRemove,
  onAddSimultaneous,
  onClose,
}: Props) {
  const { appContext, hiddenNames } = useAppPreferences()
  const [selectedStages, setSelectedStages] = useState<Set<string>>(new Set())

  const isSimultaneous = activeSlot.positionIndex != null
  const stage = stages.find((s) => s.id === activeSlot.stageId)
  const stageNames = useMemo(() => stages.map((s) => s.name).filter(Boolean), [stages])

  // For sequential slots: the currently assigned DJ for this exact slot
  const currentAssignment = isSimultaneous
    ? undefined
    : assignments.find(
        (a) =>
          a.stageId === activeSlot.stageId &&
          a.evening === activeSlot.evening &&
          a.slotIndex === activeSlot.slotIndex
      )

  // DJs already assigned anywhere
  const assignedDjNames = useMemo(() => new Set(assignments.map((a) => a.djName)), [assignments])

  const available = useMemo(() => {
    return submissions.filter((s) => {
      // Exclude currently assigned DJ (shown in header instead)
      if (currentAssignment && s.djName === currentAssignment.djName) return false
      // Exclude DJs assigned elsewhere
      if (assignedDjNames.has(s.djName)) return false
      // Must be available this evening
      if (!s.daysAvailable.toLowerCase().includes(activeSlot.evening.toLowerCase())) return false
      // Stage preference filter
      if (selectedStages.size > 0) {
        const prefNames = s.stagePreferences.filter(Boolean)
        if (!prefNames.some((p) => selectedStages.has(p))) return false
      }
      return true
    })
  }, [submissions, currentAssignment, assignedDjNames, activeSlot.evening, selectedStages])

  // Sort by active-context score descending
  const sorted = useMemo(() => {
    return [...available].sort((a, b) => {
      const sa = appContext === 'moonlight' ? (a.mlScore.avg ?? -Infinity) : (a.mainScore.avg ?? -Infinity)
      const sb = appContext === 'moonlight' ? (b.mlScore.avg ?? -Infinity) : (b.mainScore.avg ?? -Infinity)
      return sb - sa
    })
  }, [available, appContext])

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  function toggleStage(name: string) {
    setSelectedStages((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  function handleAssign(djName: string) {
    if (isSimultaneous) {
      onAddSimultaneous(activeSlot.stageId, activeSlot.evening, activeSlot.positionIndex!, djName)
    } else {
      onAssign(activeSlot.stageId, activeSlot.evening, activeSlot.slotIndex!, djName)
    }
    onClose()
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
              {hiddenNames
                ? `DJ #${submissions.findIndex((s) => s.djName === currentAssignment.djName) + 1}`
                : currentAssignment.djName}
            </strong>
          </span>
          <button
            type="button"
            className="btn-danger btn-small"
            onClick={() => {
              onRemove(activeSlot.stageId, activeSlot.evening, activeSlot.slotIndex)
              onClose()
            }}
          >
            Remove
          </button>
        </div>
      )}

      {/* Stage preference filter */}
      {stageNames.length > 0 && (
        <div className="dj-panel-filters">
          <span className="filter-label">Stage Pref:</span>
          {stageNames.map((name) => (
            <button
              key={name}
              type="button"
              className={`day-btn${selectedStages.has(name) ? ' active' : ''}`}
              onClick={() => toggleStage(name)}
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
        {appContext === 'moonlight' && <span className="dj-col-vibefit">Vibefit</span>}
        <span className="dj-col-stages">Stage Prefs</span>
      </div>

      {/* DJ list */}
      <div className="dj-panel-list">
        {sorted.length === 0 ? (
          <p className="dj-panel-empty">No available DJs match the current filters.</p>
        ) : (
          sorted.map((s) => {
            const origIndex = submissions.indexOf(s)
            return (
              <div
                key={s.djName}
                className="dj-panel-card"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/dj-name', s.djName)
                  e.dataTransfer.effectAllowed = 'move'
                }}
                onClick={() => handleAssign(s.djName)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAssign(s.djName) }}
                aria-label={`Assign ${djLabel(s)}`}
              >
                <span className="dj-col-name">{djLabel(s)}</span>
                <span className="dj-col-score">{scoreLabel(s)}</span>
                <span className="dj-col-genre">{s.genre || '—'}</span>
                {appContext === 'moonlight' && (
                  <span className="dj-col-vibefit">{s.mlVibefit || '—'}</span>
                )}
                <span className="dj-col-stages">
                  {s.stagePreferences.filter(Boolean).join(', ') || '—'}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
