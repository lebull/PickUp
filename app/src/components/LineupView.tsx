import { useMemo, useState } from 'react'
import { useProjectContext } from '../ProjectContext.ts'
import { LineupGrid } from './LineupGrid.tsx'
import { StageConfigPanel } from './StageConfigPanel.tsx'
import { DJSelectionPanel } from './DJSelectionPanel.tsx'
import type { ActiveSlot } from './DJSelectionPanel.tsx'
import type { Stage, SlotAssignment } from '../types.ts'
import { saveProject } from '../projectStore.ts'
import { SplitPane } from './SplitPane.tsx'
import { getSlotLabels } from '../lineupUtils.ts'

export function LineupView() {
  const { project, setProject, submissions, rowCountMismatch, setRowCountMismatch } = useProjectContext()

  const [showStageConfig, setShowStageConfig] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [activeSlot, setActiveSlot] = useState<ActiveSlot | null>(null)

  // Derived list of active evenings in convention order
  const activeEvenings = useMemo(() => {
    const daySet = new Set<string>()
    for (const stage of project.stages) {
      for (const day of stage.activeDays) daySet.add(day)
    }
    return ['Thursday', 'Friday', 'Saturday', 'Sunday'].filter((d) => daySet.has(d))
  }, [project.stages])

  const [selectedEvening, setSelectedEvening] = useState<string>(() => activeEvenings[0] ?? 'Thursday')

  /** Returns the next empty sequential ActiveSlot on the given evening, or null if none. */
  function findNextEmptySlot(
    stages: Stage[],
    assignments: SlotAssignment[],
    evening: string,
    currentSlot: ActiveSlot
  ): ActiveSlot | null {
    const sequentialStages = stages.filter(
      (s) => s.activeDays.includes(evening) && (s.stageType ?? 'sequential') === 'sequential'
    )
    // Build an ordered list of all sequential slots for this evening
    const allSlots: ActiveSlot[] = []
    for (const stage of sequentialStages) {
      const labels = getSlotLabels(stage, evening)
      labels.forEach((timeLabel, slotIndex) => {
        allSlots.push({ stageId: stage.id, evening, slotIndex, timeLabel })
      })
    }
    // Find occupied slot indices
    const occupied = new Set(
      assignments
        .filter((a) => a.evening === evening && a.slotIndex != null)
        .map((a) => `${a.stageId}|${a.slotIndex}`)
    )
    // Find index of current slot in the list
    const currentIdx = allSlots.findIndex(
      (s) => s.stageId === currentSlot.stageId && s.slotIndex === currentSlot.slotIndex
    )
    // Scan from next slot onward (wrapping), looking for first empty slot
    const len = allSlots.length
    for (let i = 1; i < len; i++) {
      const candidate = allSlots[(currentIdx + i) % len]
      if (!occupied.has(`${candidate.stageId}|${candidate.slotIndex}`)) {
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
        { stageId, evening, slotIndex, submissionNumber },
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

  /** Adds a DJ to a simultaneous stage position (1–3). Enforces the max-3 cap. */
  function handleAddSimultaneous(
    stageId: string,
    evening: string,
    positionIndex: 1 | 2 | 3,
    submissionNumber: string
  ) {
    setProject((prev) => {
      if (!prev) return prev
      const existing = prev.assignments.filter(
        (a) => a.stageId === stageId && a.evening === evening && a.positionIndex != null
      )
      // Enforce max-3 cap at the data layer
      if (existing.length >= 3) return prev
      const assignments = [
        ...prev.assignments.filter(
          (a) => !(a.stageId === stageId && a.evening === evening && a.positionIndex === positionIndex)
        ),
        { stageId, evening, positionIndex, submissionNumber },
      ]
      return { ...prev, assignments }
    })
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

  function handleSaveStages(stages: Stage[]) {
    setProject((prev) => {
      if (!prev) return prev
      const stageIds = new Set(stages.map((s) => s.id))
      const assignments = prev.assignments.filter((a) => stageIds.has(a.stageId))
      return { ...prev, stages, assignments }
    })
    setShowStageConfig(false)
  }

  async function handleClearLineup() {
    setProject((prev) => {
      if (!prev) return prev
      const cleared = { ...prev, stages: [], assignments: [], rowCount: submissions?.length ?? 0 }
      saveProject(cleared)
      return cleared
    })
    setRowCountMismatch(false)
    setShowClearConfirm(false)
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
      <div className={`lineup-main${activeSlot ? ' lineup-main--has-panel' : ''}`}>
        {activeSlot ? (
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
                onSelectEvening={setSelectedEvening}
                onAssign={handleAssign}
                onRemove={handleRemove}
                onAddSimultaneous={handleAddSimultaneous}
                onRemoveSimultaneous={handleRemoveSimultaneous}
                onConfigureStages={() => setShowStageConfig(true)}
                onSlotClick={setActiveSlot}
                onSimultaneousClick={handleSimultaneousClick}
                activeSlotKey={
                  activeSlot
                    ? `${activeSlot.stageId}|${activeSlot.evening}|${activeSlot.slotIndex}`
                    : null
                }
              />
            </div>
            <DJSelectionPanel
              submissions={submissions}
              stages={project.stages}
              assignments={project.assignments}
              discardedSubmissionNumbers={new Set(project.discardedSubmissions ?? [])}
              activeSlot={activeSlot}
              onAssign={handleAssign}
              onRemove={handleRemove}
              onAddSimultaneous={handleAddSimultaneous}
              onClose={() => setActiveSlot(null)}
            />
          </SplitPane>
        ) : (
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
              onSelectEvening={setSelectedEvening}
              onAssign={handleAssign}
              onRemove={handleRemove}
              onAddSimultaneous={handleAddSimultaneous}
              onRemoveSimultaneous={handleRemoveSimultaneous}
              onConfigureStages={() => setShowStageConfig(true)}
              onSlotClick={setActiveSlot}
              onSimultaneousClick={handleSimultaneousClick}
              activeSlotKey={null}
            />
          </div>
        )}
      </div>
      <div className="lineup-footer">
        <button
          type="button"
          className="btn-danger btn-small"
          onClick={() => setShowClearConfirm(true)}
        >
          Clear Lineup
        </button>
      </div>

      {showClearConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <p>Clear all lineup data and stage configuration? This cannot be undone.</p>
            <div className="confirm-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowClearConfirm(false)}>
                Cancel
              </button>
              <button type="button" className="btn-danger" onClick={handleClearLineup}>
                Clear Lineup
              </button>
            </div>
          </div>
        </div>
      )}

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
