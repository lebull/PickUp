import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useProjectContext } from '../ProjectContext.ts'
import { LineupGrid } from './LineupGrid.tsx'
import { StageConfigPanel } from './StageConfigPanel.tsx'
import { DJSelectionPanel } from './DJSelectionPanel.tsx'
import type { ActiveSlot } from './DJSelectionPanel.tsx'
import type { Stage, SlotAssignment } from '../types.ts'
import { SplitPane } from './SplitPane.tsx'
import { getSlotLabels } from '../lineupUtils.ts'

export function LineupView() {
  const { project, setProject, submissions, rowCountMismatch, setRowCountMismatch } = useProjectContext()

  const [showStageConfig, setShowStageConfig] = useState(false)
  const [activeSlot, setActiveSlot] = useState<ActiveSlot | null>(null)
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

  /** Returns the next empty sequential ActiveSlot within the same stage, or null if none. */
  function findNextEmptySlot(
    stages: Stage[],
    assignments: SlotAssignment[],
    evening: string,
    currentSlot: ActiveSlot
  ): ActiveSlot | null {
    // Only scan within the same stage — never silently switch the active event
    const stage = stages.find(
      (s) => s.id === currentSlot.stageId && (s.stageType ?? 'sequential') === 'sequential'
    )
    if (!stage) return null

    const labels = getSlotLabels(stage, evening)
    const allSlots: ActiveSlot[] = labels.map((timeLabel, slotIndex) => ({
      stageId: stage.id, evening, slotIndex, timeLabel,
    }))

    const occupied = new Set(
      assignments
        .filter((a) => a.stageId === currentSlot.stageId && a.evening === evening && a.slotIndex != null)
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

  function handleSimultaneousClick(slot: { stageId: string; evening: string; positionIndex: 1 | 2 | 3; timeLabel: string }) {
    setActiveSlot(slot)
  }

  if (submissions === null) return null

  function handleAssign(stageId: string, evening: string, slotIndex: number, submissionNumber: string) {
    setProject((prev) => {
      if (!prev) return prev
      const assignments = [
        ...prev.assignments.filter(
          (a) => !(a.stageId === stageId && a.evening === evening && a.slotIndex === slotIndex)
        ),
        { type: 'dj', stageId, evening, slotIndex, submissionNumber },
      ]
      // Advance active slot to the next empty sequential slot on this evening
      if (activeSlot) {
        const newAssignments = assignments
        const nextSlot = findNextEmptySlot(prev.stages, newAssignments, evening, activeSlot)
        if (nextSlot) {
          setActiveSlot(nextSlot)
        }
        // If no next slot, leave activeSlot unchanged (stay on the current slot)
      }
      return { ...prev, assignments }
    })
  }

  function handleRemove(stageId: string, evening: string, slotIndex: number) {
    setProject((prev) => {
      if (!prev) return prev
      const assignments = prev.assignments.filter(
        (a) => !(a.stageId === stageId && a.evening === evening && a.slotIndex === slotIndex)
      )
      return { ...prev, assignments }
    })
    // Do NOT clear activeSlot — keep it selected so user can assign a replacement immediately
  }

  /** Adds a DJ to the next available simultaneous stage position (1–3). */
  function handleAddSimultaneous(
    stageId: string,
    evening: string,
    _positionIndex: 1 | 2 | 3,
    submissionNumber: string
  ) {
    const positions: (1 | 2 | 3)[] = [1, 2, 3]
    const existing = project.assignments.filter(
      (a) => a.stageId === stageId && a.evening === evening && a.positionIndex != null
    )
    if (existing.length >= 3) return
    const usedSet = new Set(existing.map((a) => a.positionIndex as 1 | 2 | 3))
    const nextPos = positions.find((p) => !usedSet.has(p))
    if (!nextPos) return

    setProject((prev) => {
      if (!prev) return prev
      const prevExisting = prev.assignments.filter(
        (a) => a.stageId === stageId && a.evening === evening && a.positionIndex != null
      )
      if (prevExisting.length >= 3) return prev
      const prevUsed = new Set(prevExisting.map((a) => a.positionIndex as 1 | 2 | 3))
      const prevNextPos = positions.find((p) => !prevUsed.has(p))
      if (!prevNextPos) return prev
      return {
        ...prev,
        assignments: [...prev.assignments, { type: 'dj', stageId, evening, positionIndex: prevNextPos, submissionNumber }],
      }
    })

    // Advance activeSlot to the next empty position after the one just filled
    const nextFreePos = positions.find((p) => !usedSet.has(p) && p !== nextPos)
    if (nextFreePos && activeSlot) {
      setActiveSlot({ ...activeSlot, positionIndex: nextFreePos })
    }
  }

  /** Removes a DJ from a simultaneous stage position. */
  function handleRemoveSimultaneous(stageId: string, evening: string, positionIndex: 1 | 2 | 3) {
    setProject((prev) => {
      if (!prev) return prev
      const assignments = prev.assignments.filter(
        (a) => !(a.stageId === stageId && a.evening === evening && a.positionIndex === positionIndex)
      )
      return { ...prev, assignments }
    })
  }

  function handleAssignBlank(stageId: string, evening: string, slotIndex: number, blankLabel?: string) {
    setProject((prev) => {
      if (!prev) return prev
      const assignments: SlotAssignment[] = [
        ...prev.assignments.filter(
          (a) => !(a.stageId === stageId && a.evening === evening && a.slotIndex === slotIndex)
        ),
        { type: 'blank', stageId, evening, slotIndex, blankLabel: blankLabel || undefined },
      ]
      if (activeSlot) {
        const nextSlot = findNextEmptySlot(prev.stages, assignments, evening, activeSlot)
        if (nextSlot) setActiveSlot(nextSlot)
      }
      return { ...prev, assignments }
    })
  }

  function handleAddBlankSimultaneous(stageId: string, evening: string, _positionIndex: 1 | 2 | 3, blankLabel?: string) {
    const positions: (1 | 2 | 3)[] = [1, 2, 3]
    const existing = project.assignments.filter(
      (a) => a.stageId === stageId && a.evening === evening && a.positionIndex != null
    )
    if (existing.length >= 3) return
    const usedSet = new Set(existing.map((a) => a.positionIndex as 1 | 2 | 3))
    const nextPos = positions.find((p) => !usedSet.has(p))
    if (!nextPos) return

    setProject((prev) => {
      if (!prev) return prev
      const prevExisting = prev.assignments.filter(
        (a) => a.stageId === stageId && a.evening === evening && a.positionIndex != null
      )
      if (prevExisting.length >= 3) return prev
      const prevUsed = new Set(prevExisting.map((a) => a.positionIndex as 1 | 2 | 3))
      const prevNextPos = positions.find((p) => !prevUsed.has(p))
      if (!prevNextPos) return prev
      return {
        ...prev,
        assignments: [...prev.assignments, { type: 'blank', stageId, evening, positionIndex: prevNextPos, blankLabel: blankLabel || undefined }],
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
                    ? `${activeSlot.stageId}|${activeSlot.evening}|simultaneous`
                    : `${activeSlot.stageId}|${activeSlot.evening}|${activeSlot.slotIndex}`
                  : null
              }
            />
          </div>
          {activeSlot ? (
            <DJSelectionPanel
              submissions={submissions}
              stages={project.stages}
              assignments={project.assignments}
              discardedSubmissionNumbers={new Set(project.discardedSubmissions ?? [])}
              activeSlot={activeSlot}
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
          ) : (
            <div className="lineup-empty-state">
              <p>Drag and drop a DJ to a slot, or click a slot to get started</p>
            </div>
          )}
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
