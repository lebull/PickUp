import { useMemo, useState } from 'react'
import type { Submission, Stage, SlotAssignment, SlotCoord } from '../types.ts'
import { isBlankAssignment, getBlankLabel } from '../types.ts'
import { getSlotLabels, formatTimeLabel, timeToMinutes } from '../lineupUtils.ts'
import { useAppPreferences } from '../AppPreferencesContext.ts'
import { hexToTint } from '../stageColors.ts'
import type { ActiveSlot } from './DJSelectionPanel.tsx'

const CONVENTION_ORDER = ['Thursday', 'Friday', 'Saturday', 'Sunday']

interface Props {
  submissions: Submission[]
  stages: Stage[]
  assignments: SlotAssignment[]
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

  const stage = stages.find((s) => s.id === activeStageId)
  const isSimultaneous = stage?.stageType === 'simultaneous'

  function getDisplayName(submissionNumber: string): string {
    const idx = submissions.findIndex((s) => s.submissionNumber === submissionNumber)
    if (hiddenNames) return idx >= 0 ? `DJ #${idx + 1}` : submissionNumber
    return submissions[idx]?.djName ?? submissionNumber
  }

  // Active days for this stage in convention order
  const activeDays = useMemo(() => {
    if (!stage) return []
    return CONVENTION_ORDER.filter((d) => stage.activeDays.includes(d))
  }, [stage])

  // Unified time slot row axis across all active days (union, sorted chronologically)
  const slotRows = useMemo(() => {
    if (!stage || isSimultaneous) return []
    const allLabels = new Set<string>()
    for (const day of activeDays) {
      for (const label of getSlotLabels(stage, day, 0)) {
        allLabels.add(label)
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
  }, [stage, activeDays, isSimultaneous])

  function getAssignment(evening: string, slotIndex: number): SlotAssignment | undefined {
    return assignments.find(
      (a) =>
        a.stageId === activeStageId &&
        a.evening === evening &&
        (a.eventIndex ?? 0) === 0 &&
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
    ? Math.max(1, ...activeDays.map((day) => (stage.schedule?.[day] ?? []).length))
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
            className="grid-cell grid-header grid-stage-header"
            style={stageColor ? { borderBottom: `3px solid ${stageColor}` } : undefined}
          >
            {day}
          </div>
        ))}

        {/* Body */}
        {isSimultaneous ? simEventIndices.map((ei) => {
          // Row time label: use the first active day that has this event
          const firstDayWithEvent = activeDays.find((d) => (stage.schedule?.[d] ?? []).length > ei)
          const firstEvent = firstDayWithEvent ? stage.schedule?.[firstDayWithEvent]?.[ei] : undefined
          const rowLabel = firstEvent?.startTime
            ? formatTimeLabel(firstEvent.startTime, timeFormat)
            : `Set ${ei + 1}`
          return (
            <>
              <div key={`sim-time-${ei}`} className="grid-cell grid-time-label">{rowLabel}</div>
              {activeDays.map((day) => {
                const dayEvents = stage.schedule?.[day] ?? []
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
                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = isSimFull ? 'none' : 'move' }}
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
                              onClick={() => onRemoveSimultaneous(stage.id, day, a.positionIndex as 1 | 2 | 3, ei)}
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
            </>
          )
        })
        : slotRows.length === 0 ? (
          // No slot times configured
          <>
            <div className="grid-cell grid-time-label">—</div>
            {activeDays.map((day) => (
              <div key={`unconf-${day}`} className="grid-cell grid-slot grid-slot--unconfigured">
                <span className="slot-config-hint">Set times for {day}</span>
              </div>
            ))}
          </>
        ) : (
          // Sequential: one row per time slot
          slotRows.map((label) => (
            <>
              <div key={`time-${label}`} className="grid-cell grid-time-label">
                {formatTimeLabel(label, timeFormat)}
              </div>
              {activeDays.map((day) => {
                // Find the actual slot index for this day (may differ from the union row index)
                const dayLabels = getSlotLabels(stage, day, 0)
                const daySlotIdx = dayLabels.indexOf(label)
                const slotKey = `${stage.id}|${day}|0|${daySlotIdx}`
                const isActive = daySlotIdx !== -1 && activeSlotKey === slotKey

                if (daySlotIdx === -1) {
                  return (
                    <div
                      key={`${day}-oor`}
                      className="grid-cell grid-slot grid-slot--out-of-range"
                    />
                  )
                }

                const assignment = getAssignment(day, daySlotIdx)
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

                return assignment ? (
                  <button
                    key={`${day}-${label}`}
                    type="button"
                    className={`grid-cell grid-slot ${isBlankSlot ? 'grid-slot--blank' : 'grid-slot--occupied'}${isActive ? ' grid-slot--active' : ''}${isDragOver ? ' grid-slot--drag-over' : ''}${isUnavailable ? ' grid-slot--availability-error' : ''}`}
                    style={isOccupied && stageColor ? { backgroundColor: hexToTint(stageColor, 0.25) } : undefined}
                    title={isUnavailable ? `Available: ${sub!.daysAvailable}` : undefined}
                    draggable={isOccupied}
                    onDragStart={isOccupied && submissionNum ? (e) => {
                      e.dataTransfer.setData('application/dj-slot-key', JSON.stringify({ stageId: stage.id, evening: day, slotIndex: daySlotIdx, eventIndex: 0 }))
                      e.dataTransfer.setData('application/dj-submission-number', submissionNum)
                      e.dataTransfer.effectAllowed = 'move'
                    } : undefined}
                    onDragEnter={(e) => { e.preventDefault(); setDragOverKey(slotKey) }}
                    onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverKey(null) }}
                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
                    onDrop={(e) => {
                      e.preventDefault()
                      setDragOverKey(null)
                      const slotKeyData = e.dataTransfer.getData('application/dj-slot-key')
                      if (slotKeyData) {
                        onMoveAssignment(JSON.parse(slotKeyData) as SlotCoord, { stageId: stage.id, evening: day, slotIndex: daySlotIdx, eventIndex: 0 })
                      } else {
                        const subNum = e.dataTransfer.getData('application/dj-submission-number')
                        if (subNum) onAssign(stage.id, day, daySlotIdx, subNum, 0)
                      }
                    }}
                    onClick={() =>
                      onSlotClick({ stageId: stage.id, evening: day, slotIndex: daySlotIdx, timeLabel: label, eventIndex: 0 })
                    }
                  >
                    {assignedLabel}
                    {isOccupied && genre && <span className="slot-genre">{genre}</span>}
                    {isOccupied && (
                      <button
                        type="button"
                        className="slot-remove-btn"
                        title="Remove DJ"
                        onClick={(e) => { e.stopPropagation(); onRemove(stage.id, day, daySlotIdx, 0) }}
                      >
                        ×
                      </button>
                    )}
                  </button>
                ) : (
                  <button
                    key={`${day}-${label}`}
                    type="button"
                    className={`grid-cell grid-slot grid-slot--empty${isActive ? ' grid-slot--active' : ''}${isDragOver ? ' grid-slot--drag-over' : ''}`}
                    onClick={() =>
                      onSlotClick({ stageId: stage.id, evening: day, slotIndex: daySlotIdx, timeLabel: label, eventIndex: 0 })
                    }
                    onDragEnter={(e) => { e.preventDefault(); setDragOverKey(slotKey) }}
                    onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverKey(null) }}
                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
                    onDrop={(e) => {
                      e.preventDefault()
                      setDragOverKey(null)
                      const slotKeyData = e.dataTransfer.getData('application/dj-slot-key')
                      if (slotKeyData) {
                        onMoveAssignment(JSON.parse(slotKeyData) as SlotCoord, { stageId: stage.id, evening: day, slotIndex: daySlotIdx, eventIndex: 0 })
                      } else {
                        const subNum = e.dataTransfer.getData('application/dj-submission-number')
                        if (subNum) onAssign(stage.id, day, daySlotIdx, subNum, 0)
                      }
                    }}
                  >
                    +
                  </button>
                )
              })}
            </>
          ))
        )}
      </div>
    </div>
  )
}
