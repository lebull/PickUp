import { useState, useMemo } from 'react'
import type { Submission, Stage, SlotAssignment } from '../types.ts'
import { getSlotLabels, getEveningTimeAxis } from '../lineupUtils.ts'
import { SlotPicker } from './SlotPicker'

interface Props {
  submissions: Submission[]
  stages: Stage[]
  assignments: SlotAssignment[]
  onAssign: (stageId: string, evening: string, slotIndex: number, djName: string) => void
  onRemove: (stageId: string, evening: string, slotIndex: number) => void
  onAddSimultaneous: (stageId: string, evening: string, positionIndex: 1 | 2 | 3, djName: string) => void
  onRemoveSimultaneous: (stageId: string, evening: string, positionIndex: 1 | 2 | 3) => void
  onConfigureStages: () => void
}

interface ActiveSlot {
  stageId: string
  evening: string
  slotIndex: number
  timeLabel: string
}

/** Pending simultaneous assignment — which stage+evening+position we're filling. */
interface PendingSimultaneous {
  stageId: string
  evening: string
  positionIndex: 1 | 2 | 3
}

export function LineupGrid({
  submissions,
  stages,
  assignments,
  onAssign,
  onRemove,
  onAddSimultaneous,
  onRemoveSimultaneous,
  onConfigureStages,
}: Props) {
  const activeEvenings = useMemo(() => {
    const daySet = new Set<string>()
    for (const stage of stages) {
      for (const day of stage.activeDays) daySet.add(day)
    }
    return ['Thursday', 'Friday', 'Saturday', 'Sunday'].filter((d) => daySet.has(d))
  }, [stages])

  const [selectedEvening, setSelectedEvening] = useState<string>(() => activeEvenings[0] ?? '')
  const [activeSlot, setActiveSlot] = useState<ActiveSlot | null>(null)
  const [pendingSimultaneous, setPendingSimultaneous] = useState<PendingSimultaneous | null>(null)

  const evening = activeEvenings.includes(selectedEvening)
    ? selectedEvening
    : activeEvenings[0] ?? ''

  const eveningStages = useMemo(
    () => stages.filter((s) => s.activeDays.includes(evening)),
    [stages, evening]
  )

  // Unified time axis: sorted union of all slot times from sequential stages this evening.
  // Simultaneous stages contribute no labels (getSlotLabels returns [] for them) — intentional.
  const timeAxis = useMemo(
    () => getEveningTimeAxis(eveningStages, evening),
    [eveningStages, evening]
  )

  // Stages split by type for rendering decisions
  const simultaneousStages = useMemo(
    () => eveningStages.filter((s) => s.stageType === 'simultaneous'),
    [eveningStages]
  )

  function getAssignment(stageId: string, slotIndex: number): SlotAssignment | undefined {
    return assignments.find(
      (a) => a.stageId === stageId && a.evening === evening && a.slotIndex === slotIndex
    )
  }

  function getSimultaneousAssignments(stageId: string): SlotAssignment[] {
    // Pool exclusion is assignment-type-agnostic: assignments.map(a => a.djName) covers
    // both sequential (slotIndex) and simultaneous (positionIndex) assignments.
    return assignments
      .filter((a) => a.stageId === stageId && a.evening === evening && a.positionIndex != null)
      .sort((a, b) => (a.positionIndex ?? 0) - (b.positionIndex ?? 0))
  }

  function nextSimultaneousPosition(stageId: string): 1 | 2 | 3 | null {
    const existing = getSimultaneousAssignments(stageId)
    const usedPositions = new Set(existing.map((a) => a.positionIndex))
    for (const pos of [1, 2, 3] as const) {
      if (!usedPositions.has(pos)) return pos
    }
    return null // cap reached
  }

  if (stages.length === 0) {
    return (
      <div className="lineup-empty-state">
        <p>No stages configured yet.</p>
        <button type="button" className="btn-primary" onClick={onConfigureStages}>
          Configure Stages
        </button>
      </div>
    )
  }

  // Total columns: time-label gutter + all evening stages
  const totalColumns = eveningStages.length

  // Whether any sequential stage has times configured (determines if we render a time axis)
  const hasTimeAxis = timeAxis.length > 0
  // Whether we have any simultaneous stages to always render even with no time axis
  const hasSimultaneous = simultaneousStages.length > 0

  return (
    <div className="lineup-grid-container">
      <div className="evening-selector">
        {activeEvenings.map((day) => (
          <button
            key={day}
            type="button"
            className={`evening-btn${day === evening ? ' active' : ''}`}
            onClick={() => setSelectedEvening(day)}
          >
            {day}
          </button>
        ))}
        <button type="button" className="btn-secondary btn-small configure-btn" onClick={onConfigureStages}>
          ⚙ Stages
        </button>
      </div>

      {activeEvenings.length === 0 ? (
        <p className="lineup-notice">No stages are active on any evening. Configure stages to get started.</p>
      ) : eveningStages.length === 0 ? (
        <p className="lineup-notice">No stages are active on {evening}.</p>
      ) : (
        <div
          className="lineup-grid"
          style={{ gridTemplateColumns: `80px repeat(${totalColumns}, 1fr)` }}
        >
          {/* Header row */}
          <div className="grid-cell grid-header grid-corner" />
          {eveningStages.map((stage) => (
            <div key={stage.id} className="grid-cell grid-header grid-stage-header">
              {stage.name || <em>Unnamed Stage</em>}
              {stage.stageType === 'simultaneous' && (
                <span className="stage-type-badge">silent disco</span>
              )}
            </div>
          ))}

          {/*
            When there are only simultaneous stages (no time axis), render a single
            placeholder row so simultaneous cells still appear.
          */}
          {!hasTimeAxis && hasSimultaneous && (
            <>
              <div className="grid-cell grid-time-label">—</div>
              {eveningStages.map((stage) => {
                if ((stage.stageType ?? 'sequential') === 'sequential') {
                  return (
                    <div key={stage.id} className="grid-cell grid-slot grid-slot--unconfigured">
                      <span className="slot-config-hint">Set times for {evening}</span>
                    </div>
                  )
                }
                // Render simultaneous cell inline
                return (
                  <SimultaneousCell
                    key={stage.id}
                    stageId={stage.id}
                    evening={evening}
                    assignedDJs={getSimultaneousAssignments(stage.id)}
                    nextPosition={nextSimultaneousPosition(stage.id)}
                    onAddClick={() => {
                      const pos = nextSimultaneousPosition(stage.id)
                      if (pos) setPendingSimultaneous({ stageId: stage.id, evening, positionIndex: pos })
                    }}
                    onRemove={(positionIndex) => onRemoveSimultaneous(stage.id, evening, positionIndex)}
                    rowSpan={1}
                  />
                )
              })}
            </>
          )}

          {/* No times configured for any sequential stage this evening */}
          {!hasTimeAxis && !hasSimultaneous && (
            <>
              <div className="grid-cell grid-time-label">—</div>
              {eveningStages.map((stage) => (
                <div key={stage.id} className="grid-cell grid-slot grid-slot--unconfigured">
                  <span className="slot-config-hint">Set times for {evening}</span>
                </div>
              ))}
            </>
          )}

          {/* Normal time-axis rows */}
          {hasTimeAxis &&
            timeAxis.map((timeLabel, rowIndex) => (
              <>
                <div key={`time-${timeLabel}`} className="grid-cell grid-time-label">
                  {timeLabel}
                </div>
                {eveningStages.map((stage) => {
                  // Simultaneous stages span all rows — only render their cell on the first row
                  if (stage.stageType === 'simultaneous') {
                    if (rowIndex === 0) {
                      return (
                        <SimultaneousCell
                          key={stage.id}
                          stageId={stage.id}
                          evening={evening}
                          assignedDJs={getSimultaneousAssignments(stage.id)}
                          nextPosition={nextSimultaneousPosition(stage.id)}
                          onAddClick={() => {
                            const pos = nextSimultaneousPosition(stage.id)
                            if (pos) setPendingSimultaneous({ stageId: stage.id, evening, positionIndex: pos })
                          }}
                          onRemove={(positionIndex) => onRemoveSimultaneous(stage.id, evening, positionIndex)}
                          rowSpan={timeAxis.length}
                        />
                      )
                    }
                    // Remaining rows for this simultaneous column are covered by rowSpan
                    return null
                  }

                  // Sequential stage cell rendering
                  const stageLabels = getSlotLabels(stage, evening)
                  const slotIndex = stageLabels.indexOf(timeLabel)

                  if (stageLabels.length === 0) {
                    return (
                      <div
                        key={`${stage.id}-${timeLabel}`}
                        className="grid-cell grid-slot grid-slot--unconfigured"
                      />
                    )
                  }

                  if (slotIndex === -1) {
                    return (
                      <div
                        key={`${stage.id}-${timeLabel}`}
                        className="grid-cell grid-slot grid-slot--out-of-range"
                      />
                    )
                  }

                  const assignment = getAssignment(stage.id, slotIndex)
                  return assignment ? (
                    <button
                      key={`${stage.id}-${timeLabel}`}
                      type="button"
                      className="grid-cell grid-slot grid-slot--occupied"
                      onClick={() =>
                        setActiveSlot({ stageId: stage.id, evening, slotIndex, timeLabel })
                      }
                    >
                      {assignment.djName}
                    </button>
                  ) : (
                    <button
                      key={`${stage.id}-${timeLabel}`}
                      type="button"
                      className="grid-cell grid-slot grid-slot--empty"
                      onClick={() =>
                        setActiveSlot({ stageId: stage.id, evening, slotIndex, timeLabel })
                      }
                    >
                      +
                    </button>
                  )
                })}
              </>
            ))}
        </div>
      )}

      {/* Sequential slot picker */}
      {activeSlot && (
        <SlotPicker
          submissions={submissions}
          stages={stages}
          assignments={assignments}
          activeSlot={activeSlot}
          onAssign={onAssign}
          onRemove={onRemove}
          onClose={() => setActiveSlot(null)}
        />
      )}

      {/* Simultaneous DJ picker — reuses SlotPicker's available-DJ list via a thin adapter */}
      {pendingSimultaneous && (
        <SimultaneousPicker
          submissions={submissions}
          assignments={assignments}
          pending={pendingSimultaneous}
          onAssign={(djName) => {
            onAddSimultaneous(
              pendingSimultaneous.stageId,
              pendingSimultaneous.evening,
              pendingSimultaneous.positionIndex,
              djName
            )
            setPendingSimultaneous(null)
          }}
          onClose={() => setPendingSimultaneous(null)}
        />
      )}
    </div>
  )
}

// ── SimultaneousCell ──────────────────────────────────────────────────────────

interface SimultaneousCellProps {
  stageId: string
  evening: string
  assignedDJs: SlotAssignment[]
  nextPosition: 1 | 2 | 3 | null
  onAddClick: () => void
  onRemove: (positionIndex: 1 | 2 | 3) => void
  rowSpan: number
}

function SimultaneousCell({
  assignedDJs,
  nextPosition,
  onAddClick,
  onRemove,
  rowSpan,
}: SimultaneousCellProps) {
  return (
    <div
      className="grid-cell grid-slot grid-slot--simultaneous"
      style={{ gridRow: `span ${rowSpan}` }}
    >
      <div className="simultaneous-djs">
        {assignedDJs.map((a) => (
          <div key={a.positionIndex} className="simultaneous-dj-badge">
            <span className="simultaneous-dj-name">{a.djName}</span>
            <button
              type="button"
              className="simultaneous-dj-remove"
              title="Remove DJ"
              onClick={() => onRemove(a.positionIndex as 1 | 2 | 3)}
            >
              ×
            </button>
          </div>
        ))}
        {/* Show Add DJ button only when cap not reached */}
        {nextPosition !== null && (
          <button type="button" className="simultaneous-add-btn" onClick={onAddClick}>
            + Add DJ
          </button>
        )}
      </div>
    </div>
  )
}

// ── SimultaneousPicker ────────────────────────────────────────────────────────

interface SimultaneousPickerProps {
  submissions: Submission[]
  assignments: SlotAssignment[]
  pending: PendingSimultaneous
  onAssign: (djName: string) => void
  onClose: () => void
}

function SimultaneousPicker({
  submissions,
  assignments,
  pending,
  onAssign,
  onClose,
}: SimultaneousPickerProps) {
  // Pool exclusion is assignment-type-agnostic: covers both slotIndex and positionIndex assignments.
  const assignedGlobally = new Set(assignments.map((a) => a.djName))
  const available = submissions.filter(
    (s) =>
      !assignedGlobally.has(s.djName) &&
      s.daysAvailable.toLowerCase().includes(pending.evening.toLowerCase())
  )

  return (
    <div className="slot-picker-overlay" onClick={onClose}>
      <div className="slot-picker" onClick={(e) => e.stopPropagation()}>
        <div className="slot-picker-header">
          <span>Silent Disco — {pending.evening} · Position {pending.positionIndex}</span>
          <button type="button" className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="slot-picker-list">
          {available.length === 0 ? (
            <p className="slot-picker-empty">No available DJs for this evening.</p>
          ) : (
            available.map((s) => (
              <button
                key={s.djName}
                type="button"
                className="slot-picker-dj"
                onClick={() => onAssign(s.djName)}
              >
                {s.djName}
                {s.genre && <span className="slot-picker-genre">{s.genre}</span>}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
