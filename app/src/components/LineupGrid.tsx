import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Submission, Stage, SlotAssignment, SlotCoord } from '../types.ts'
import { isBlankAssignment, getBlankLabel } from '../types.ts'
import { getSlotLabels, getEveningTimeAxis, getSimultaneousRowRange, formatTimeLabel, getStageEventType, getProjectDayNames, getScheduleEventsForDay, timeToMinutes } from '../lineupUtils.ts'
import { useAppPreferences } from '../AppPreferencesContext.ts'
import { getReadableTextColor, hexToTint } from '../stageColors.ts'
import { buildPeekContent, hasAnyScore } from '../scorePeekUtils.tsx'
import { SequentialSlotCell } from './SequentialSlotCell.tsx'

interface SequentialSlotSpan {
  eventIndex: number
  slotIndex: number
  timeLabel: string
  startRowIndex: number
  endRowIndex: number
}

interface Props {
  submissions: Submission[]
  stages: Stage[]
  assignments: SlotAssignment[]
  projectStartDate?: string
  projectEndDate?: string
  selectedEvening: string
  onSelectEvening: (evening: string) => void
  onAssign: (stageId: string, evening: string, slotIndex: number, submissionNumber: string, eventIndex: number) => void
  onRemove: (stageId: string, evening: string, slotIndex: number, eventIndex: number) => void
  onAddSimultaneous: (stageId: string, evening: string, positionIndex: 1 | 2 | 3, submissionNumber: string, eventIndex: number) => void
  onRemoveSimultaneous: (stageId: string, evening: string, positionIndex: 1 | 2 | 3, eventIndex: number) => void
  onMoveAssignment: (from: SlotCoord, to: SlotCoord) => void
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
  projectStartDate,
  projectEndDate,
  selectedEvening,
  onSelectEvening,
  onAssign,
  onRemove,
  onAddSimultaneous,
  onRemoveSimultaneous,
  onMoveAssignment,
  onConfigureStages,
  onSlotClick,
  onSimultaneousClick,
  activeSlotKey,
}: Props) {
  const { hiddenNames, timeFormat } = useAppPreferences()
  const [dragOverKey, setDragOverKey] = useState<string | null>(null)
  const [gridPeek, setGridPeek] = useState<{ sub: Submission; rect: DOMRect; useMoonlight: boolean } | null>(null)

  function getDisplayName(submissionNumber: string): string {
    const idx = submissions.findIndex((s) => s.submissionNumber === submissionNumber)
    if (hiddenNames) return idx >= 0 ? `DJ #${idx + 1}` : submissionNumber
    return submissions[idx]?.djName ?? submissionNumber
  }

  const activeEvenings = useMemo(() => {
    const daySet = new Set<string>()
    for (const stage of stages) {
      for (const day of stage.activeDays ?? []) daySet.add(day)
    }
    const projectDays = getProjectDayNames(projectStartDate, projectEndDate)
    return projectDays.filter((d) => daySet.has(d))
  }, [projectEndDate, projectStartDate, stages])

  const evening = activeEvenings.includes(selectedEvening)
    ? selectedEvening
    : activeEvenings[0] ?? ''

  const eveningStages = useMemo(
    () => stages.filter((s) => (s.activeDays ?? []).includes(evening)),
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

  const timeAxisIndexByLabel = useMemo(() => {
    const map = new Map<string, number>()
    timeAxis.forEach((label, idx) => map.set(label, idx))
    return map
  }, [timeAxis])

  const axisSortableMinutes = useMemo(
    () => timeAxis.map((label) => {
      const m = timeToMinutes(label)
      return m < 360 ? m + 1440 : m
    }),
    [timeAxis]
  )

  const sequentialLayouts = useMemo(() => {
    const layouts = new Map<string, {
      hasTimedEvents: boolean
      spansByStartRow: Map<number, SequentialSlotSpan>
      coveredRows: Set<number>
    }>()

    function getAxisIndexAtOrAfter(label: string): number {
      const direct = timeAxisIndexByLabel.get(label)
      if (direct != null) return direct
      const mRaw = timeToMinutes(label)
      const target = mRaw < 360 ? mRaw + 1440 : mRaw
      const idx = axisSortableMinutes.findIndex((m) => m >= target)
      return idx === -1 ? timeAxis.length : idx
    }

    for (const stage of eveningStages) {
      if (stage.stageType === 'simultaneous') continue

      const timedEvents = getScheduleEventsForDay(stage.schedule, evening)
        .filter((event) => getStageEventType(event) !== 'special')
      const spansByStartRow = new Map<number, SequentialSlotSpan>()
      const coveredRows = new Set<number>()

      timedEvents.forEach((event, eventIndex) => {
        const labels = getSlotLabels(stage, evening, eventIndex)
        if (labels.length === 0) return

        labels.forEach((slotLabel, slotIndex) => {
          const startRowIndex = timeAxisIndexByLabel.get(slotLabel)
          if (startRowIndex == null) return

          const nextBoundary = labels[slotIndex + 1] ?? event.endTime ?? null
          let endRowIndex = nextBoundary ? getAxisIndexAtOrAfter(nextBoundary) : startRowIndex + 1
          if (endRowIndex <= startRowIndex) endRowIndex = startRowIndex + 1

          const span: SequentialSlotSpan = {
            eventIndex,
            slotIndex,
            timeLabel: slotLabel,
            startRowIndex,
            endRowIndex,
          }
          spansByStartRow.set(startRowIndex, span)
          for (let row = startRowIndex; row < endRowIndex; row++) {
            coveredRows.add(row)
          }
        })
      })

      layouts.set(stage.id, {
        hasTimedEvents: timedEvents.length > 0,
        spansByStartRow,
        coveredRows,
      })
    }

    return layouts
  }, [axisSortableMinutes, evening, eveningStages, timeAxis, timeAxisIndexByLabel])

  // Map stage id → hex color (or undefined) for quick lookup during render
  const stageColorMap = useMemo(() => {
    const map: Record<string, string | undefined> = {}
    for (const s of stages) map[s.id] = s.color
    return map
  }, [stages])

  function getTimedEvents(stage: Stage, day: string) {
    return getScheduleEventsForDay(stage.schedule, day).filter((event) => getStageEventType(event) !== 'special')
  }

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

  function resolveSimultaneousDJs(stageId: string, eventIndex: number): { positionIndex: 1 | 2 | 3; djName: string; submissionNumber: string; genre: string; isUnavailable: boolean; daysAvailable: string }[] {
    return getSimultaneousAssignments(stageId, eventIndex).map((a) => {
      if (isBlankAssignment(a)) {
        return { positionIndex: a.positionIndex as 1 | 2 | 3, djName: getBlankLabel(a), submissionNumber: '', genre: '', isUnavailable: false, daysAvailable: '' }
      }
      const sub = submissions.find((s) => s.submissionNumber === a.submissionNumber)
      const stageForDJ = stages.find((st) => st.id === stageId)
      return {
        positionIndex: a.positionIndex as 1 | 2 | 3,
        djName: getDisplayName(a.submissionNumber),
        submissionNumber: a.submissionNumber,
        genre: (stageForDJ?.useMoonlightScores ? sub?.mlGenre : sub?.genre) ?? '',
        isUnavailable: sub ? !sub.daysAvailable.toLowerCase().includes(evening.toLowerCase()) : false,
        daysAvailable: sub?.daysAvailable ?? '',
      }
    })
  }

  function getStageUseMoonlight(stageId: string): boolean {
    return stages.find((s) => s.id === stageId)?.useMoonlightScores ?? false
  }

  function handleStageHeaderClick(stage: Stage) {
    if (stage.stageType === 'simultaneous') {
      const dayEvents = getTimedEvents(stage, evening)
      const candidateEventIndices = dayEvents.length > 0
        ? dayEvents.map((_, idx) => idx)
        : [0]

      const targetEventIndex = candidateEventIndices.find((idx) => nextSimultaneousPosition(stage.id, idx) !== null) ?? candidateEventIndices[0]
      const positionIndex = nextSimultaneousPosition(stage.id, targetEventIndex) ?? 1

      onSimultaneousClick({
        stageId: stage.id,
        evening,
        positionIndex,
        timeLabel: '—',
        eventIndex: targetEventIndex,
      })
      return
    }

    let fallback: { eventIndex: number; slotIndex: number; timeLabel: string } | null = null
    const dayEvents = getScheduleEventsForDay(stage.schedule, evening)

    for (let eventIndex = 0; eventIndex < dayEvents.length; eventIndex++) {
      const labels = getSlotLabels(stage, evening, eventIndex)
      if (labels.length === 0) continue

      if (!fallback) {
        fallback = { eventIndex, slotIndex: 0, timeLabel: labels[0] }
      }

      for (let slotIndex = 0; slotIndex < labels.length; slotIndex++) {
        if (!getAssignment(stage.id, eventIndex, slotIndex)) {
          onSlotClick({ stageId: stage.id, evening, slotIndex, eventIndex, timeLabel: labels[slotIndex] })
          return
        }
      }
    }

    if (fallback) {
      onSlotClick({
        stageId: stage.id,
        evening,
        slotIndex: fallback.slotIndex,
        eventIndex: fallback.eventIndex,
        timeLabel: fallback.timeLabel,
      })
    }
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
              className="grid-cell grid-header grid-stage-header grid-stage-header--clickable"
              style={stageColorMap[stage.id] ? { borderBottom: `3px solid ${stageColorMap[stage.id]}` } : undefined}
              role="button"
              tabIndex={0}
              onClick={() => handleStageHeaderClick(stage)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleStageHeaderClick(stage)
                }
              }}
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
                .map((s) => Math.max(getTimedEvents(s, evening).length, 1))
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
                  const stageEvents = getTimedEvents(stage, evening)
                  if (evtIdx >= stageEvents.length && stageEvents.length > 0) {
                    return <div key={`${stage.id}-blank-${evtIdx}`} className="grid-cell grid-slot grid-slot--out-of-range" />
                  }
                  return (
                    <SimultaneousCell
                      key={`${stage.id}-${evtIdx}`}
                      stageId={stage.id}
                      evening={evening}
                      eventIndex={evtIdx}
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
                      onMoveAssignment={onMoveAssignment}
                      onRemove={(positionIndex) => onRemoveSimultaneous(stage.id, evening, positionIndex, evtIdx)}
                      onPeekEnter={(subNum, rect) => {
                        const sub = submissions.find((s) => s.submissionNumber === subNum)
                        if (sub && hasAnyScore(sub, getStageUseMoonlight(stage.id))) {
                          setGridPeek({ sub, rect, useMoonlight: getStageUseMoonlight(stage.id) })
                        }
                      }}
                      onPeekLeave={() => setGridPeek(null)}
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
                      const dayEvents = getTimedEvents(stage, evening)
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
                              eventIndex={ei}
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
                              onMoveAssignment={onMoveAssignment}
                              onPeekEnter={(subNum, rect) => {
                                const sub = submissions.find((s) => s.submissionNumber === subNum)
                                if (sub && hasAnyScore(sub, getStageUseMoonlight(stage.id))) {
                                  setGridPeek({ sub, rect, useMoonlight: getStageUseMoonlight(stage.id) })
                                }
                              }}
                              onPeekLeave={() => setGridPeek(null)}
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

                    // Sequential stage: render spanning slots so there are no fake in-slot gaps.
                    const layout = sequentialLayouts.get(stage.id)
                    if (!layout || !layout.hasTimedEvents) {
                      return (
                        <div
                          key={`${stage.id}-${timeLabel}`}
                          className="grid-cell grid-slot grid-slot--unconfigured"
                        />
                      )
                    }

                    const span = layout.spansByStartRow.get(rowIndex)
                    if (!span) {
                      if (layout.coveredRows.has(rowIndex)) return null
                      return (
                        <div
                          key={`${stage.id}-${timeLabel}`}
                          className="grid-cell grid-slot grid-slot--out-of-range"
                        />
                      )
                    }

                    const { eventIndex, slotIndex, timeLabel: slotTimeLabel, endRowIndex } = span

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
                    const useMoonlight = getStageUseMoonlight(stage.id)
                    const submission = assignment && !isBlankAssignment(assignment)
                      ? submissions.find((s) => s.submissionNumber === assignment.submissionNumber)
                      : undefined
                    const genre = (useMoonlight ? submission?.mlGenre : submission?.genre) ?? ''
                    const isUnavailable = submission
                      ? !submission.daysAvailable.toLowerCase().includes(evening.toLowerCase())
                      : false
                    const submissionNumber = assignment && !isBlankAssignment(assignment) ? assignment.submissionNumber : null
                    const isDragOver = dragOverKey === slotKey
                    const canPeek = !!submission && hasAnyScore(submission, useMoonlight)
                    const readableTextColor = stageColor ? getReadableTextColor(stageColor) : undefined
                    const slotStyle = !isBlank && stageColor
                      ? {
                        gridColumn: cssCol,
                        gridRow: `${rowIndex + 2} / ${endRowIndex + 2}`,
                        backgroundColor: hexToTint(stageColor, 0.25),
                        color: readableTextColor,
                        '--slot-genre-color': readableTextColor === '#0f172a' ? '#334155' : '#dbeafe',
                      } as CSSProperties
                      : {
                        gridColumn: cssCol,
                        gridRow: `${rowIndex + 2} / ${endRowIndex + 2}`,
                      }

                    return (
                      <SequentialSlotCell
                        key={slotKey}
                        slotKey={slotKey}
                        stageId={stage.id}
                        evening={evening}
                        eventIndex={eventIndex}
                        slotIndex={slotIndex}
                        assignedLabel={assignedLabel}
                        isBlank={isBlank}
                        isActive={isActive}
                        isDragOver={isDragOver}
                        isUnavailable={isUnavailable}
                        unavailableTitle={submission ? `Available: ${submission.daysAvailable}` : undefined}
                        genre={genre}
                        submissionNumber={submissionNumber}
                        style={slotStyle}
                        onSetDragOver={setDragOverKey}
                        onMoveAssignment={onMoveAssignment}
                        onAssignSubmission={(subNum) => onAssign(stage.id, evening, slotIndex, subNum, eventIndex)}
                        onSlotClick={() => onSlotClick({ stageId: stage.id, evening, slotIndex, eventIndex, timeLabel: slotTimeLabel })}
                        onRemove={!isBlank ? () => onRemove(stage.id, evening, slotIndex, eventIndex) : undefined}
                        onPeekEnter={canPeek && submission ? (rect) => setGridPeek({ sub: submission, rect, useMoonlight }) : undefined}
                        onPeekLeave={canPeek ? () => setGridPeek(null) : undefined}
                      />
                    )
                  })}
                </>
              )
            })}
        </div>
      )}

      {gridPeek && (
        <div
          className="score-peek-tooltip"
          style={{
            position: 'fixed',
            bottom: `${window.innerHeight - gridPeek.rect.top + 6}px`,
            right: `${window.innerWidth - gridPeek.rect.right}px`,
          }}
        >
          {buildPeekContent(gridPeek.sub, gridPeek.useMoonlight)}
        </div>
      )}
    </div>
  )
}

// ── SimultaneousCell ──────────────────────────────────────────────────────────

interface AssignedDJInfo {
  positionIndex: 1 | 2 | 3
  djName: string
  submissionNumber: string
  genre: string
  isUnavailable: boolean
  daysAvailable: string
}

interface SimultaneousCellProps {
  stageId: string
  evening: string
  eventIndex: number
  assignedDJs: AssignedDJInfo[]
  nextPosition: 1 | 2 | 3 | null
  onAddClick: () => void
  onRemove: (positionIndex: 1 | 2 | 3) => void
  onDrop: (submissionNumber: string) => void
  onMoveAssignment: (from: SlotCoord, to: SlotCoord) => void
  onCellClick?: () => void
  onPeekEnter?: (submissionNumber: string, rect: DOMRect) => void
  onPeekLeave?: () => void
  isActive?: boolean
  gridRowStart: number
  gridRowEnd: number
  /** 1-based CSS grid column (col 1 = time gutter, col 2 = first stage). */
  gridColumn: number
  color?: string
}

function SimultaneousCell({
  stageId,
  evening,
  eventIndex,
  assignedDJs,
  nextPosition,
  onAddClick,
  onRemove,
  onDrop,
  onMoveAssignment,
  onCellClick,
  onPeekEnter,
  onPeekLeave,
  isActive,
  gridRowStart,
  gridRowEnd,
  gridColumn,
  color,
}: SimultaneousCellProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const isFull = nextPosition === null
  return (
    <div
      className={`grid-cell grid-slot grid-slot--simultaneous${isActive ? ' grid-slot--active' : ''}${isDragOver ? ' grid-slot--drag-over' : ''}`}
      style={{
        gridRow: `${gridRowStart} / ${gridRowEnd}`,
        gridColumn,
        ...(color ? { borderColor: color, backgroundColor: hexToTint(color, 0.12) } : {}),
      }}
      onClick={onCellClick}
      onDragEnter={(e) => { e.preventDefault(); if (!isFull) setIsDragOver(true) }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false) }}
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = isFull ? 'none' : 'move'
        if (!isFull && !isDragOver) setIsDragOver(true)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragOver(false)
        if (isFull) return
        const slotKeyData = e.dataTransfer.getData('application/dj-slot-key')
        if (slotKeyData) {
          if (nextPosition === null) return
          onMoveAssignment(JSON.parse(slotKeyData) as SlotCoord, { stageId, evening, positionIndex: nextPosition, eventIndex })
          return
        }
        const subNum = e.dataTransfer.getData('application/dj-submission-number')
        if (subNum) onDrop(subNum)
      }}
    >
      <div className="simultaneous-djs">
        {assignedDJs.map((a) => (
          <div
            key={a.positionIndex}
            className={`simultaneous-dj-badge${a.isUnavailable ? ' simultaneous-dj-badge--availability-error' : ''}`}
            title={a.isUnavailable ? `Available: ${a.daysAvailable}` : undefined}
            draggable={!!a.submissionNumber}
            onMouseEnter={a.submissionNumber && onPeekEnter ? (e) => onPeekEnter(a.submissionNumber, e.currentTarget.getBoundingClientRect()) : undefined}
            onMouseLeave={a.submissionNumber && onPeekLeave ? () => onPeekLeave() : undefined}
            onDragStart={a.submissionNumber ? (e) => {
              e.stopPropagation()
              e.dataTransfer.setData('application/dj-slot-key', JSON.stringify({ stageId, evening, positionIndex: a.positionIndex, eventIndex }))
              e.dataTransfer.setData('application/dj-submission-number', a.submissionNumber)
              e.dataTransfer.effectAllowed = 'move'
            } : undefined}
          >
            <div className="simultaneous-dj-info">
              <span className="simultaneous-dj-name">{a.djName}</span>
              {a.genre && <span className="slot-genre">{a.genre}</span>}
            </div>
            <button
              type="button"
              className="simultaneous-dj-remove"
              title="Remove DJ"
              onClick={(e) => {
                e.stopPropagation()
                onPeekLeave?.()
                onRemove(a.positionIndex as 1 | 2 | 3)
              }}
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
