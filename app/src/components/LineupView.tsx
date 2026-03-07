import { useState } from 'react'
import { useProjectContext } from '../ProjectContext.ts'
import { LineupGrid } from './LineupGrid.tsx'
import { StageConfigPanel } from './StageConfigPanel.tsx'
import { DJSelectionPanel } from './DJSelectionPanel.tsx'
import type { ActiveSlot } from './DJSelectionPanel.tsx'
import type { Stage } from '../types.ts'
import { saveProject } from '../projectStore.ts'
import { SplitPane } from './SplitPane.tsx'

export function LineupView() {
  const { project, setProject, submissions, rowCountMismatch, setRowCountMismatch } = useProjectContext()

  const [showStageConfig, setShowStageConfig] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [activeSlot, setActiveSlot] = useState<ActiveSlot | null>(null)

  function handleSimultaneousClick(slot: { stageId: string; evening: string; positionIndex: 1 | 2 | 3; timeLabel: string }) {
    setActiveSlot(slot)
  }

  if (submissions === null) return null

  function handleAssign(stageId: string, evening: string, slotIndex: number, djName: string) {
    setProject((prev) => {
      if (!prev) return prev
      const assignments = [
        ...prev.assignments.filter(
          (a) => !(a.stageId === stageId && a.evening === evening && a.slotIndex === slotIndex)
        ),
        { stageId, evening, slotIndex, djName },
      ]
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
  }

  /** Adds a DJ to a simultaneous stage position (1–3). Enforces the max-3 cap. */
  function handleAddSimultaneous(
    stageId: string,
    evening: string,
    positionIndex: 1 | 2 | 3,
    djName: string
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
        { stageId, evening, positionIndex, djName },
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
