import { useEffect, useMemo, useState } from 'react'
import type { Submission, Stage, SlotAssignment, DJSlotAssignment } from '../types.ts'
import { isBlankAssignment, getBlankLabel } from '../types.ts'
import { useAppPreferences } from '../AppPreferencesContext.ts'
import { hexToTint } from '../stageColors.ts'
import { getSlotLabels, formatTimeLabel } from '../lineupUtils.ts'
import { isDJUnavailableOnEvening } from '../djAvailability.ts'
import { buildPeekContent, hasAnyScore } from '../scorePeekUtils.tsx'

export interface ActiveSlot {
  stageId: string
  evening: string
  /** Set for sequential slots. Omitted for simultaneous slots. */
  slotIndex?: number
  timeLabel: string
  /** Zero-based event index for sequential slots. Omitted for simultaneous slots. */
  eventIndex?: number
  /** Set for simultaneous slots. Omitted for sequential slots. */
  positionIndex?: 1 | 2 | 3
}

interface Props {
  submissions: Submission[]
  stages: Stage[]
  assignments: SlotAssignment[]
  discardedSubmissionNumbers: Set<string>
  activeSlot: ActiveSlot | null
  /** The currently selected evening, used for filtering when no slot is active. */
  currentEvening: string
  onAssign: (stageId: string, evening: string, slotIndex: number, submissionNumber: string, eventIndex: number) => void
  onRemove: (stageId: string, evening: string, slotIndex: number, eventIndex: number) => void
  onAddSimultaneous: (stageId: string, evening: string, positionIndex: 1 | 2 | 3, submissionNumber: string) => void
  onRemoveSimultaneous: (stageId: string, evening: string, positionIndex: 1 | 2 | 3) => void
  onAssignBlank: (stageId: string, evening: string, slotIndex: number, blankLabel?: string, eventIndex?: number) => void
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
  timeFormat: '12h' | '24h'
  useMoonlight: boolean
  getDisplayName: (submissionNumber: string) => string
  onAssignSequential: (slotIndex: number, submissionNumber: string) => void
  onAssignSimultaneous: (positionIndex: 1 | 2 | 3, submissionNumber: string) => void
  onRemoveSequential: (slotIndex: number) => void
  onRemoveSimultaneous: (positionIndex: 1 | 2 | 3) => void
  onBlockSequential: (slotIndex: number) => void
  onSelectPosition: (positionIndex: 1 | 2 | 3) => void
  onSelectSlot: (slotIndex: number, timeLabel: string) => void
  onPeekEnter: (sub: Submission, rect: DOMRect) => void
  onPeekLeave: () => void
}

function SlotTray({
  activeSlot,
  stageSlotLabels,
  stageAssignments,
  submissions,
  stageColor,
  timeFormat,
  useMoonlight,
  getDisplayName,
  onAssignSequential,
  onAssignSimultaneous,
  onRemoveSequential,
  onRemoveSimultaneous,
  onBlockSequential,
  onSelectPosition,
  onSelectSlot,
  onPeekEnter,
  onPeekLeave,
}: SlotTrayProps) {
  const isSimultaneous = activeSlot.positionIndex != null

  function getSubmission(submissionNumber: string): Submission | undefined {
    return submissions.find((s) => s.submissionNumber === submissionNumber)
  }

  function getGenre(submissionNumber: string): string {
    const sub = getSubmission(submissionNumber)
    return (useMoonlight ? sub?.mlGenre : sub?.genre) || '—'
  }

  function getScore(submissionNumber: string): number | null {
    const sub = getSubmission(submissionNumber)
    if (!sub) return null
    return useMoonlight ? sub.mlScore.avg : sub.mainScore.avg
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
              <span className="slot-tray-time">{formatTimeLabel(label, timeFormat)}</span>
              {assignment ? (
                <>
                  <span className="slot-tray-dj-name" title={isBlankAssignment(assignment) ? getBlankLabel(assignment) : getDisplayName(assignment.submissionNumber)}>
                    {isBlankAssignment(assignment) ? getBlankLabel(assignment) : getDisplayName(assignment.submissionNumber)}
                  </span>
                  {!isBlankAssignment(assignment) && (() => {
                    const sub = getSubmission(assignment.submissionNumber)
                    const scoreVal = getScore(assignment.submissionNumber)
                    const canPeek = sub ? hasAnyScore(sub, useMoonlight) : false
                    return (
                      <>
                        <span
                          className="slot-tray-dj-score"
                          title={fmt(scoreVal)}
                          onMouseEnter={canPeek && sub ? (e) => { e.stopPropagation(); onPeekEnter(sub, e.currentTarget.getBoundingClientRect()) } : undefined}
                          onMouseLeave={canPeek ? () => onPeekLeave() : undefined}
                        >
                          {fmt(scoreVal)}
                        </span>
                        <span className="slot-tray-dj-genre" title={getGenre(assignment.submissionNumber)}>{getGenre(assignment.submissionNumber)}</span>
                        <span className="slot-tray-dj-gear" title={sub?.formatGear || '—'}>{sub?.formatGear || '—'}</span>
                      </>
                    )
                  })()}
                  <button type="button" className="slot-tray-remove-btn" onClick={(e) => { e.stopPropagation(); onRemoveSequential(slotIdx) }}>
                    Remove
                  </button>
                </>
              ) : (
                <>
                  <span className="slot-tray-empty">Empty — drag a DJ here</span>
                  <button type="button" className="slot-tray-block-btn" onClick={(e) => { e.stopPropagation(); onBlockSequential(slotIdx) }}>
                    Block Slot
                  </button>
                </>
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
                <span className="slot-tray-dj-name" title={isBlankAssignment(assignment) ? getBlankLabel(assignment) : getDisplayName(assignment.submissionNumber)}>
                  {isBlankAssignment(assignment) ? getBlankLabel(assignment) : getDisplayName(assignment.submissionNumber)}
                </span>
                {!isBlankAssignment(assignment) && (() => {
                  const sub = getSubmission(assignment.submissionNumber)
                  const scoreVal = getScore(assignment.submissionNumber)
                  const canPeek = sub ? hasAnyScore(sub, useMoonlight) : false
                  return (
                    <>
                      <span
                        className="slot-tray-dj-score"
                        title={fmt(scoreVal)}
                        onMouseEnter={canPeek && sub ? (e) => { e.stopPropagation(); onPeekEnter(sub, e.currentTarget.getBoundingClientRect()) } : undefined}
                        onMouseLeave={canPeek ? () => onPeekLeave() : undefined}
                      >
                        {fmt(scoreVal)}
                      </span>
                      <span className="slot-tray-dj-genre" title={getGenre(assignment.submissionNumber)}>{getGenre(assignment.submissionNumber)}</span>
                      <span className="slot-tray-dj-gear" title={sub?.formatGear || '—'}>{sub?.formatGear || '—'}</span>
                    </>
                  )
                })()}
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
  currentEvening,
  onAssign,
  onRemove,
  onAddSimultaneous,
  onRemoveSimultaneous,
  onAssignBlank,
  onAddBlankSimultaneous: _onAddBlankSimultaneous,
  onPositionSelect,
  onSelectSlot,
  onClose,
}: Props) {
  const { hiddenNames, timeFormat } = useAppPreferences()
  const [focusStage, setFocusStage] = useState<string | null>(null)
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)

  const isBrowsing = activeSlot === null
  const isSimultaneous = activeSlot?.positionIndex != null
  const stage = activeSlot ? stages.find((s) => s.id === activeSlot.stageId) : undefined
  const useMoonlight = !isBrowsing && (stage?.useMoonlightScores ?? false)
  const effectiveEvening = activeSlot?.evening ?? currentEvening

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

  const [scorePeek, setScorePeek] = useState<{ sub: Submission; rect: DOMRect } | null>(null)

  // Reset focus stage and availability filter only when the evening changes (inline state reset per React docs)
  const [lastEvening, setLastEvening] = useState(effectiveEvening)
  if (effectiveEvening !== lastEvening) {
    setLastEvening(effectiveEvening)
    setFocusStage(null)
    setShowAvailableOnly(false)
  }

  // For sequential slots: the currently assigned DJ for this exact slot
  const currentAssignment = (isSimultaneous || !activeSlot)
    ? undefined
    : assignments.find(
        (a) =>
          a.stageId === activeSlot.stageId &&
          a.evening === activeSlot.evening &&
          (a.eventIndex ?? 0) === (activeSlot.eventIndex ?? 0) &&
          a.slotIndex === activeSlot.slotIndex
      )

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
      // In moonlight context, only show moonlight-opted-in submissions
      if (useMoonlight && !s.moonlightInterest) return false
      return true
    })
  }, [submissions, currentAssignment, assignedNumbers, discardedSubmissionNumbers, useMoonlight])

  // Apply the "Available only" opt-in filter on top of the base pool
  const filtered = useMemo(() => {
    if (!showAvailableOnly) return available
    return available.filter((s) => !isDJUnavailableOnEvening(s.daysAvailable, effectiveEvening))
  }, [available, showAvailableOnly, effectiveEvening])

  // Sort by active-context score descending
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const sa = useMoonlight ? (a.mlScore.avg ?? -Infinity) : (a.mainScore.avg ?? -Infinity)
      const sb = useMoonlight ? (b.mlScore.avg ?? -Infinity) : (b.mainScore.avg ?? -Infinity)
      return sb - sa
    })
  }, [filtered, useMoonlight])

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
    if (!activeSlot) return // browsing state — no slot selected
    if (currentAssignment && !isBlankAssignment(currentAssignment)) return // slot occupied — drag-and-drop is the replace path
    if (isSimultaneous) {
      onAddSimultaneous(activeSlot.stageId, activeSlot.evening, activeSlot.positionIndex!, submissionNumber)
    } else {
      onAssign(activeSlot.stageId, activeSlot.evening, activeSlot.slotIndex!, submissionNumber, activeSlot.eventIndex ?? 0)
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

  function renderCard(s: Submission) {
    const mainScoreVal = s.mainScore.avg
    const mlScoreVal = s.mlScore.avg
    const scoreVal = useMoonlight ? mlScoreVal : mainScoreVal
    const hasPeek = hasAnyScore(s, useMoonlight)
    const isUnavailable = isDJUnavailableOnEvening(s.daysAvailable, effectiveEvening)
    return (
      <div
        key={s.submissionNumber}
        className={`dj-panel-card${isUnavailable ? ' dj-row--unavailable' : ''}`}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('application/dj-submission-number', s.submissionNumber)
          e.dataTransfer.effectAllowed = 'move'
        }}
        onClick={() => handleAssign(s.submissionNumber)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAssign(s.submissionNumber) }}
        aria-label={isBrowsing ? djLabel(s) : `Assign ${djLabel(s)}`}
      >
        <span className="dj-col-name" title={djLabel(s)}>
          {isUnavailable && (
            <span
              className="dj-unavail-icon"
              title={`Available: ${s.daysAvailable || 'unknown'}`}
              aria-label="Not available this day"
            >⚠</span>
          )}
          {djLabel(s)}
        </span>
        {isBrowsing ? (
          <>
            <span className="dj-col-score" title={fmt(mainScoreVal)}>{fmt(mainScoreVal)}</span>
            <span className="dj-col-score dj-col-score--ml" title={fmt(mlScoreVal)}>{fmt(mlScoreVal)}</span>
          </>
        ) : (
          <span
            className="dj-col-score"
            title={fmt(scoreVal)}
            onMouseEnter={hasPeek ? (e) => { e.stopPropagation(); setScorePeek({ sub: s, rect: e.currentTarget.getBoundingClientRect() }) } : undefined}
            onMouseLeave={hasPeek ? () => setScorePeek(null) : undefined}

          >
            {fmt(scoreVal)}
          </span>
        )}
        <span className="dj-col-genre" title={(useMoonlight ? s.mlGenre : s.genre) || '—'}>{(useMoonlight ? s.mlGenre : s.genre) || '—'}</span>
        <span className="dj-col-format" title={s.formatGear || '—'}>{s.formatGear || '—'}</span>
        {(useMoonlight || isBrowsing) && (
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
          {isBrowsing ? (
            <strong>DJ Pool</strong>
          ) : (
            <>
              <strong>{stage?.name ?? 'Stage'}</strong>
              <span className="dj-panel-slot-label">
                {activeSlot!.evening}{isSimultaneous ? ' · Silent Disco' : ` · ${activeSlot!.timeLabel}`}
              </span>
            </>
          )}
        </div>
        <button type="button" className="close-btn" onClick={onClose} aria-label="Close panel">
          ✕
        </button>
      </div>

      {/* Slot tray or browsing guidance */}
      {isBrowsing ? (
        <div className="dj-panel-browse-guidance">
          Click a slot or drag a DJ to assign
        </div>
      ) : (
        <SlotTray
          activeSlot={activeSlot!}
          stageSlotLabels={stage ? getSlotLabels(stage, activeSlot!.evening, activeSlot!.eventIndex ?? 0) : []}
          stageAssignments={assignments.filter(
            (a) =>
              a.stageId === activeSlot!.stageId &&
              a.evening === activeSlot!.evening &&
              (a.eventIndex ?? 0) === (activeSlot!.eventIndex ?? 0)
          )}
          submissions={submissions}
          stageColor={stage?.color}
          timeFormat={timeFormat}
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
            onAssign(activeSlot!.stageId, activeSlot!.evening, slotIndex, subNum, activeSlot!.eventIndex ?? 0)
          }
          onAssignSimultaneous={(pos, subNum) =>
            onAddSimultaneous(activeSlot!.stageId, activeSlot!.evening, pos, subNum)
          }
          onRemoveSequential={(slotIndex) =>
            onRemove(activeSlot!.stageId, activeSlot!.evening, slotIndex, activeSlot!.eventIndex ?? 0)
          }
          onRemoveSimultaneous={(pos) =>
            onRemoveSimultaneous(activeSlot!.stageId, activeSlot!.evening, pos)
          }
          onBlockSequential={(slotIndex) => {
            onAssignBlank(activeSlot!.stageId, activeSlot!.evening, slotIndex, 'Blocked', activeSlot!.eventIndex ?? 0)
            onClose()
          }}
          onSelectPosition={onPositionSelect}
          onSelectSlot={onSelectSlot}
          useMoonlight={useMoonlight}
          onPeekEnter={(sub, rect) => setScorePeek({ sub, rect })}
          onPeekLeave={() => setScorePeek(null)}
        />
      )}

      {/* Focus-stage selector and availability filter */}
      <div className="dj-panel-filters">
        <span className="filter-label">Preference:</span>
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
        <span className="filter-divider" />
        <button
          type="button"
          className={`day-btn${showAvailableOnly ? ' active' : ''}`}
          onClick={() => setShowAvailableOnly((prev) => !prev)}
          title="Show only DJs available on this day"
        >
          Available only
        </button>
      </div>

      {/* Column headers */}
      <div className="dj-panel-list-header">
        <span className="dj-col-name">DJ</span>
        {isBrowsing ? (
          <>
            <span className="dj-col-score">Score</span>
            <span className="dj-col-score dj-col-score--ml">ML</span>
          </>
        ) : (
          <span className="dj-col-score">{useMoonlight ? 'ML' : 'Score'}</span>
        )}
        <span className="dj-col-genre">Genre</span>
        <span className="dj-col-format">Format / Gear</span>
        {(useMoonlight || isBrowsing) && <span className="dj-col-vibefit">Vibefit</span>}
        <span className="dj-col-stages">Stage Prefs</span>
      </div>
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
      {scorePeek && (
        <div
          className="score-peek-tooltip"
          style={{
            position: 'fixed',
            bottom: `${window.innerHeight - scorePeek.rect.top + 6}px`,
            right: `${window.innerWidth - scorePeek.rect.right}px`,
          }}
        >
          {buildPeekContent(scorePeek.sub, useMoonlight)}
        </div>
      )}
    </div>
  )
}
