import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useProjectContext } from '../ProjectContext.ts'
import { LineupGrid } from './LineupGrid.tsx'
import { StageGrid } from './StageGrid.tsx'
import { StageConfigPanel } from './StageConfigPanel.tsx'
import { DJSelectionPanel } from './DJSelectionPanel.tsx'
import type { ActiveSlot } from './DJSelectionPanel.tsx'
import type { Stage, SlotAssignment, SlotCoord, Assignment } from '../types.ts'
import { isSimultaneousCoord, isSlotAssignment } from '../types.ts'
import { SplitPane } from './SplitPane.tsx'
import { getSlotLabels } from '../lineupUtils.ts'
import { hexToTint } from '../stageColors.ts'
import { useAppPreferences } from '../AppPreferencesContext.ts'

export function LineupView() {
  const { project, setProject, submissions, rowCountMismatch, setRowCountMismatch } = useProjectContext()
  const { hiddenNames } = useAppPreferences()

  const [showStageConfig, setShowStageConfig] = useState(false)
  const [activeSlot, setActiveSlot] = useState<ActiveSlot | null>(null)
  const [viewMode, setViewMode] = useState<'day' | 'stage' | 'special'>('day')
  const [activeStageId, setActiveStageId] = useState<string | null>(
    project.stages[0]?.id ?? null
  )
  const { day } = useParams<{ day?: string }>()
  const navigate = useNavigate()

  // Filter to slot assignments only (exclude special stage assignments for now in day/stage views)
  const slotAssignments = useMemo(
    () => project.assignments.filter(isSlotAssignment),
    [project.assignments]
  ) as SlotAssignment[]

  const stageViewStages = useMemo(
    () => project.stages.filter((s) => s.stageType !== 'special'),
    [project.stages]
  )

  // Derived list of active evenings in convention order
  const activeEvenings = useMemo(() => {
    const daySet = new Set<string>()
    for (const stage of project.stages) {
      for (const d of stage.activeDays ?? []) daySet.add(d)
    }
    return ['Thursday', 'Friday', 'Saturday', 'Sunday'].filter((d) => daySet.has(d))
  }, [project.stages])

  const selectedEvening =
    activeEvenings.find((e) => e.toLowerCase() === day?.toLowerCase()) ??
    activeEvenings[0] ??
    'Thursday'

  /** Returns the next empty sequential ActiveSlot within the same stage event, or null if none. */
  function findNextEmptySlot(
    stages: Stage[],
    assignments: SlotAssignment[],
    evening: string,
    currentSlot: ActiveSlot
  ): ActiveSlot | null {
    // Only scan within the same stage and same event — never silently switch context
    const stage = stages.find(
      (s) => s.id === currentSlot.stageId && (s.stageType ?? 'sequential') === 'sequential'
    )
    if (!stage) return null

    const eventIndex = currentSlot.eventIndex ?? 0
    const labels = getSlotLabels(stage, evening, eventIndex)
    const allSlots: ActiveSlot[] = labels.map((timeLabel, slotIndex) => ({
      stageId: stage.id, evening, slotIndex, eventIndex, timeLabel,
    }))

    const occupied = new Set(
      assignments
        .filter(
          (a) =>
            a.stageId === currentSlot.stageId &&
            a.evening === evening &&
            (a.eventIndex ?? 0) === eventIndex &&
            a.slotIndex != null
        )
        .map((a) => a.slotIndex as number)
    )

    const currentIdx = allSlots.findIndex((s) => s.slotIndex === currentSlot.slotIndex)
    const len = allSlots.length
    for (let i = 1; i < len; i++) {
      const candidate = allSlots[(currentIdx + i) % len]
      if (!occupied.has(candidate.slotIndex!)) {
        return candidate
      }
    }
    return null
  }

  function handleSimultaneousClick(slot: { stageId: string; evening: string; positionIndex: 1 | 2 | 3; timeLabel: string; eventIndex: number }) {
    setActiveSlot(slot)
  }

  const specialStages = useMemo(() => {
    // For special stages, collect all assignments by stage (no day/event filtering)
    return project.stages
      .filter((s) => s.stageType === 'special')
      .map((stage) => ({
        stageId: stage.id,
        stageName: stage.name,
        stageColor: stage.color,
        assignments: slotAssignments.filter((a) => a.stageId === stage.id).sort((a, b) => (a.slotIndex ?? 0) - (b.slotIndex ?? 0)),
      }))
  }, [project.stages, slotAssignments])

  function getDisplayName(submissionNumber: string): string {
    const idx = submissions.findIndex((s) => s.submissionNumber === submissionNumber)
    if (hiddenNames) return idx >= 0 ? `DJ #${idx + 1}` : submissionNumber
    return submissions[idx]?.djName ?? submissionNumber
  }

  function getNextSpecialSlotIndex(stageId: string): number {
    const existing = slotAssignments.filter((a) => a.stageId === stageId)
    return Math.max(...existing.map((a) => a.slotIndex ?? -1), -1) + 1
  }

  function selectSpecialStage(stageId: string) {
    const nextIndex = getNextSpecialSlotIndex(stageId)
    setActiveSlot({
      stageId,
      evening: '',
      slotIndex: nextIndex,
      timeLabel: `Pick ${nextIndex + 1}`,
    })
  }


  function handleAssign(stageId: string, evening: string, slotIndex: number, submissionNumber: string, eventIndex = 0) {
    setProject((prev) => {
      if (!prev) return prev
      const stage = prev.stages.find((s) => s.id === stageId)
      const isSpecialStage = stage?.stageType === 'special'
      const assignments = [
        ...prev.assignments.filter(
          (a) => !(isSlotAssignment(a) && a.stageId === stageId && a.evening === evening && (a.eventIndex ?? 0) === eventIndex && a.slotIndex === slotIndex)
        ),
        { type: 'dj', stageId, evening, slotIndex, eventIndex, submissionNumber } as SlotAssignment,
      ]
      // Keep special stage selection active and advance to the next pick index.
      if (isSpecialStage) {
        const nextIndex = Math.max(
          ...assignments
            .filter((a) => isSlotAssignment(a) && a.stageId === stageId && a.slotIndex != null)
            .map((a) => (a as SlotAssignment).slotIndex ?? -1),
          -1
        ) + 1
        setActiveSlot({
          stageId,
          evening,
          eventIndex,
          slotIndex: nextIndex,
          timeLabel: `Pick ${nextIndex + 1}`,
        })
        return { ...prev, assignments }
      }
      // Advance active slot to the next empty sequential slot within the same stage event
      if (activeSlot) {
        const nextSlot = findNextEmptySlot(prev.stages, assignments.filter(isSlotAssignment), evening, activeSlot)
        if (nextSlot) {
          setActiveSlot(nextSlot)
        }
        // If no next slot, leave activeSlot unchanged (stay on the current slot)
      }
      return { ...prev, assignments }
    })
  }

  function handleRemove(stageId: string, evening: string, slotIndex: number, eventIndex = 0) {
    setProject((prev) => {
      if (!prev) return prev
      const stage = prev.stages.find((s) => s.id === stageId)

      // Special stages keep a compact pick list; after a removal, collapse indices.
      if (stage?.stageType === 'special') {
        const withoutRemoved = prev.assignments.filter(
          (a) => !(isSlotAssignment(a) && a.stageId === stageId && a.slotIndex === slotIndex)
        )

        const remainingSpecial = withoutRemoved
          .filter((a): a is SlotAssignment => isSlotAssignment(a) && a.stageId === stageId)
          .sort((a, b) => (a.slotIndex ?? 0) - (b.slotIndex ?? 0))
          .map((a, idx) => ({ ...a, evening: '', eventIndex: 0, slotIndex: idx }))

        const nonSpecial = withoutRemoved.filter(
          (a) => !(isSlotAssignment(a) && a.stageId === stageId)
        )

        const nextIndex = Math.min(slotIndex, remainingSpecial.length)
        setActiveSlot((prevActive) => {
          if (!prevActive || prevActive.stageId !== stageId) return prevActive
          return {
            ...prevActive,
            evening: '',
            eventIndex: 0,
            slotIndex: nextIndex,
            timeLabel: `Pick ${nextIndex + 1}`,
          }
        })

        return { ...prev, assignments: [...nonSpecial, ...remainingSpecial] }
      }

      const assignments = prev.assignments.filter(
        (a) => !(isSlotAssignment(a) && a.stageId === stageId && a.evening === evening && (a.eventIndex ?? 0) === eventIndex && a.slotIndex === slotIndex)
      )
      return { ...prev, assignments }
    })
    // Do NOT clear activeSlot — keep it selected so user can assign a replacement immediately
  }

  /** Adds a DJ to the next available simultaneous stage position (1–3) for a specific event. */
  function handleAddSimultaneous(
    stageId: string,
    evening: string,
    _positionIndex: 1 | 2 | 3,
    submissionNumber: string,
    eventIndex = 0
  ) {
    const positions: (1 | 2 | 3)[] = [1, 2, 3]
    const existing = slotAssignments.filter(
      (a) => a.stageId === stageId && a.evening === evening && a.positionIndex != null && (a.eventIndex ?? 0) === eventIndex
    )
    if (existing.length >= 3) return
    const usedSet = new Set(existing.map((a) => a.positionIndex as 1 | 2 | 3))
    const nextPos = positions.find((p) => !usedSet.has(p))
    if (!nextPos) return

    setProject((prev) => {
      if (!prev) return prev
      const prevExisting = prev.assignments.filter(
        (a) => isSlotAssignment(a) && a.stageId === stageId && a.evening === evening && a.positionIndex != null && (a.eventIndex ?? 0) === eventIndex
      )
      if (prevExisting.length >= 3) return prev
      const prevUsed = new Set(prevExisting.map((a) => (a as SlotAssignment).positionIndex as 1 | 2 | 3))
      const prevNextPos = positions.find((p) => !prevUsed.has(p))
      if (!prevNextPos) return prev
      return {
        ...prev,
        assignments: [...prev.assignments, { type: 'dj', stageId, evening, positionIndex: prevNextPos, eventIndex, submissionNumber }],
      }
    })

    // Advance activeSlot to the next empty position after the one just filled
    const nextFreePos = positions.find((p) => !usedSet.has(p) && p !== nextPos)
    if (nextFreePos && activeSlot) {
      setActiveSlot({ ...activeSlot, positionIndex: nextFreePos })
    }
  }

  /** Removes a DJ from a simultaneous stage position. */
  function handleRemoveSimultaneous(stageId: string, evening: string, positionIndex: 1 | 2 | 3, eventIndex = 0) {
    setProject((prev) => {
      if (!prev) return prev
      const assignments = prev.assignments.filter(
        (a) => !(isSlotAssignment(a) && a.stageId === stageId && a.evening === evening && a.positionIndex === positionIndex && (a.eventIndex ?? 0) === eventIndex)
      )
      return { ...prev, assignments }
    })
  }

  function handleMoveAssignment(from: SlotCoord, to: SlotCoord) {
    // Same simultaneous cell (any position) → no-op
    if (
      isSimultaneousCoord(from) && isSimultaneousCoord(to) &&
      from.stageId === to.stageId && from.evening === to.evening &&
      from.eventIndex === to.eventIndex
    ) return
    // Same sequential slot → no-op
    if (
      !isSimultaneousCoord(from) && !isSimultaneousCoord(to) &&
      from.stageId === to.stageId && from.evening === to.evening &&
      from.slotIndex === to.slotIndex && from.eventIndex === to.eventIndex
    ) return

    setProject((prev) => {
      if (!prev) return prev
      const assignments = [...prev.assignments]

      const srcIdx = isSimultaneousCoord(from)
        ? assignments.findIndex(
            (a) => isSlotAssignment(a) && a.stageId === from.stageId && a.evening === from.evening &&
              a.positionIndex === from.positionIndex && (a.eventIndex ?? 0) === from.eventIndex
          )
        : assignments.findIndex(
            (a) => isSlotAssignment(a) && a.stageId === from.stageId && a.evening === from.evening &&
              a.slotIndex === from.slotIndex && (a.eventIndex ?? 0) === from.eventIndex
          )
      if (srcIdx === -1) return prev
      const srcAssignment = assignments[srcIdx] as SlotAssignment

      const tgtIdx = isSimultaneousCoord(to)
        ? assignments.findIndex(
            (a) => isSlotAssignment(a) && a.stageId === to.stageId && a.evening === to.evening &&
              a.positionIndex === to.positionIndex && (a.eventIndex ?? 0) === to.eventIndex
          )
        : assignments.findIndex(
            (a) => isSlotAssignment(a) && a.stageId === to.stageId && a.evening === to.evening &&
              a.slotIndex === to.slotIndex && (a.eventIndex ?? 0) === to.eventIndex
          )
      const tgtAssignment = tgtIdx !== -1 ? (assignments[tgtIdx] as SlotAssignment) : undefined

      const result = assignments.filter((_, i) => i !== srcIdx && i !== tgtIdx)

      const newAtTarget: SlotAssignment = isSimultaneousCoord(to)
        ? { ...srcAssignment, stageId: to.stageId, evening: to.evening, positionIndex: to.positionIndex, eventIndex: to.eventIndex, slotIndex: undefined }
        : { ...srcAssignment, stageId: to.stageId, evening: to.evening, slotIndex: to.slotIndex, eventIndex: to.eventIndex, positionIndex: undefined }
      result.push(newAtTarget)

      if (tgtAssignment) {
        const newAtSource: SlotAssignment = isSimultaneousCoord(from)
          ? { ...tgtAssignment, stageId: from.stageId, evening: from.evening, positionIndex: from.positionIndex, eventIndex: from.eventIndex, slotIndex: undefined }
          : { ...tgtAssignment, stageId: from.stageId, evening: from.evening, slotIndex: from.slotIndex, eventIndex: from.eventIndex, positionIndex: undefined }
        result.push(newAtSource)
      }

      return { ...prev, assignments: result }
    })
  }

  function handleAssignBlank(stageId: string, evening: string, slotIndex: number, blankLabel?: string, eventIndex = 0) {
    setProject((prev) => {
      if (!prev) return prev
      const assignments: Assignment[] = [
        ...prev.assignments.filter(
          (a) => !(isSlotAssignment(a) && a.stageId === stageId && a.evening === evening && (a.eventIndex ?? 0) === eventIndex && a.slotIndex === slotIndex)
        ),
        { type: 'blank', stageId, evening, slotIndex, eventIndex, blankLabel: blankLabel || undefined },
      ]
      if (activeSlot) {
        const nextSlot = findNextEmptySlot(prev.stages, assignments.filter(isSlotAssignment), evening, activeSlot)
        if (nextSlot) setActiveSlot(nextSlot)
      }
      return { ...prev, assignments }
    })
  }

  function handleAddBlankSimultaneous(stageId: string, evening: string, _positionIndex: 1 | 2 | 3, blankLabel?: string, eventIndex = 0) {
    const positions: (1 | 2 | 3)[] = [1, 2, 3]
    const existing = slotAssignments.filter(
      (a) => a.stageId === stageId && a.evening === evening && a.positionIndex != null && (a.eventIndex ?? 0) === eventIndex
    )
    if (existing.length >= 3) return
    const usedSet = new Set(existing.map((a) => a.positionIndex as 1 | 2 | 3))
    const nextPos = positions.find((p) => !usedSet.has(p))
    if (!nextPos) return

    setProject((prev) => {
      if (!prev) return prev
      const prevExisting = prev.assignments.filter(
        (a) => isSlotAssignment(a) && a.stageId === stageId && a.evening === evening && a.positionIndex != null && (a.eventIndex ?? 0) === eventIndex
      )
      if (prevExisting.length >= 3) return prev
      const prevUsed = new Set(prevExisting.map((a) => (a as SlotAssignment).positionIndex as 1 | 2 | 3))
      const prevNextPos = positions.find((p) => !prevUsed.has(p))
      if (!prevNextPos) return prev
      return {
        ...prev,
        assignments: [...prev.assignments, { type: 'blank', stageId, evening, positionIndex: prevNextPos, eventIndex, blankLabel: blankLabel || undefined }],
      }
    })

    const nextFreePos = positions.find((p) => !usedSet.has(p) && p !== nextPos)
    if (nextFreePos && activeSlot) {
      setActiveSlot({ ...activeSlot, positionIndex: nextFreePos })
    }
  }

  function handleSaveStages(stages: Stage[]) {
    setProject((prev) => {
      if (!prev) return prev
      const stageIds = new Set(stages.map((s) => s.id))
      const assignments = prev.assignments.filter((a) => stageIds.has(a.stageId))
      return { ...prev, stages, assignments }
    })
    setShowStageConfig(false)
  }

  function handleSelectEvening(evening: string) {
    setActiveSlot(null)
    navigate(`/project/${project.id}/lineup/${evening.toLowerCase()}`)
  }

  function handleToggleViewMode(mode: 'day' | 'stage' | 'special') {
    if (mode === viewMode) return
    setActiveSlot(null)
    if (mode === 'stage') {
      if (activeStageId === null || !stageViewStages.some((s) => s.id === activeStageId)) {
        setActiveStageId(stageViewStages[0]?.id ?? null)
      }
    }
    setViewMode(mode)
  }

  function handleSelectStage(stageId: string) {
    setActiveStageId(stageId)
    setActiveSlot(null)
  }

  if (!day) {
    const target = activeEvenings[0]?.toLowerCase() ?? 'thursday'
    return <Navigate replace to={`/project/${project.id}/lineup/${target}`} />
  }

  if (submissions === null) return null

  return (
    <div className="lineup-layout">
      {rowCountMismatch && (
        <div className="mismatch-banner">
          ⚠ The submission count has changed since this lineup was saved. Some assignments may
          reference DJs no longer in the spreadsheet.
          <button type="button" className="mismatch-dismiss" onClick={() => setRowCountMismatch(false)}>
            Dismiss
          </button>
        </div>
      )}
      <div className="lineup-main">
        <SplitPane initialSplit={65} minLeft={35} minRight={20}>
          <div
            className="lineup-grid-wrapper"
            onClick={(e) => {
              if ((e.target as HTMLElement).classList.contains('lineup-grid-wrapper')) {
                setActiveSlot(null)
              }
            }}
          >
            {/* View mode toggle */}
            <div className="lineup-view-toggle">
              <div className="lineup-view-toggle-buttons">
                <button
                  type="button"
                  className={`lineup-view-btn${viewMode === 'day' ? ' active' : ''}`}
                  onClick={() => handleToggleViewMode('day')}
                >
                  Day View
                </button>
                <button
                  type="button"
                  className={`lineup-view-btn${viewMode === 'stage' ? ' active' : ''}`}
                  onClick={() => handleToggleViewMode('stage')}
                >
                  Stage View
                </button>
                <button
                  type="button"
                  className={`lineup-view-btn${viewMode === 'special' ? ' active' : ''}`}
                  onClick={() => handleToggleViewMode('special')}
                >
                  Special Events
                </button>
                <button
                  type="button"
                  className="btn-secondary btn-small configure-btn"
                  onClick={() => setShowStageConfig(true)}
                >
                  ⚙ Stages
                </button>
              </div>
              {/* Stage selector — shown only in stage view */}
              {viewMode === 'stage' && (
                <div className="lineup-stage-selector">
                  {stageViewStages.map((stg) => (
                    <button
                      key={stg.id}
                      type="button"
                      className={`lineup-stage-btn${activeStageId === stg.id ? ' active' : ''}`}
                      style={
                        stg.color
                          ? {
                            borderColor: stg.color,
                            ...(activeStageId === stg.id
                              ? { backgroundColor: hexToTint(stg.color, 0.2), color: stg.color }
                              : {}),
                          }
                          : undefined
                      }
                      onClick={() => handleSelectStage(stg.id)}
                    >
                      {stg.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {viewMode === 'stage' ? (
              stageViewStages.length === 0 ? (
                <p className="lineup-notice">No sequential or simultaneous stages configured yet.</p>
              ) : (
                <StageGrid
                  submissions={submissions}
                  stages={stageViewStages}
                  assignments={slotAssignments}
                  activeStageId={activeStageId}
                  onSlotClick={setActiveSlot}
                  onAssign={handleAssign}
                  onRemove={handleRemove}
                  onAddSimultaneous={handleAddSimultaneous}
                  onRemoveSimultaneous={handleRemoveSimultaneous}
                  onMoveAssignment={handleMoveAssignment}
                  activeSlotKey={
                    activeSlot
                      ? activeSlot.positionIndex != null
                        ? `${activeSlot.stageId}|${activeSlot.evening}|${activeSlot.eventIndex ?? 0}|simultaneous`
                        : `${activeSlot.stageId}|${activeSlot.evening}|${activeSlot.eventIndex ?? 0}|${activeSlot.slotIndex}`
                      : null
                  }
                />
              )
            ) : viewMode === 'special' ? (
              <div className="special-events-view">
                {specialStages.length === 0 ? (
                  <p className="lineup-notice">No special stages configured yet. Open Stages and create a stage with Type set to Special.</p>
                ) : (
                  specialStages.map((stage) => (
                    <section
                      key={stage.stageId}
                      className={`special-events-card${activeSlot?.stageId === stage.stageId ? ' special-events-card--active' : ''}`}
                      style={
                        stage.stageColor
                          ? {
                            borderColor: activeSlot?.stageId === stage.stageId ? stage.stageColor : undefined,
                            boxShadow: activeSlot?.stageId === stage.stageId ? `inset 0 0 0 1px ${stage.stageColor}` : undefined,
                          }
                          : undefined
                      }
                    >
                      <div className="special-events-card-header" onClick={() => selectSpecialStage(stage.stageId)}>
                        <div>
                          <h3>{stage.stageName}</h3>
                          <p>Open-ended DJ picks</p>
                        </div>
                        <button
                          type="button"
                          className="btn-secondary btn-small"
                          onClick={(e) => {
                            e.stopPropagation()
                            selectSpecialStage(stage.stageId)
                          }}
                        >
                          Select Event
                        </button>
                      </div>
                      <div className="special-events-list">
                        {stage.assignments.length === 0 ? (
                          <p className="special-events-empty">No DJs selected yet.</p>
                        ) : (
                          stage.assignments.map((assignment) => {
                            const sub = !('submissionNumber' in assignment)
                              ? null
                              : submissions.find((s) => s.submissionNumber === assignment.submissionNumber)
                            if (!sub || assignment.slotIndex == null) return null
                            const slotIndex = assignment.slotIndex
                            return (
                              <div
                                key={`${stage.stageId}|${slotIndex}`}
                                className="special-events-item"
                                style={
                                  stage.stageColor
                                    ? { backgroundColor: hexToTint(stage.stageColor, 0.16) }
                                    : undefined
                                }
                              >
                                <span>{getDisplayName(sub.submissionNumber)}</span>
                                <div className="special-events-item-actions">
                                  <button
                                    type="button"
                                    className="btn-danger btn-small"
                                    onClick={() => handleRemove(stage.stageId, '', slotIndex, 0)}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            )
                          })
                        )}
                        <div
                          className="special-events-drop-placeholder"
                          onClick={() => selectSpecialStage(stage.stageId)}
                          onDragOver={(e) => {
                            e.preventDefault()
                            e.dataTransfer.dropEffect = 'move'
                          }}
                          onDrop={(e) => {
                            e.preventDefault()
                            const subNum = e.dataTransfer.getData('application/dj-submission-number')
                            if (!subNum) return
                            const nextIndex = getNextSpecialSlotIndex(stage.stageId)
                            handleAssign(stage.stageId, '', nextIndex, subNum, 0)
                          }}
                        >
                          <span className="special-events-drop-plus" aria-hidden="true">+</span>
                          <span>Drop or click to add DJ</span>
                        </div>
                      </div>
                    </section>
                  ))
                )}
              </div>
            ) : (
              <LineupGrid
                submissions={submissions}
                stages={project.stages}
                assignments={slotAssignments}
                selectedEvening={selectedEvening}
                onSelectEvening={handleSelectEvening}
                onAssign={handleAssign}
                onRemove={handleRemove}
                onAddSimultaneous={handleAddSimultaneous}
                onRemoveSimultaneous={handleRemoveSimultaneous}
                onMoveAssignment={handleMoveAssignment}
                onConfigureStages={() => setShowStageConfig(true)}
                onSlotClick={setActiveSlot}
                onSimultaneousClick={handleSimultaneousClick}
                activeSlotKey={
                  activeSlot
                    ? activeSlot.positionIndex != null
                      ? `${activeSlot.stageId}|${activeSlot.evening}|${activeSlot.eventIndex ?? 0}|simultaneous`
                      : `${activeSlot.stageId}|${activeSlot.evening}|${activeSlot.eventIndex ?? 0}|${activeSlot.slotIndex}`
                    : null
                }
              />
            )}
          </div>
          <DJSelectionPanel
            submissions={submissions}
            stages={project.stages}
            assignments={slotAssignments}
            discardedSubmissionNumbers={new Set(project.discardedSubmissions ?? [])}
            activeSlot={activeSlot}
            currentEvening={selectedEvening}
            onAssign={handleAssign}
            onRemove={handleRemove}
            onAddSimultaneous={handleAddSimultaneous}
            onRemoveSimultaneous={handleRemoveSimultaneous}
            onAssignBlank={handleAssignBlank}
            onAddBlankSimultaneous={handleAddBlankSimultaneous}
            onPositionSelect={(pos) => setActiveSlot((prev) => prev ? { ...prev, positionIndex: pos } : prev)}
            onSelectSlot={(slotIndex, timeLabel) =>
              setActiveSlot((prev) => prev ? { ...prev, slotIndex, timeLabel, positionIndex: undefined } : prev)
            }
            onClose={() => setActiveSlot(null)}
          />
        </SplitPane>
      </div>
      {showStageConfig && (
        <StageConfigPanel
          stages={project.stages}
          assignments={slotAssignments}
          onSave={handleSaveStages}
          onClose={() => setShowStageConfig(false)}
        />
      )}
    </div>
  )
}
