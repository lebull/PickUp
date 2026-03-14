import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useProjectContext } from '../ProjectContext.ts'
import { LineupGrid } from './LineupGrid.tsx'
import { StageGrid } from './StageGrid.tsx'
import { StageConfigPanel } from './StageConfigPanel.tsx'
import { DJSelectionPanel } from './DJSelectionPanel.tsx'
import type { ActiveSlot } from './DJSelectionPanel.tsx'
import type { Stage, SlotAssignment } from '../types.ts'
import { SplitPane } from './SplitPane.tsx'
import { getSlotLabels } from '../lineupUtils.ts'
import { hexToTint } from '../stageColors.ts'

export function LineupView() {
  const { project, setProject, submissions, rowCountMismatch, setRowCountMismatch } = useProjectContext()

  const [showStageConfig, setShowStageConfig] = useState(false)
  const [activeSlot, setActiveSlot] = useState<ActiveSlot | null>(null)
  const [viewMode, setViewMode] = useState<'day' | 'stage'>('day')
  const [activeStageId, setActiveStageId] = useState<string | null>(
    project.stages[0]?.id ?? null
  )
  const { day } = useParams<{ day?: string }>()
  const navigate = useNavigate()

  // Derived list of active evenings in convention order
  const activeEvenings = useMemo(() => {
    const daySet = new Set<string>()
    for (const stage of project.stages) {
      for (const d of stage.activeDays) daySet.add(d)
    }
    return ['Thursday', 'Friday', 'Saturday', 'Sunday'].filter((d) => daySet.has(d))
  }, [project.stages])

  const selectedEvening =
    activeEvenings.find((e) => e.toLowerCase() === day?.toLowerCase()) ??
    activeEvenings[0] ??
    'Thursday'

  if (!day) {
    const target = activeEvenings[0]?.toLowerCase() ?? 'thursday'
    return <Navigate replace to={`/project/${project.id}/lineup/${target}`} />
  }

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

  if (submissions === null) return null

  function handleAssign(stageId: string, evening: string, slotIndex: number, submissionNumber: string, eventIndex = 0) {
    setProject((prev) => {
      if (!prev) return prev
      const assignments = [
        ...prev.assignments.filter(
          (a) => !(a.stageId === stageId && a.evening === evening && (a.eventIndex ?? 0) === eventIndex && a.slotIndex === slotIndex)
        ),
        { type: 'dj', stageId, evening, slotIndex, eventIndex, submissionNumber } as SlotAssignment,
      ]
      // Advance active slot to the next empty sequential slot within the same stage event
      if (activeSlot) {
        const nextSlot = findNextEmptySlot(prev.stages, assignments, evening, activeSlot)
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
      const assignments = prev.assignments.filter(
        (a) => !(a.stageId === stageId && a.evening === evening && (a.eventIndex ?? 0) === eventIndex && a.slotIndex === slotIndex)
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
    const existing = project.assignments.filter(
      (a) => a.stageId === stageId && a.evening === evening && a.positionIndex != null && (a.eventIndex ?? 0) === eventIndex
    )
    if (existing.length >= 3) return
    const usedSet = new Set(existing.map((a) => a.positionIndex as 1 | 2 | 3))
    const nextPos = positions.find((p) => !usedSet.has(p))
    if (!nextPos) return

    setProject((prev) => {
      if (!prev) return prev
      const prevExisting = prev.assignments.filter(
        (a) => a.stageId === stageId && a.evening === evening && a.positionIndex != null && (a.eventIndex ?? 0) === eventIndex
      )
      if (prevExisting.length >= 3) return prev
      const prevUsed = new Set(prevExisting.map((a) => a.positionIndex as 1 | 2 | 3))
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
        (a) => !(a.stageId === stageId && a.evening === evening && a.positionIndex === positionIndex && (a.eventIndex ?? 0) === eventIndex)
      )
      return { ...prev, assignments }
    })
  }

  function handleAssignBlank(stageId: string, evening: string, slotIndex: number, blankLabel?: string, eventIndex = 0) {
    setProject((prev) => {
      if (!prev) return prev
      const assignments: SlotAssignment[] = [
        ...prev.assignments.filter(
          (a) => !(a.stageId === stageId && a.evening === evening && (a.eventIndex ?? 0) === eventIndex && a.slotIndex === slotIndex)
        ),
        { type: 'blank', stageId, evening, slotIndex, eventIndex, blankLabel: blankLabel || undefined },
      ]
      if (activeSlot) {
        const nextSlot = findNextEmptySlot(prev.stages, assignments, evening, activeSlot)
        if (nextSlot) setActiveSlot(nextSlot)
      }
      return { ...prev, assignments }
    })
  }

  function handleAddBlankSimultaneous(stageId: string, evening: string, _positionIndex: 1 | 2 | 3, blankLabel?: string, eventIndex = 0) {
    const positions: (1 | 2 | 3)[] = [1, 2, 3]
    const existing = project.assignments.filter(
      (a) => a.stageId === stageId && a.evening === evening && a.positionIndex != null && (a.eventIndex ?? 0) === eventIndex
    )
    if (existing.length >= 3) return
    const usedSet = new Set(existing.map((a) => a.positionIndex as 1 | 2 | 3))
    const nextPos = positions.find((p) => !usedSet.has(p))
    if (!nextPos) return

    setProject((prev) => {
      if (!prev) return prev
      const prevExisting = prev.assignments.filter(
        (a) => a.stageId === stageId && a.evening === evening && a.positionIndex != null && (a.eventIndex ?? 0) === eventIndex
      )
      if (prevExisting.length >= 3) return prev
      const prevUsed = new Set(prevExisting.map((a) => a.positionIndex as 1 | 2 | 3))
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

  function handleToggleViewMode(mode: 'day' | 'stage') {
    if (mode === viewMode) return
    setActiveSlot(null)
    if (mode === 'stage' && activeStageId === null) {
      setActiveStageId(project.stages[0]?.id ?? null)
    }
    setViewMode(mode)
  }

  function handleSelectStage(stageId: string) {
    setActiveStageId(stageId)
    setActiveSlot(null)
  }

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
                  className="btn-secondary btn-small configure-btn"
                  onClick={() => setShowStageConfig(true)}
                >
                  ⚙ Stages
                </button>
              </div>
              {/* Stage selector — shown only in stage view */}
              {viewMode === 'stage' && (
                <div className="lineup-stage-selector">
                  {project.stages.map((stg) => (
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
              <StageGrid
                submissions={submissions}
                stages={project.stages}
                assignments={project.assignments}
                activeStageId={activeStageId}
                onSlotClick={setActiveSlot}
                onAssign={handleAssign}
                onRemove={handleRemove}
                onAddSimultaneous={handleAddSimultaneous}
                onRemoveSimultaneous={handleRemoveSimultaneous}
                activeSlotKey={
                  activeSlot
                    ? activeSlot.positionIndex != null
                      ? `${activeSlot.stageId}|${activeSlot.evening}|${activeSlot.eventIndex ?? 0}|simultaneous`
                      : `${activeSlot.stageId}|${activeSlot.evening}|${activeSlot.eventIndex ?? 0}|${activeSlot.slotIndex}`
                    : null
                }
              />
            ) : (
              <LineupGrid
                submissions={submissions}
                stages={project.stages}
                assignments={project.assignments}
                selectedEvening={selectedEvening}
                onSelectEvening={handleSelectEvening}
                onAssign={handleAssign}
                onRemove={handleRemove}
                onAddSimultaneous={handleAddSimultaneous}
                onRemoveSimultaneous={handleRemoveSimultaneous}
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
            assignments={project.assignments}
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
          assignments={project.assignments}
          onSave={handleSaveStages}
          onClose={() => setShowStageConfig(false)}
        />
      )}
    </div>
  )
}
