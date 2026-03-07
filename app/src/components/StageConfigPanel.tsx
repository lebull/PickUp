import { useState } from 'react'
import type { Stage, SlotAssignment } from '../types.ts'
import { CONVENTION_DAYS, getSlotLabels } from '../lineupUtils.ts'

interface Props {
  stages: Stage[]
  assignments: SlotAssignment[]
  onSave: (stages: Stage[]) => void
  onClose: () => void
}

function newStage(): Stage {
  return {
    id: crypto.randomUUID(),
    name: '',
    stageType: 'sequential',
    activeDays: [],
    schedule: {},
    slotDuration: 60,
  }
}

export function StageConfigPanel({ stages, assignments, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<Stage[]>(() => stages.map((s) => ({ ...s, schedule: { ...s.schedule } })))
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  function updateStage(id: string, patch: Partial<Stage>) {
    setDraft((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  function toggleDay(stageId: string, day: string, checked: boolean) {
    setDraft((prev) =>
      prev.map((s) => {
        if (s.id !== stageId) return s
        const activeDays = checked
          ? [...s.activeDays, day]
          : s.activeDays.filter((d) => d !== day)
        const schedule = { ...s.schedule }
        if (checked && !schedule[day]) {
          schedule[day] = { startTime: '', endTime: '' }
        }
        return { ...s, activeDays, schedule }
      })
    )
  }

  function updateSchedule(
    stageId: string,
    day: string,
    field: 'startTime' | 'endTime',
    value: string
  ) {
    setDraft((prev) =>
      prev.map((s) => {
        if (s.id !== stageId) return s
        const schedule = {
          ...s.schedule,
          [day]: { ...(s.schedule[day] ?? { startTime: '', endTime: '' }), [field]: value },
        }
        return { ...s, schedule }
      })
    )
  }

  function addStage() {
    setDraft((prev) => [...prev, newStage()])
  }

  function requestDelete(stageId: string) {
    const hasAssignments = assignments.some((a) => a.stageId === stageId)
    if (hasAssignments) {
      setPendingDelete(stageId)
    } else {
      setDraft((prev) => prev.filter((s) => s.id !== stageId))
    }
  }

  function confirmDelete(stageId: string) {
    setDraft((prev) => prev.filter((s) => s.id !== stageId))
    setPendingDelete(null)
  }

  return (
    <div className="stage-config-overlay">
      <div className="stage-config-panel">
        <div className="stage-config-header">
          <h2>Configure Stages</h2>
          <button type="button" className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="stage-config-list">
          {draft.map((stage) => {
            const assignmentCount = assignments.filter((a) => a.stageId === stage.id).length

            return (
              <div key={stage.id} className="stage-config-row">
                {pendingDelete === stage.id ? (
                  <div className="delete-confirm">
                    <span>
                      This stage has {assignmentCount} assignment{assignmentCount !== 1 ? 's' : ''}.
                      Delete anyway?
                    </span>
                    <button type="button" className="btn-danger" onClick={() => confirmDelete(stage.id)}>
                      Delete
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => setPendingDelete(null)}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="stage-field-row">
                      <label className="stage-field-label">Name</label>
                      <input
                        className="stage-name-input"
                        value={stage.name}
                        onChange={(e) => updateStage(stage.id, { name: e.target.value })}
                        placeholder="Stage name"
                      />
                      <label className="stage-field-label">Type</label>
                      <select
                        className="stage-type-select"
                        value={stage.stageType ?? 'sequential'}
                        onChange={(e) =>
                          updateStage(stage.id, {
                            stageType: e.target.value as 'sequential' | 'simultaneous',
                          })
                        }
                      >
                        <option value="sequential">Sequential</option>
                        <option value="simultaneous">Simultaneous</option>
                      </select>
                      {(stage.stageType ?? 'sequential') === 'sequential' && (
                        <>
                          <label className="stage-field-label">Slot (min)</label>
                          <input
                            type="number"
                            className="slot-duration-input"
                            value={stage.slotDuration}
                            min={15}
                            step={15}
                            onChange={(e) =>
                              updateStage(stage.id, { slotDuration: Number(e.target.value) })
                            }
                          />
                        </>
                      )}
                      {(stage.stageType ?? 'sequential') === 'simultaneous' && (
                        <span className="simultaneous-note">Up to 3 DJs play simultaneously</span>
                      )}
                      <button
                        type="button"
                        className="btn-danger btn-small"
                        onClick={() => requestDelete(stage.id)}
                      >
                        Delete
                      </button>
                    </div>

                    <div className="stage-days-section">
                      <span className="stage-field-label">Schedule by day</span>
                      {CONVENTION_DAYS.map((day) => {
                        const isActive = stage.activeDays.includes(day)
                        const daySchedule = stage.schedule[day] ?? { startTime: '', endTime: '' }
                        const labels = isActive ? getSlotLabels(stage, day) : []
                        const crossesMidnight =
                          isActive &&
                          daySchedule.startTime &&
                          daySchedule.endTime &&
                          daySchedule.endTime <= daySchedule.startTime

                        return (
                          <div key={day} className={`day-schedule-row${isActive ? ' day-schedule-row--active' : ''}`}>
                            <label className="day-checkbox-label">
                              <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => toggleDay(stage.id, day, e.target.checked)}
                              />
                              <span className="day-schedule-name">{day}</span>
                            </label>
                            {isActive && (
                              <>
                                <input
                                  type="time"
                                  value={daySchedule.startTime}
                                  onChange={(e) =>
                                    updateSchedule(stage.id, day, 'startTime', e.target.value)
                                  }
                                />
                                <span className="stage-field-label">to</span>
                                <input
                                  type="time"
                                  value={daySchedule.endTime}
                                  onChange={(e) =>
                                    updateSchedule(stage.id, day, 'endTime', e.target.value)
                                  }
                                />
                                {crossesMidnight && (
                                  <span className="midnight-hint" title="Event crosses midnight">↷ next day</span>
                                )}
                                {/* Slot count only meaningful for sequential stages */}
                                {(stage.stageType ?? 'sequential') === 'sequential' && labels.length > 0 && (
                                  <span className="slot-count-hint">
                                    {labels.length} slot{labels.length !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        <div className="stage-config-footer">
          <button type="button" className="btn-secondary" onClick={addStage}>
            + Add Stage
          </button>
          <div className="stage-config-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={() => onSave(draft)}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


