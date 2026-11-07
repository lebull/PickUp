import { Fragment, useMemo, useState } from 'react'
import type { Submission, Stage, SlotAssignment, SlotCoord } from '../../../types.ts'
import { isBlankAssignment, getBlankLabel } from '../../../types.ts'
import { formatTimeLabel, timeToMinutes, getStageEventType, getProjectDayNames, getScheduleEventsForDay, getStageEventSlots } from '../../../lineupUtils.ts'
import { useAppPreferences } from '../../../shared/context/AppPreferencesContext.ts'
import { hexToTint } from '../../../stageColors.ts'
import type { ActiveSlot } from './DJSelectionPanel.tsx'
import { SequentialSlotCell } from '../../../shared/components/SequentialSlotCell.tsx'
import { buildPeekContent, hasAnyScore } from '../../../scorePeekUtils.tsx'
import { getPeekTooltipStyle } from '../../../shared/peekTooltipPosition.ts'

interface Props {
  submissions: Submission[]
  stages: Stage[]
  assignments: SlotAssignment[]
  projectStartDate?: string
  projectEndDate?: string
  activeStageId: string | null
  onSlotClick: (slot: ActiveSlot) => void
  onAssign: (stageId: string, evening: string, slotIndex: number, submissionNumber: string, eventIndex: number) => void
  onRemove: (stageId: string, evening: string, slotIndex: number, eventIndex: number) => void
  onAddSimultaneous: (stageId: string, evening: string, positionIndex: 1 | 2 | 3, submissionNumber: string, eventIndex: number) => void
  onRemoveSimultaneous: (stageId: string, evening: string, positionIndex: 1 | 2 | 3, eventIndex: number) => void
  onMoveAssignment: (from: SlotCoord, to: SlotCoord) => void
  activeSlotKey: string | null
}

export function StageGrid({
  submissions,
  stages,
  assignments,
  projectStartDate,
  projectEndDate,
  activeStageId,
  onSlotClick,
  onAssign,
  onRemove,
  onAddSimultaneous,
  onRemoveSimultaneous,
  onMoveAssignment,
  activeSlotKey,
}: Props) {
  const { hiddenNames, timeFormat } = useAppPreferences()
  const [dragOverKey, setDragOverKey] = useState<string | null>(null)
  const [gridPeek, setGridPeek] = useState<{ sub: Submission; rect: DOMRect; useMoonlight: boolean } | null>(null)

  const stage = stages.find((s) => s.id === activeStageId)
  const isSimultaneous = stage?.stageType === 'simultaneous'
  const useMoonlight = stage?.useMoonlightScores ?? false

  function getTimedEvents(day: string) {
    return getScheduleEventsForDay(stage?.schedule, day).filter((event) => getStageEventType(event) !== 'special')
  }

  function getDisplayName(submissionNumber: string): string {
    const idx = submissions.findIndex((s) => s.submissionNumber === submissionNumber)
    if (hiddenNames) return idx >= 0 ? `DJ #${idx + 1}` : submissionNumber
    return submissions[idx]?.djName ?? submissionNumber
  }

  // Active days for this stage in convention order
  const activeDays = useMemo(() => {
    if (!stage) return []
    const projectDays = getProjectDayNames(projectStartDate, projectEndDate)
    return projectDays.filter((d) => (stage.activeDays ?? []).includes(d))
  }, [projectEndDate, projectStartDate, stage])

  // Unified sequential slot rows across all active days (union by real slot starts).
  const slotRows = useMemo(() => {
    if (!stage || isSimultaneous) return []
    const allLabels = new Set<string>()
    for (const day of activeDays) {
      for (const slot of getStageEventSlots(stage, day)) {
        allLabels.add(slot.timeLabel)
      }
    }
    return [...allLabels].sort((a, b) => {
      const am = timeToMinutes(a)
      const bm = timeToMinutes(b)
      // Evening normalization: times before 06:00 are treated as next-day
      const as2 = am < 360 ? am + 1440 : am
      const bs2 = bm < 360 ? bm + 1440 : bm
      return as2 - bs2
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage?.id, activeDays, isSimultaneous])

  function getAssignment(evening: string, eventIndex: number, slotIndex: number): SlotAssignment | undefined {
    return assignments.find(
      (a) =>
        a.stageId === activeStageId &&
        a.evening === evening &&
        (a.eventIndex ?? 0) === eventIndex &&
        a.slotIndex === slotIndex
    )
  }

  function getSimultaneousAssignments(evening: string, eventIndex: number): SlotAssignment[] {
    return assignments
      .filter(
        (a) =>
          a.stageId === activeStageId &&
          a.evening === evening &&
          a.positionIndex != null &&
          (a.eventIndex ?? 0) === eventIndex
      )
      .sort((a, b) => (a.positionIndex ?? 0) - (b.positionIndex ?? 0))
  }

  function handleDayHeaderClick(day: string) {
    if (!stage) return

    if (isSimultaneous) {
      const dayEvents = getTimedEvents(day)
      const eventCount = Math.max(dayEvents.length, 1)
      const candidateEventIndices = Array.from({ length: eventCount }, (_, idx) => idx)
      const targetEventIndex = candidateEventIndices.find((idx) => {
        const usedPositions = new Set(
          getSimultaneousAssignments(day, idx).map((a) => a.positionIndex as 1 | 2 | 3)
        )
        return ([1, 2, 3] as const).some((p) => !usedPositions.has(p))
      }) ?? candidateEventIndices[0]

      const usedPositions = new Set(
        getSimultaneousAssignments(day, targetEventIndex).map((a) => a.positionIndex as 1 | 2 | 3)
      )
      const positionIndex = ([1, 2, 3] as const).find((p) => !usedPositions.has(p)) ?? 1
      const dayEvent = dayEvents[targetEventIndex]
      const eventTimeLabel = dayEvent?.startTime ? formatTimeLabel(dayEvent.startTime, timeFormat) : '—'

      onSlotClick({
        stageId: stage.id,
        evening: day,
        positionIndex,
        timeLabel: eventTimeLabel,
        eventIndex: targetEventIndex,
      })
      return
    }

    const daySlots = getStageEventSlots(stage, day)
    if (daySlots.length === 0) return

    const firstEmpty = daySlots.find(
      ({ eventIndex, slotIndex }) => !getAssignment(day, eventIndex, slotIndex)
    )
    const target = firstEmpty ?? daySlots[0]
    onSlotClick({
      stageId: stage.id,
      evening: day,
      slotIndex: target.slotIndex,
      eventIndex: target.eventIndex,
      timeLabel: target.timeLabel,
    })
  }

  if (!stage) {
    return (
      <div className="stage-grid-container">
        <p className="lineup-notice">Select a stage to view its schedule.</p>
      </div>
    )
  }

  if (activeDays.length === 0) {
    return (
      <div className="stage-grid-container">
        <p className="lineup-notice">This stage has no active days configured.</p>
      </div>
    )
  }

  const stageColor = stage.color

  // For simultaneous stages: compute event rows to render (one per event index)
  const simEventCount = isSimultaneous
    ? Math.max(1, ...activeDays.map((day) => getTimedEvents(day).length))
    : 0
  const simEventIndices = isSimultaneous ? Array.from({ length: simEventCount }, (_, i) => i) : []

  return (
    <div className="stage-grid-container">
      <div
        className="lineup-grid"
        style={{ gridTemplateColumns: `80px repeat(${activeDays.length}, 1fr)` }}
      >
        {/* Corner */}
        <div className="grid-cell grid-header grid-corner" />

        {/* Day column headers */}
        {activeDays.map((day) => (
          <div
            key={`header-${day}`}
            className="grid-cell grid-header grid-stage-header grid-stage-header--clickable"
            style={stageColor ? { borderBottom: `3px solid ${stageColor}` } : undefined}
            role="button"
            tabIndex={0}
            onClick={() => handleDayHeaderClick(day)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleDayHeaderClick(day)
              }
            }}
          >
            {day}
          </div>
        ))}

        {/* Body */}
        {isSimultaneous ? simEventIndices.map((ei) => {
          // Row time label: use the first active day that has this event
          const firstDayWithEvent = activeDays.find((d) => getTimedEvents(d).length > ei)
          const firstEvent = firstDayWithEvent ? getTimedEvents(firstDayWithEvent)[ei] : undefined
          const rowLabel = firstEvent?.startTime
            ? formatTimeLabel(firstEvent.startTime, timeFormat)
            : `Set ${ei + 1}`
          return (
            <Fragment key={`sim-row-${ei}`}>
              <div className="grid-cell grid-time-label">{rowLabel}</div>
              {activeDays.map((day) => {
                const dayEvents = getTimedEvents(day)
                if (ei >= dayEvents.length && dayEvents.length > 0) {
                  return <div key={`sim-${day}-oor-${ei}`} className="grid-cell grid-slot grid-slot--out-of-range" />
                }
                const simAssignments = getSimultaneousAssignments(day, ei)
                const simSlotKey = `${stage.id}|${day}|${ei}|simultaneous`
                const isActive = activeSlotKey === simSlotKey
                const dayEvent = dayEvents[ei]
                const eventTimeLabel = dayEvent?.startTime ? formatTimeLabel(dayEvent.startTime, timeFormat) : '—'
                const usedPositions = new Set(simAssignments.map((a) => a.positionIndex as 1 | 2 | 3))
                const nextSimPos = ([1, 2, 3] as const).find((p) => !usedPositions.has(p)) ?? null
                const isSimFull = nextSimPos === null
                const isSimDragOver = dragOverKey === simSlotKey
                return (
                  <div
                    key={`sim-${day}-${ei}`}
                    className={`grid-cell grid-slot grid-slot--simultaneous${isActive ? ' grid-slot--active' : ''}${isSimDragOver ? ' grid-slot--drag-over' : ''}`}
                    onDragEnter={(e) => { e.preventDefault(); if (!isSimFull) setDragOverKey(simSlotKey) }}
                    onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverKey(null) }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.dataTransfer.dropEffect = isSimFull ? 'none' : 'move'
                      if (!isSimFull && dragOverKey !== simSlotKey) setDragOverKey(simSlotKey)
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      setDragOverKey(null)
                      if (isSimFull) return
                      const slotKeyData = e.dataTransfer.getData('application/dj-slot-key')
                      if (slotKeyData) {
                        if (nextSimPos === null) return
                        onMoveAssignment(JSON.parse(slotKeyData) as SlotCoord, { stageId: stage.id, evening: day, positionIndex: nextSimPos, eventIndex: ei })
                        return
                      }
                      const subNum = e.dataTransfer.getData('application/dj-submission-number')
                      if (subNum && nextSimPos) onAddSimultaneous(stage.id, day, nextSimPos, subNum, ei)
                    }}
                  >
                    <div className="simultaneous-djs">
                      {simAssignments.map((a) => {
                        const subInfo = !isBlankAssignment(a) ? submissions.find((s) => s.submissionNumber === a.submissionNumber) : undefined
                        const badgeGenre = subInfo?.genre ?? ''
                        const badgeUnavail = subInfo ? !subInfo.daysAvailable.toLowerCase().includes(day.toLowerCase()) : false
                        return (
                          <div
                            key={a.positionIndex}
                            className={`simultaneous-dj-badge${badgeUnavail ? ' simultaneous-dj-badge--availability-error' : ''}`}
                            style={stageColor ? { borderColor: stageColor, backgroundColor: hexToTint(stageColor, 0.1) } : undefined}
                            title={badgeUnavail ? `Available: ${subInfo!.daysAvailable}` : undefined}
                            draggable={!isBlankAssignment(a)}
                            onMouseEnter={!isBlankAssignment(a) && subInfo && hasAnyScore(subInfo, useMoonlight) ? (e) => {
                              setGridPeek({ sub: subInfo, rect: e.currentTarget.getBoundingClientRect(), useMoonlight })
                            } : undefined}
                            onMouseLeave={!isBlankAssignment(a) && subInfo && hasAnyScore(subInfo, useMoonlight) ? () => setGridPeek(null) : undefined}
                            onDragStart={!isBlankAssignment(a) ? (e) => {
                              e.stopPropagation()
                              e.dataTransfer.setData('application/dj-slot-key', JSON.stringify({ stageId: stage.id, evening: day, positionIndex: a.positionIndex, eventIndex: ei }))
                              e.dataTransfer.setData('application/dj-submission-number', a.submissionNumber)
                              e.dataTransfer.effectAllowed = 'move'
                            } : undefined}
                          >
                            <div className="simultaneous-dj-info">
                              <span className="simultaneous-dj-name">
                                {isBlankAssignment(a) ? getBlankLabel(a) : getDisplayName(a.submissionNumber)}
                              </span>
                              {badgeGenre && <span className="slot-genre">{badgeGenre}</span>}
                            </div>
                            <button
                              type="button"
                              className="simultaneous-dj-remove"
                              onClick={() => {
                                setGridPeek(null)
                                onRemoveSimultaneous(stage.id, day, a.positionIndex as 1 | 2 | 3, ei)
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        )
                      })}
                      {simAssignments.length < 3 && (
                        <button
                          type="button"
                          className="simultaneous-add-btn"
                          onClick={() => {
                            const usedPos = new Set(simAssignments.map((a) => a.positionIndex as 1 | 2 | 3))
                            const nextPos = ([1, 2, 3] as const).find((p) => !usedPos.has(p))
                            if (nextPos) onSlotClick({ stageId: stage.id, evening: day, positionIndex: nextPos, timeLabel: eventTimeLabel, eventIndex: ei })
                          }}
                        >
                          + Add DJ
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </Fragment>
          )
        })
        : slotRows.length === 0 ? (
          // No slot times configured
          <Fragment key="unconf-row">
            <div className="grid-cell grid-time-label">—</div>
            {activeDays.map((day) => (
              <div key={`unconf-${day}`} className="grid-cell grid-slot grid-slot--unconfigured">
                <span className="slot-config-hint">Set times for {day}</span>
              </div>
            ))}
          </Fragment>
        ) : (
          // Sequential: one row per time slot
          slotRows.map((label) => (
            <Fragment key={`time-row-${label}`}>
              <div className="grid-cell grid-time-label">
                {formatTimeLabel(label, timeFormat)}
              </div>
              {activeDays.map((day) => {
                // Find the actual event/slot for this day that matches this time label.
                const matchedSlot = getStageEventSlots(stage, day).find((slot) => slot.timeLabel === label)
                if (!matchedSlot) {
                  return (
                    <div
                      key={`${day}-oor-${label}`}
                      className="grid-cell grid-slot grid-slot--out-of-range"
                    />
                  )
                }

                const { eventIndex, slotIndex } = matchedSlot
                const slotKey = `${stage.id}|${day}|${eventIndex}|${slotIndex}`
                const isActive = activeSlotKey === slotKey

                const assignment = getAssignment(day, eventIndex, slotIndex)
                const isOccupied = !!assignment && !isBlankAssignment(assignment)
                const isBlankSlot = !!assignment && isBlankAssignment(assignment)
                const assignedLabel = assignment
                  ? isBlankAssignment(assignment)
                    ? getBlankLabel(assignment)
                    : getDisplayName(assignment.submissionNumber)
                  : null
                const sub = isOccupied && assignment && !isBlankAssignment(assignment)
                  ? submissions.find((s) => s.submissionNumber === assignment.submissionNumber)
                  : undefined
                const genre = sub?.genre ?? ''
                const isUnavailable = sub ? !sub.daysAvailable.toLowerCase().includes(day.toLowerCase()) : false
                const submissionNum = isOccupied && assignment && !isBlankAssignment(assignment) ? assignment.submissionNumber : null
                const isDragOver = dragOverKey === slotKey
                const canPeek = !!sub && hasAnyScore(sub, useMoonlight)

                return (
                  <SequentialSlotCell
                    key={slotKey}
                    slotKey={slotKey}
                    stageId={stage.id}
                    evening={day}
                    eventIndex={eventIndex}
                    slotIndex={slotIndex}
                    assignedLabel={assignedLabel}
                    isBlank={isBlankSlot}
                    isActive={isActive}
                    isDragOver={isDragOver}
                    isUnavailable={isUnavailable}
                    unavailableTitle={sub ? `Available: ${sub.daysAvailable}` : undefined}
                    genre={genre}
                    submissionNumber={submissionNum}
                    style={isOccupied && stageColor ? { backgroundColor: hexToTint(stageColor, 0.25) } : undefined}
                    onSetDragOver={setDragOverKey}
                    onMoveAssignment={onMoveAssignment}
                    onAssignSubmission={(subNum) => onAssign(stage.id, day, slotIndex, subNum, eventIndex)}
                    onSlotClick={() => onSlotClick({ stageId: stage.id, evening: day, slotIndex, timeLabel: label, eventIndex })}
                    onRemove={isOccupied ? () => onRemove(stage.id, day, slotIndex, eventIndex) : undefined}
                    onPeekEnter={canPeek && sub ? (rect) => setGridPeek({ sub, rect, useMoonlight }) : undefined}
                    onPeekLeave={canPeek ? () => setGridPeek(null) : undefined}
                  />
                )
              })}
            </Fragment>
          ))
        )}
      </div>

      {gridPeek && (
        <div
          className="score-peek-tooltip"
          style={getPeekTooltipStyle(gridPeek.rect)}
        >
          {buildPeekContent(gridPeek.sub, gridPeek.useMoonlight)}
        </div>
      )}
    </div>
  )
}
