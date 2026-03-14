import { useMemo } from 'react'
import type { Submission, Stage, SlotAssignment } from '../types.ts'
import { isBlankAssignment, getBlankLabel } from '../types.ts'
import { getSlotLabels, getEveningTimeAxis, getSimultaneousRowRange, formatTimeLabel, getStageEventSlots } from '../lineupUtils.ts'
import { useAppPreferences } from '../AppPreferencesContext.ts'
import { hexToTint } from '../stageColors.ts'

interface Props {
  submissions: Submission[]
  stages: Stage[]
  assignments: SlotAssignment[]
  selectedEvening: string
  onSelectEvening: (evening: string) => void
  onAssign: (stageId: string, evening: string, slotIndex: number, submissionNumber: string, eventIndex: number) => void
  onRemove: (stageId: string, evening: string, slotIndex: number, eventIndex: number) => void
  onAddSimultaneous: (stageId: string, evening: string, positionIndex: 1 | 2 | 3, submissionNumber: string, eventIndex: number) => void
  onRemoveSimultaneous: (stageId: string, evening: string, positionIndex: 1 | 2 | 3, eventIndex: number) => void
  onConfigureStages: () => void
  /** Called when a sequential slot cell is clicked; parent owns the active slot state. */
  onSlotClick: (slot: { stageId: string; evening: string; slotIndex: number; eventIndex: number; timeLabel: string }) => void
  /** Called when an "Add DJ" button on a simultaneous cell is clicked; parent owns the active slot state. */
  onSimultaneousClick: (slot: { stageId: string; evening: string; positionIndex: 1 | 2 | 3; timeLabel: string; eventIndex: number }) => void
  activeSlotKey: string | null // "stageId|evening|eventIndex|slotIndex" used to highlight
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
  const { hiddenNames, timeFormat } = useAppPreferences()

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

  // Unified time axis: union of all slot times from all sequential stage events this evening.
  const timeAxis = useMemo(
    () => getEveningTimeAxis(eveningStages, evening),
    [eveningStages, evening]
  )

  // One column per stage — events are stacked within the column, not split across columns.
  const stageColumns = useMemo(
    () => eveningStages.map((stage) => ({ stage })),
    [eveningStages]
  )

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

  function getAssignment(stageId: string, eventIndex: number, slotIndex: number): SlotAssignment | undefined {
    return assignments.find(
      (a) =>
        a.stageId === stageId &&
        a.evening === evening &&
        (a.eventIndex ?? 0) === eventIndex &&
        a.slotIndex === slotIndex
    )
  }

  function getSimultaneousAssignments(stageId: string, eventIndex: number): SlotAssignment[] {
    return assignments
      .filter((a) => a.stageId === stageId && a.evening === evening && a.positionIndex != null && (a.eventIndex ?? 0) === eventIndex)
      .sort((a, b) => (a.positionIndex ?? 0) - (b.positionIndex ?? 0))
  }

  function resolveSimultaneousDJs(stageId: string, eventIndex: number): { positionIndex: 1 | 2 | 3; djName: string }[] {
    return getSimultaneousAssignments(stageId, eventIndex).map((a) => ({
      positionIndex: a.positionIndex as 1 | 2 | 3,
      djName: isBlankAssignment(a) ? getBlankLabel(a) : getDisplayName(a.submissionNumber),
    }))
  }

  function nextSimultaneousPosition(stageId: string, eventIndex: number): 1 | 2 | 3 | null {
    const existing = getSimultaneousAssignments(stageId, eventIndex)
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

  // Total columns: time-label gutter + all stage-event columns
  const totalColumns = stageColumns.length

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
          {/* Column header row */}
          <div className="grid-cell grid-header grid-corner" />
          {stageColumns.map(({ stage }) => (
            <div
              key={`header-${stage.id}`}
              className="grid-cell grid-header grid-stage-header"
              style={stageColorMap[stage.id] ? { borderBottom: `3px solid ${stageColorMap[stage.id]}` } : undefined}
            >
              {stage.name || <em>Unnamed Stage</em>}
              {stage.stageType === 'simultaneous' && (
                <span className="stage-type-badge">*</span>
              )}
            </div>
          ))}

          {/*
            When there are only simultaneous stages (no time axis), render one row per event
            so multi-event simultaneous stages each get their own cell.
          */}
          {!hasTimeAxis && hasSimultaneous && (() => {
            const maxEvents = Math.max(
              ...eveningStages
                .filter((s) => s.stageType === 'simultaneous')
                .map((s) => Math.max((s.schedule?.[evening] ?? []).length, 1))
            )
            return Array.from({ length: maxEvents }, (_, evtIdx) => (
              <>
                <div key={`time-noaxis-${evtIdx}`} className="grid-cell grid-time-label">—</div>
                {stageColumns.map(({ stage }, colIdx) => {
                  if (stage.stageType !== 'simultaneous') {
                    return evtIdx === 0 ? (
                      <div key={`${stage.id}-unconf`} className="grid-cell grid-slot grid-slot--unconfigured">
                        <span className="slot-config-hint">Set times for {evening}</span>
                      </div>
                    ) : <div key={`${stage.id}-blank-${evtIdx}`} className="grid-cell grid-slot grid-slot--out-of-range" />
                  }
                  const stageEvents = stage.schedule?.[evening] ?? []
                  if (evtIdx >= stageEvents.length && stageEvents.length > 0) {
                    return <div key={`${stage.id}-blank-${evtIdx}`} className="grid-cell grid-slot grid-slot--out-of-range" />
                  }
                  return (
                    <SimultaneousCell
                      key={`${stage.id}-${evtIdx}`}
                      stageId={stage.id}
                      evening={evening}
                      assignedDJs={resolveSimultaneousDJs(stage.id, evtIdx)}
                      nextPosition={nextSimultaneousPosition(stage.id, evtIdx)}
                      onAddClick={() => {
                        const pos = nextSimultaneousPosition(stage.id, evtIdx)
                        if (pos) onSimultaneousClick({ stageId: stage.id, evening, positionIndex: pos, timeLabel: '—', eventIndex: evtIdx })
                      }}
                      onCellClick={() => {
                        const pos = nextSimultaneousPosition(stage.id, evtIdx) ?? 1
                        onSimultaneousClick({ stageId: stage.id, evening, positionIndex: pos, timeLabel: '—', eventIndex: evtIdx })
                      }}
                      onDrop={(subNum) => {
                        const pos = nextSimultaneousPosition(stage.id, evtIdx)
                        if (pos) onAddSimultaneous(stage.id, evening, pos, subNum, evtIdx)
                      }}
                      onRemove={(positionIndex) => onRemoveSimultaneous(stage.id, evening, positionIndex, evtIdx)}
                      isActive={activeSlotKey === `${stage.id}|${evening}|${evtIdx}|simultaneous`}
                      gridRowStart={evtIdx + 2}
                      gridRowEnd={evtIdx + 3}
                      gridColumn={colIdx + 2}
                      color={stageColorMap[stage.id]}
                    />
                  )
                })}
              </>
            ))
          })()}

          {/* No times configured for any sequential stage this evening */}
          {!hasTimeAxis && !hasSimultaneous && (
            <>
              <div className="grid-cell grid-time-label">—</div>
              {stageColumns.map(({ stage }) => (
                <div key={`${stage.id}-unconf`} className="grid-cell grid-slot grid-slot--unconfigured">
                  <span className="slot-config-hint">Set times for {evening}</span>
                </div>
              ))}
            </>
          )}

          {/* Normal time-axis rows */}
          {hasTimeAxis &&
            timeAxis.map((timeLabel, rowIndex) => {
              const cellRow = rowIndex + 2 // header = row 1, first data row = row 2
              return (
                <>
                  <div key={`time-${timeLabel}`} className="grid-cell grid-time-label">
                    {formatTimeLabel(timeLabel, timeFormat)}
                  </div>
                  {stageColumns.map(({ stage }, colIdx) => {
                    const cssCol = colIdx + 2

                    // Simultaneous stages: each event spans its own time range within the column.
                    if (stage.stageType === 'simultaneous') {
                      const dayEvents = stage.schedule?.[evening] ?? []
                      const eventCount = Math.max(dayEvents.length, 1)
                      for (let ei = 0; ei < eventCount; ei++) {
                        const { gridRowStart, gridRowEnd } = getSimultaneousRowRange(stage, evening, timeAxis, ei)
                        const startRowIdx = gridRowStart - 2
                        if (rowIndex === startRowIdx) {
                          return (
                            <SimultaneousCell
                              key={`${stage.id}-${ei}`}
                              stageId={stage.id}
                              evening={evening}
                              assignedDJs={resolveSimultaneousDJs(stage.id, ei)}
                              nextPosition={nextSimultaneousPosition(stage.id, ei)}
                              onAddClick={() => {
                                const pos = nextSimultaneousPosition(stage.id, ei)
                                if (pos) onSimultaneousClick({ stageId: stage.id, evening, positionIndex: pos, timeLabel: '—', eventIndex: ei })
                              }}
                              onCellClick={() => {
                                const pos = nextSimultaneousPosition(stage.id, ei) ?? 1
                                onSimultaneousClick({ stageId: stage.id, evening, positionIndex: pos, timeLabel: '—', eventIndex: ei })
                              }}
                              onDrop={(subNum) => {
                                const pos = nextSimultaneousPosition(stage.id, ei)
                                if (pos) onAddSimultaneous(stage.id, evening, pos, subNum, ei)
                              }}
                              onRemove={(positionIndex) => onRemoveSimultaneous(stage.id, evening, positionIndex, ei)}
                              isActive={activeSlotKey === `${stage.id}|${evening}|${ei}|simultaneous`}
                              gridRowStart={gridRowStart}
                              gridRowEnd={gridRowEnd}
                              gridColumn={cssCol}
                              color={stageColorMap[stage.id]}
                            />
                          )
                        }
                        if (cellRow > gridRowStart && cellRow < gridRowEnd) return null
                      }
                      return (
                        <div
                          key={`${stage.id}-${timeLabel}-off`}
                          className="grid-cell grid-slot grid-slot--out-of-range"
                          style={{ gridColumn: cssCol, gridRow: cellRow }}
                        />
                      )
                    }

                    // Sequential stage: find which event (if any) owns this time label.
                    const dayEvents = stage.schedule?.[evening] ?? []
                    let eventIndex = -1
                    let slotIndex = -1
                    for (let ei = 0; ei < dayEvents.length; ei++) {
                      const labels = getSlotLabels(stage, evening, ei)
                      const si = labels.indexOf(timeLabel)
                      if (si !== -1) { eventIndex = ei; slotIndex = si; break }
                    }

                    if (dayEvents.length === 0) {
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

                    const assignment = getAssignment(stage.id, eventIndex, slotIndex)
                    const slotKey = `${stage.id}|${evening}|${eventIndex}|${slotIndex}`
                    const isActive = activeSlotKey === slotKey
                    const isBlank = assignment ? isBlankAssignment(assignment) : false
                    const assignedLabel = assignment
                      ? isBlankAssignment(assignment)
                        ? getBlankLabel(assignment)
                        : getDisplayName(assignment.submissionNumber)
                      : null
                    const stageColor = stageColorMap[stage.id]
                    return assignment ? (
                      <button
                        key={`${stage.id}-${timeLabel}`}
                        type="button"
                        className={`grid-cell grid-slot ${isBlank ? 'grid-slot--blank' : 'grid-slot--occupied'}${isActive ? ' grid-slot--active' : ''}`}
                        style={!isBlank && stageColor ? { backgroundColor: hexToTint(stageColor, 0.25) } : undefined}
                        onClick={() =>
                          onSlotClick({ stageId: stage.id, evening, slotIndex, eventIndex, timeLabel })
                        }
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
                        onDrop={(e) => {
                          e.preventDefault()
                          const subNum = e.dataTransfer.getData('application/dj-submission-number')
                          if (subNum) onAssign(stage.id, evening, slotIndex, subNum, eventIndex)
                        }}
                      >
                        {assignedLabel}
                      </button>
                    ) : (
                      <button
                        key={`${stage.id}-${timeLabel}`}
                        type="button"
                        className={`grid-cell grid-slot grid-slot--empty${isActive ? ' grid-slot--active' : ''}`}
                        onClick={() =>
                          onSlotClick({ stageId: stage.id, evening, slotIndex, eventIndex, timeLabel })
                        }
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
                        onDrop={(e) => {
                          e.preventDefault()
                          const subNum = e.dataTransfer.getData('application/dj-submission-number')
                          if (subNum) onAssign(stage.id, evening, slotIndex, subNum, eventIndex)
                        }}
                      >
                        +
                      </button>
                    )
                  })}
                </>
              )
            })}
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
