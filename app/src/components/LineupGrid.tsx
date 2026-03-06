import { useState, useMemo } from 'react'
import type { Submission, Stage, SlotAssignment } from '../types.ts'
import { getSlotLabels, getEveningTimeAxis } from '../lineupUtils.ts'
import { SlotPicker } from './SlotPicker'

interface Props {
  submissions: Submission[]
  stages: Stage[]
  assignments: SlotAssignment[]
  onAssign: (stageId: string, evening: string, slotIndex: number, djName: string) => void
  onRemove: (stageId: string, evening: string, slotIndex: number) => void
  onConfigureStages: () => void
}

interface ActiveSlot {
  stageId: string
  evening: string
  slotIndex: number
  timeLabel: string
}

export function LineupGrid({
  submissions,
  stages,
  assignments,
  onAssign,
  onRemove,
  onConfigureStages,
}: Props) {
  const activeEvenings = useMemo(() => {
    const daySet = new Set<string>()
    for (const stage of stages) {
      for (const day of stage.activeDays) daySet.add(day)
    }
    return ['Thursday', 'Friday', 'Saturday', 'Sunday'].filter((d) => daySet.has(d))
  }, [stages])

  const [selectedEvening, setSelectedEvening] = useState<string>(() => activeEvenings[0] ?? '')
  const [activeSlot, setActiveSlot] = useState<ActiveSlot | null>(null)

  const evening = activeEvenings.includes(selectedEvening)
    ? selectedEvening
    : activeEvenings[0] ?? ''

  const eveningStages = useMemo(
    () => stages.filter((s) => s.activeDays.includes(evening)),
    [stages, evening]
  )

  // Unified time axis: sorted union of all slot times from all active stages this evening
  const timeAxis = useMemo(
    () => getEveningTimeAxis(eveningStages, evening),
    [eveningStages, evening]
  )

  function getAssignment(stageId: string, slotIndex: number): SlotAssignment | undefined {
    return assignments.find(
      (a) => a.stageId === stageId && a.evening === evening && a.slotIndex === slotIndex
    )
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

  return (
    <div className="lineup-grid-container">
      <div className="evening-selector">
        {activeEvenings.map((day) => (
          <button
            key={day}
            type="button"
            className={`evening-btn${day === evening ? ' active' : ''}`}
            onClick={() => setSelectedEvening(day)}
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
          style={{ gridTemplateColumns: `80px repeat(${eveningStages.length}, 1fr)` }}
        >
          {/* Header row */}
          <div className="grid-cell grid-header grid-corner" />
          {eveningStages.map((stage) => (
            <div key={stage.id} className="grid-cell grid-header grid-stage-header">
              {stage.name || <em>Unnamed Stage</em>}
            </div>
          ))}

          {/* No times configured for any stage this evening */}
          {timeAxis.length === 0 ? (
            <>
              <div className="grid-cell grid-time-label">—</div>
              {eveningStages.map((stage) => (
                <div key={stage.id} className="grid-cell grid-slot grid-slot--unconfigured">
                  <span className="slot-config-hint">Set times for {evening}</span>
                </div>
              ))}
            </>
          ) : (
            timeAxis.map((timeLabel) => (
              <>
                <div key={`time-${timeLabel}`} className="grid-cell grid-time-label">
                  {timeLabel}
                </div>
                {eveningStages.map((stage) => {
                  const stageLabels = getSlotLabels(stage, evening)
                  const slotIndex = stageLabels.indexOf(timeLabel)

                  if (stageLabels.length === 0) {
                    // Stage active on this evening but no times configured
                    return (
                      <div
                        key={`${stage.id}-${timeLabel}`}
                        className="grid-cell grid-slot grid-slot--unconfigured"
                      />
                    )
                  }

                  if (slotIndex === -1) {
                    // This time is outside this stage's active window
                    return (
                      <div
                        key={`${stage.id}-${timeLabel}`}
                        className="grid-cell grid-slot grid-slot--out-of-range"
                      />
                    )
                  }

                  const assignment = getAssignment(stage.id, slotIndex)
                  return assignment ? (
                    <button
                      key={`${stage.id}-${timeLabel}`}
                      type="button"
                      className="grid-cell grid-slot grid-slot--occupied"
                      onClick={() =>
                        setActiveSlot({ stageId: stage.id, evening, slotIndex, timeLabel })
                      }
                    >
                      {assignment.djName}
                    </button>
                  ) : (
                    <button
                      key={`${stage.id}-${timeLabel}`}
                      type="button"
                      className="grid-cell grid-slot grid-slot--empty"
                      onClick={() =>
                        setActiveSlot({ stageId: stage.id, evening, slotIndex, timeLabel })
                      }
                    >
                      +
                    </button>
                  )
                })}
              </>
            ))
          )}
        </div>
      )}

      {activeSlot && (
        <SlotPicker
          submissions={submissions}
          stages={stages}
          assignments={assignments}
          activeSlot={activeSlot}
          onAssign={onAssign}
          onRemove={onRemove}
          onClose={() => setActiveSlot(null)}
        />
      )}
    </div>
  )
}


