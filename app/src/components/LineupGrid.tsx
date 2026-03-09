import { useMemo } from 'react'
import type { Submission, Stage, SlotAssignment } from '../types.ts'
import { getSlotLabels, getEveningTimeAxis, getSimultaneousRowRange } from '../lineupUtils.ts'
import { useAppPreferences } from '../AppPreferencesContext.ts'
import { hexToTint } from '../stageColors.ts'

interface Props {
  submissions: Submission[]
  stages: Stage[]
  assignments: SlotAssignment[]
  selectedEvening: string
  onSelectEvening: (evening: string) => void
  onAssign: (stageId: string, evening: string, slotIndex: number, submissionNumber: string) => void
  onRemove: (stageId: string, evening: string, slotIndex: number) => void
  onAddSimultaneous: (stageId: string, evening: string, positionIndex: 1 | 2 | 3, submissionNumber: string) => void
  onRemoveSimultaneous: (stageId: string, evening: string, positionIndex: 1 | 2 | 3) => void
  onConfigureStages: () => void
  /** Called when a sequential slot cell is clicked; parent owns the active slot state. */
  onSlotClick: (slot: { stageId: string; evening: string; slotIndex: number; timeLabel: string }) => void
  /** Called when an "Add DJ" button on a simultaneous cell is clicked; parent owns the active slot state. */
  onSimultaneousClick: (slot: { stageId: string; evening: string; positionIndex: 1 | 2 | 3; timeLabel: string }) => void
  activeSlotKey: string | null // "stageId|evening|slotIndex" used to highlight
}

export function LineupGrid({
  submissions,
  stages,
  assignments,
  selectedEvening,
  onSelectEvening,
  onAssign,
  onRemove: _onRemove,
  onAddSimultaneous,
  onRemoveSimultaneous,
  onConfigureStages,
  onSlotClick,
  onSimultaneousClick,
  activeSlotKey,
}: Props) {
  const { hiddenNames } = useAppPreferences()

  function getDisplayName(submissionNumber: string): string {
    const idx = submissions.findIndex((s) => s.submissionNumber === submissionNumber)
    if (hiddenNames) return idx >= 0 ? `DJ #${idx + 1}` : submissionNumber
    return submissions[idx]?.djName ?? submissionNumber
  }

  const activeEvenings = useMemo(() => {
    const daySet = new Set<string>()
    for (const stage of stages) {
      for (const day of stage.activeDays) daySet.add(day)
    }
    return ['Thursday', 'Friday', 'Saturday', 'Sunday'].filter((d) => daySet.has(d))
  }, [stages])

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

  // Map stage id → hex color (or undefined) for quick lookup during render
  const stageColorMap = useMemo(() => {
    const map: Record<string, string | undefined> = {}
    for (const s of stages) map[s.id] = s.color
    return map
  }, [stages])

  function getAssignment(stageId: string, slotIndex: number): SlotAssignment | undefined {
    return assignments.find(
      (a) => a.stageId === stageId && a.evening === evening && a.slotIndex === slotIndex
    )
  }

  function getSimultaneousAssignments(stageId: string): SlotAssignment[] {
    // Pool exclusion is assignment-type-agnostic: assignments.map(a => a.submissionNumber) covers
    // both sequential (slotIndex) and simultaneous (positionIndex) assignments.
    return assignments
      .filter((a) => a.stageId === stageId && a.evening === evening && a.positionIndex != null)
      .sort((a, b) => (a.positionIndex ?? 0) - (b.positionIndex ?? 0))
  }

  function resolveSimultaneousDJs(stageId: string): { positionIndex: 1 | 2 | 3; djName: string }[] {
    return getSimultaneousAssignments(stageId).map((a) => ({
      positionIndex: a.positionIndex as 1 | 2 | 3,
      djName: getDisplayName(a.submissionNumber),
    }))
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
            onClick={() => onSelectEvening(day)}
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
            <div
              key={stage.id}
              className="grid-cell grid-header grid-stage-header"
              style={stageColorMap[stage.id] ? { borderBottom: `3px solid ${stageColorMap[stage.id]}` } : undefined}
            >
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
              {eveningStages.map((stage, stageIndex) => {
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
                    assignedDJs={resolveSimultaneousDJs(stage.id)}
                    nextPosition={nextSimultaneousPosition(stage.id)}
                    onAddClick={() => {
                      const pos = nextSimultaneousPosition(stage.id)
                      if (pos) onSimultaneousClick({ stageId: stage.id, evening, positionIndex: pos, timeLabel: '—' })
                    }}
                    onCellClick={() => {
                      const pos = nextSimultaneousPosition(stage.id) ?? 1
                      onSimultaneousClick({ stageId: stage.id, evening, positionIndex: pos, timeLabel: '—' })
                    }}
                    onDrop={(subNum) => {
                      const pos = nextSimultaneousPosition(stage.id)
                      if (pos) onAddSimultaneous(stage.id, evening, pos, subNum)
                    }}
                    onRemove={(positionIndex) => onRemoveSimultaneous(stage.id, evening, positionIndex)}
                    isActive={activeSlotKey === `${stage.id}|${evening}|simultaneous`}
                    gridRowStart={2}
                    gridRowEnd={3}
                    gridColumn={stageIndex + 2}
                    color={stageColorMap[stage.id]}
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
                {eveningStages.map((stage, stageIndex) => {
                  // Simultaneous stages use explicit grid placement to span their time range.
                  if (stage.stageType === 'simultaneous') {
                    const colIndex = stageIndex + 2 // 1-based CSS col (col 1 = time gutter)
                    const { gridRowStart, gridRowEnd } = getSimultaneousRowRange(stage, evening, timeAxis)
                    const startRowIdx = gridRowStart - 2 // convert to 0-based timeAxis index
                    const cellRow = rowIndex + 2 // 1-based CSS row for this timeAxis position

                    if (rowIndex === startRowIdx) {
                      return (
                        <SimultaneousCell
                          key={stage.id}
                          stageId={stage.id}
                          evening={evening}
                          assignedDJs={resolveSimultaneousDJs(stage.id)}
                          nextPosition={nextSimultaneousPosition(stage.id)}
                          onAddClick={() => {
                            const pos = nextSimultaneousPosition(stage.id)
                            if (pos) onSimultaneousClick({ stageId: stage.id, evening, positionIndex: pos, timeLabel: '—' })
                          }}
                          onCellClick={() => {
                            const pos = nextSimultaneousPosition(stage.id) ?? 1
                            onSimultaneousClick({ stageId: stage.id, evening, positionIndex: pos, timeLabel: '—' })
                          }}
                          onDrop={(subNum) => {
                            const pos = nextSimultaneousPosition(stage.id)
                            if (pos) onAddSimultaneous(stage.id, evening, pos, subNum)
                          }}
                          onRemove={(positionIndex) => onRemoveSimultaneous(stage.id, evening, positionIndex)}
                          isActive={activeSlotKey === `${stage.id}|${evening}|simultaneous`}
                          gridRowStart={gridRowStart}
                          gridRowEnd={gridRowEnd}
                          gridColumn={colIndex}
                          color={stageColorMap[stage.id]}
                        />
                      )
                    }
                    if (cellRow > gridRowStart && cellRow < gridRowEnd) {
                      // This row is visually covered by the SimultaneousCell above — skip.
                      return null
                    }
                    // This row is outside the stage's configured time range.
                    // Render an explicitly-placed placeholder so auto-placement of sequential
                    // cells in neighbouring columns stays correctly aligned.
                    return (
                      <div
                        key={`${stage.id}-${timeLabel}-off`}
                        className="grid-cell grid-slot grid-slot--out-of-range"
                        style={{ gridColumn: colIndex, gridRow: cellRow }}
                      />
                    )
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
                  const slotKey = `${stage.id}|${evening}|${slotIndex}`
                  const isActive = activeSlotKey === slotKey
                  const assignedDjName = assignment
                    ? getDisplayName(assignment.submissionNumber)
                    : null
                  const stageColor = stageColorMap[stage.id]
                  return assignment ? (
                    <button
                      key={`${stage.id}-${timeLabel}`}
                      type="button"
                      className={`grid-cell grid-slot grid-slot--occupied${isActive ? ' grid-slot--active' : ''}`}
                      style={stageColor ? { backgroundColor: hexToTint(stageColor, 0.25) } : undefined}
                      onClick={() =>
                        onSlotClick({ stageId: stage.id, evening, slotIndex, timeLabel })
                      }
                      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
                      onDrop={(e) => {
                        e.preventDefault()
                        const subNum = e.dataTransfer.getData('application/dj-submission-number')
                        if (subNum) onAssign(stage.id, evening, slotIndex, subNum)
                      }}
                    >
                      {assignedDjName}
                    </button>
                  ) : (
                    <button
                      key={`${stage.id}-${timeLabel}`}
                      type="button"
                      className={`grid-cell grid-slot grid-slot--empty${isActive ? ' grid-slot--active' : ''}`}
                      onClick={() =>
                        onSlotClick({ stageId: stage.id, evening, slotIndex, timeLabel })
                      }
                      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
                      onDrop={(e) => {
                        e.preventDefault()
                        const subNum = e.dataTransfer.getData('application/dj-submission-number')
                        if (subNum) onAssign(stage.id, evening, slotIndex, subNum)
                      }}
                    >
                      +
                    </button>
                  )
                })}
              </>
            ))}
        </div>
      )}

    </div>
  )
}

// ── SimultaneousCell ──────────────────────────────────────────────────────────

interface SimultaneousCellProps {
  stageId: string
  evening: string
  assignedDJs: { positionIndex: 1 | 2 | 3; djName: string }[]
  nextPosition: 1 | 2 | 3 | null
  onAddClick: () => void
  onRemove: (positionIndex: 1 | 2 | 3) => void
  onDrop: (submissionNumber: string) => void
  onCellClick?: () => void
  isActive?: boolean
  gridRowStart: number
  gridRowEnd: number
  /** 1-based CSS grid column (col 1 = time gutter, col 2 = first stage). */
  gridColumn: number
  color?: string
}

function SimultaneousCell({
  assignedDJs,
  nextPosition,
  onAddClick,
  onRemove,
  onDrop,
  onCellClick,
  isActive,
  gridRowStart,
  gridRowEnd,
  gridColumn,
  color,
}: SimultaneousCellProps) {
  return (
    <div
      className={`grid-cell grid-slot grid-slot--simultaneous${isActive ? ' grid-slot--active' : ''}`}
      style={{
        gridRow: `${gridRowStart} / ${gridRowEnd}`,
        gridColumn,
        ...(color ? { borderColor: color, backgroundColor: hexToTint(color, 0.12) } : {}),
      }}
      onClick={onCellClick}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = nextPosition === null ? 'none' : 'move' }}
      onDrop={(e) => {
        e.preventDefault()
        if (nextPosition === null) return
        const subNum = e.dataTransfer.getData('application/dj-submission-number')
        if (subNum) onDrop(subNum)
      }}
    >
      <div className="simultaneous-djs">
        {assignedDJs.map((a) => (
          <div key={a.positionIndex} className="simultaneous-dj-badge">
            <span className="simultaneous-dj-name">{a.djName}</span>
            <button
              type="button"
              className="simultaneous-dj-remove"
              title="Remove DJ"
              onClick={(e) => { e.stopPropagation(); onRemove(a.positionIndex as 1 | 2 | 3) }}
            >
              ×
            </button>
          </div>
        ))}
        {/* Show Add DJ button only when cap not reached */}
        {nextPosition !== null && (
          <button type="button" className="simultaneous-add-btn" onClick={(e) => { e.stopPropagation(); onAddClick() }}>
            + Add DJ
          </button>
        )}
      </div>
    </div>
  )
}
