import { useEffect, useMemo, useState } from 'react'
import type { Submission, Stage, SlotAssignment, DJSlotAssignment } from '../types.ts'
import { isBlankAssignment, getBlankLabel } from '../types.ts'
import { useAppPreferences } from '../AppPreferencesContext.ts'
import { hexToTint } from '../stageColors.ts'
import { getSlotLabels } from '../lineupUtils.ts'

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
  onRemoveSimultaneous: (stageId: string, evening: string, positionIndex: 1 | 2 | 3) => void
  onAssignBlank: (stageId: string, evening: string, slotIndex: number, blankLabel?: string) => void
  onAddBlankSimultaneous: (stageId: string, evening: string, positionIndex: 1 | 2 | 3, blankLabel?: string) => void
  onPositionSelect: (positionIndex: 1 | 2 | 3) => void
  /** Called when the user clicks a sequential slot row in the tray to change the active slot. */
  onSelectSlot: (slotIndex: number, timeLabel: string) => void
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

// ── SlotTray ──────────────────────────────────────────────────────────────────

interface SlotTrayProps {
  activeSlot: ActiveSlot
  /** All time-label rows for the sequential stage on this evening (empty for simultaneous). */
  stageSlotLabels: string[]
  stageAssignments: SlotAssignment[]
  submissions: Submission[]
  stageColor?: string
  getDisplayName: (submissionNumber: string) => string
  onAssignSequential: (slotIndex: number, submissionNumber: string) => void
  onAssignSimultaneous: (positionIndex: 1 | 2 | 3, submissionNumber: string) => void
  onRemoveSequential: (slotIndex: number) => void
  onRemoveSimultaneous: (positionIndex: 1 | 2 | 3) => void
  onSelectPosition: (positionIndex: 1 | 2 | 3) => void
  onSelectSlot: (slotIndex: number, timeLabel: string) => void
}

function SlotTray({
  activeSlot,
  stageSlotLabels,
  stageAssignments,
  submissions,
  stageColor,
  getDisplayName,
  onAssignSequential,
  onAssignSimultaneous,
  onRemoveSequential,
  onRemoveSimultaneous,
  onSelectPosition,
  onSelectSlot,
}: SlotTrayProps) {
  const isSimultaneous = activeSlot.positionIndex != null

  function getGenre(submissionNumber: string): string {
    return submissions.find((s) => s.submissionNumber === submissionNumber)?.genre || '—'
  }

  if (!isSimultaneous) {
    return (
      <div className="slot-tray">
        {stageSlotLabels.map((label, slotIdx) => {
          const assignment = stageAssignments.find(
            (a) => a.slotIndex === slotIdx && a.positionIndex == null
          )
          const isActive = activeSlot.slotIndex === slotIdx
          const rowStyle = stageColor && assignment && !isBlankAssignment(assignment) ? { backgroundColor: hexToTint(stageColor, 0.15) } : undefined
          return (
            <div
              key={label}
              className={`slot-tray-row${isActive ? ' slot-tray-row--active' : ''}${assignment ? '' : ' slot-tray-row--empty'}`}
              style={rowStyle}
              onClick={!isActive ? () => onSelectSlot(slotIdx, label) : undefined}
              onDragOver={!assignment ? (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' } : undefined}
              onDrop={!assignment ? (e) => {
                e.preventDefault()
                const subNum = e.dataTransfer.getData('application/dj-submission-number')
                if (subNum) onAssignSequential(slotIdx, subNum)
              } : undefined}
            >
              <span className="slot-tray-time">{label}</span>
              {assignment ? (
                <>
                  <span className="slot-tray-dj-name">
                    {isBlankAssignment(assignment) ? getBlankLabel(assignment) : getDisplayName(assignment.submissionNumber)}
                  </span>
                  {!isBlankAssignment(assignment) && (
                    <span className="slot-tray-dj-genre">{getGenre(assignment.submissionNumber)}</span>
                  )}
                  <button type="button" className="slot-tray-remove-btn" onClick={(e) => { e.stopPropagation(); onRemoveSequential(slotIdx) }}>
                    Remove
                  </button>
                </>
              ) : (
                <span className="slot-tray-empty">Empty — drag a DJ here</span>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="slot-tray">
      {([1, 2, 3] as const).map((pos) => {
        const assignment = stageAssignments.find((a) => a.positionIndex === pos)
        const isActive = activeSlot.positionIndex === pos
        const rowStyle = stageColor && assignment && !isBlankAssignment(assignment) ? { backgroundColor: hexToTint(stageColor, 0.15) } : undefined
        return (
          <div
            key={pos}
            className={`slot-tray-row${isActive ? ' slot-tray-row--active' : ''}${assignment ? '' : ' slot-tray-row--empty'}`}
            style={rowStyle}
            onClick={() => onSelectPosition(pos)}
            onDragOver={!assignment ? (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' } : undefined}
            onDrop={!assignment ? (e) => {
              e.preventDefault()
              const subNum = e.dataTransfer.getData('application/dj-submission-number')
              if (subNum) onAssignSimultaneous(pos, subNum)
            } : undefined}
          >
            <span className="slot-tray-time">Pos {pos}</span>
            {assignment ? (
              <>
                <span className="slot-tray-dj-name">
                  {isBlankAssignment(assignment) ? getBlankLabel(assignment) : getDisplayName(assignment.submissionNumber)}
                </span>
                {!isBlankAssignment(assignment) && (
                  <span className="slot-tray-dj-genre">{getGenre(assignment.submissionNumber)}</span>
                )}
                <button
                  type="button"
                  className="slot-tray-remove-btn"
                  onClick={(e) => { e.stopPropagation(); onRemoveSimultaneous(pos) }}
                >
                  Remove
                </button>
              </>
            ) : (
              <span className="slot-tray-empty">Empty — drag a DJ here</span>
            )}
          </div>
        )
      })}
    </div>
  )
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
  onRemoveSimultaneous,
  onAssignBlank,
  onAddBlankSimultaneous,
  onPositionSelect,
  onSelectSlot,
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

  // Reset focus stage only when the evening changes (inline state reset per React docs)
  const [lastEvening, setLastEvening] = useState(activeSlot.evening)
  if (activeSlot.evening !== lastEvening) {
    setLastEvening(activeSlot.evening)
    setFocusStage(null)
  }

  // For sequential slots: the currently assigned DJ for this exact slot
  const currentAssignment = isSimultaneous
    ? undefined
    : assignments.find(
        (a) =>
          a.stageId === activeSlot.stageId &&
          a.evening === activeSlot.evening &&
          a.slotIndex === activeSlot.slotIndex
      )

  // Blank label input state — pre-fill from existing blank assignment when slot changes
  const [blankLabel, setBlankLabel] = useState<string>('Blocked')
  useEffect(() => {
    if (!isSimultaneous && currentAssignment && isBlankAssignment(currentAssignment)) {
      setBlankLabel(currentAssignment.blankLabel || 'Blocked')
    } else {
      setBlankLabel('Blocked')
    }
    // intentionally omit currentAssignment to only reset on slot navigation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlot.stageId, activeSlot.evening, activeSlot.slotIndex, isSimultaneous])

  // Submissions already assigned anywhere (by submissionNumber)
  const assignedNumbers = useMemo(() =>
    new Set(
      assignments
        .filter((a): a is DJSlotAssignment => !isBlankAssignment(a))
        .map((a) => a.submissionNumber)
    ), [assignments])

  const available = useMemo(() => {
    return submissions.filter((s) => {
      // Exclude currently assigned submission (shown in header instead)
      if (currentAssignment && !isBlankAssignment(currentAssignment) && s.submissionNumber === currentAssignment.submissionNumber) return false
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

  function handleAssignBlank() {
    const label = blankLabel.trim() || undefined
    if (isSimultaneous) {
      onAddBlankSimultaneous(activeSlot.stageId, activeSlot.evening, activeSlot.positionIndex!, label)
    } else {
      onAssignBlank(activeSlot.stageId, activeSlot.evening, activeSlot.slotIndex!, label)
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
        <span className="dj-col-name" title={djLabel(s)}>{djLabel(s)}</span>
        <span className="dj-col-score" title={scoreLabel(s)}>{scoreLabel(s)}</span>
        <span className="dj-col-genre" title={s.genre || '—'}>{s.genre || '—'}</span>
        <span className="dj-col-format" title={s.formatGear || '—'}>{s.formatGear || '—'}</span>
        {appContext === 'moonlight' && (
          <span className="dj-col-vibefit" title={s.mlVibefit || '—'}>{s.mlVibefit || '—'}</span>
        )}
        <span className="dj-col-stages" title={s.stagePreferences.filter(Boolean).join(', ') || '—'}>
          {s.stagePreferences.filter(Boolean).join(', ') || '—'}
        </span>
      </div>
    )
  }

  return (
    <div className="dj-selection-panel">
      <div className="dj-panel-scrollable">
      <div className="dj-panel-sticky-header">
      {/* Header */}
      <div className="dj-panel-header">
        <div className="dj-panel-title">
          <strong>{stage?.name ?? 'Stage'}</strong>
          <span className="dj-panel-slot-label">
            {activeSlot.evening}{isSimultaneous ? ' · Silent Disco' : ` · ${activeSlot.timeLabel}`}
          </span>
        </div>
        <button type="button" className="close-btn" onClick={onClose} aria-label="Close panel">
          ✕
        </button>
      </div>

      {/* Slot tray */}
      <SlotTray
        activeSlot={activeSlot}
        stageSlotLabels={stage ? getSlotLabels(stage, activeSlot.evening) : []}
        stageAssignments={assignments.filter(
          (a) => a.stageId === activeSlot.stageId && a.evening === activeSlot.evening
        )}
        submissions={submissions}
        stageColor={stage?.color}
        getDisplayName={(subNum) => {
          const s = submissions.find((sub) => sub.submissionNumber === subNum)
          if (!s) return subNum
          if (hiddenNames) {
            const origIndex = submissions.indexOf(s)
            return origIndex >= 0 ? `DJ #${origIndex + 1}` : subNum
          }
          return s.djName
        }}
        onAssignSequential={(slotIndex, subNum) =>
          onAssign(activeSlot.stageId, activeSlot.evening, slotIndex, subNum)
        }
        onAssignSimultaneous={(pos, subNum) =>
          onAddSimultaneous(activeSlot.stageId, activeSlot.evening, pos, subNum)
        }
        onRemoveSequential={(slotIndex) =>
          onRemove(activeSlot.stageId, activeSlot.evening, slotIndex)
        }
        onRemoveSimultaneous={(pos) =>
          onRemoveSimultaneous(activeSlot.stageId, activeSlot.evening, pos)
        }
        onSelectPosition={onPositionSelect}
        onSelectSlot={onSelectSlot}
      />

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
      </div>

      {/* DJ list */}
      <div className="dj-panel-list">
        {/* Pinned blank slot row — always first */}
        <div
          className="dj-panel-blank-row"
          role="button"
          tabIndex={0}
          onClick={handleAssignBlank}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAssignBlank() }}
          aria-label="Assign as blocked slot"
        >
          <span className="dj-panel-blank-label">Blocked slot</span>
          <input
            type="text"
            className="dj-panel-blank-input"
            value={blankLabel}
            onChange={(e) => setBlankLabel(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="Blocked"
            aria-label="Blank slot label"
          />
          <span className="dj-panel-blank-hint">click to assign</span>
        </div>
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
    </div>
  )
}
