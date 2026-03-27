import { useState, useRef } from 'react'
import type { Stage, StageSchedule, SlotAssignment } from '../types.ts'
import { CONVENTION_DAYS, getSlotLabels, getEventLabel, eventsOverlap, getStageEventType } from '../lineupUtils.ts'
import { STAGE_COLOR_PALETTE } from '../stageColors.ts'

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

function makeTimedEvent(): StageSchedule {
  return { eventType: 'timed', startTime: '', endTime: '' }
}

/** Returns true if the given event overlaps any other event in the list (not including itself at `selfIdx`). */
function hasOverlap(events: StageSchedule[], selfIdx: number): boolean {
  const current = events[selfIdx]
  if (getStageEventType(current) === 'special' || !current.startTime || !current.endTime) return false
  for (let i = 0; i < events.length; i++) {
    if (i === selfIdx) continue
    const other = events[i]
    if (getStageEventType(other) === 'special' || !other.startTime || !other.endTime) continue
    if (eventsOverlap(
      { startTime: current.startTime, endTime: current.endTime },
      { startTime: other.startTime, endTime: other.endTime }
    )) return true
  }
  return false
}

export function StageConfigPanel({ stages, assignments, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<Stage[]>(() =>
    stages.map((s) => ({
      ...s,
      schedule: Object.fromEntries(
        Object.entries(s.schedule ?? {}).map(([day, events]) => [day, events.map((e) => ({ ...e }))])
      ),
    }))
  )
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const dragIndexRef = useRef<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  function updateStage(id: string, patch: Partial<Stage>) {
    setDraft((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  function toggleDay(stageId: string, day: string, checked: boolean) {
    setDraft((prev) =>
      prev.map((s) => {
        if (s.id !== stageId) return s
        const activeDays = checked
          ? [...(s.activeDays ?? []), day]
          : (s.activeDays ?? []).filter((d) => d !== day)
        const schedule = { ...(s.schedule ?? {}) }
        if (checked && (!schedule[day] || schedule[day].length === 0)) {
          schedule[day] = [makeTimedEvent()]
        }
        return { ...s, activeDays, schedule }
      })
    )
  }

  function updateEventField(
    stageId: string,
    day: string,
    eventIdx: number,
    field: 'startTime' | 'endTime' | 'label' | 'eventType',
    value: string
  ) {
    setDraft((prev) =>
      prev.map((s) => {
        if (s.id !== stageId) return s
        const events = [...((s.schedule?.[day]) ?? [makeTimedEvent()])]
        const nextEvent = { ...events[eventIdx] }
        if (field === 'eventType') {
          const eventType = value === 'special' ? 'special' : 'timed'
          nextEvent.eventType = eventType
          if (eventType === 'special') {
            nextEvent.startTime = ''
            nextEvent.endTime = ''
          }
        } else {
          nextEvent[field] = value
        }
        events[eventIdx] = nextEvent
        return { ...s, schedule: { ...(s.schedule ?? {}), [day]: events } }
      })
    )
  }

  function addEvent(stageId: string, day: string) {
    setDraft((prev) =>
      prev.map((s) => {
        if (s.id !== stageId) return s
        const events = [...((s.schedule?.[day]) ?? []), makeTimedEvent()]
        return { ...s, schedule: { ...(s.schedule ?? {}), [day]: events } }
      })
    )
  }

  function removeEvent(stageId: string, day: string, eventIdx: number) {
    setDraft((prev) =>
      prev.map((s) => {
        if (s.id !== stageId) return s
        const events = ((s.schedule?.[day]) ?? []).filter((_, i) => i !== eventIdx)
        // Keep at least one empty slot when the last event is removed
        return {
          ...s,
          schedule: {
            ...(s.schedule ?? {}),
            [day]: events.length > 0 ? events : [makeTimedEvent()],
          },
        }
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

  function setStageColor(id: string, color: string | undefined) {
    setDraft((prev) => prev.map((s) => (s.id === id ? { ...s, color } : s)))
  }

  // ── Drag-to-reorder handlers ──────────────────────────────
  function handleDragStart(index: number) {
    dragIndexRef.current = index
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  function handleDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault()
    const fromIndex = dragIndexRef.current
    if (fromIndex === null || fromIndex === dropIndex) {
      dragIndexRef.current = null
      setDragOverIndex(null)
      return
    }
    setDraft((prev) => {
      const next = [...prev]
      const [removed] = next.splice(fromIndex, 1)
      next.splice(dropIndex, 0, removed)
      return next
    })
    dragIndexRef.current = null
    setDragOverIndex(null)
  }

  function handleDragEnd() {
    dragIndexRef.current = null
    setDragOverIndex(null)
  }

  return (
    <div className="stage-config-overlay">
      <div className="stage-config-panel">
        <div className="stage-config-header">
          <h2>Configure Stages</h2>
          <button type="button" className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="stage-config-list">
          {draft.map((stage, index) => {
            const assignmentCount = assignments.filter((a) => a.stageId === stage.id).length

            return (
              <div
                key={stage.id}
                className={`stage-config-row${dragOverIndex === index ? ' stage-config-row--drag-over' : ''}`}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
              >
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
                    <div className="stage-card-header">
                      <span
                        className="stage-drag-handle"
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragEnd={handleDragEnd}
                        title="Drag to reorder"
                      >
                        ⠿
                      </span>
                      <input
                        className="stage-name-input"
                        value={stage.name}
                        onChange={(e) => updateStage(stage.id, { name: e.target.value })}
                        placeholder="Stage name"
                      />
                      <button
                        type="button"
                        className="btn-danger btn-small"
                        onClick={() => requestDelete(stage.id)}
                      >
                        Delete
                      </button>
                    </div>

                    <div className="stage-settings-row">
                      <div className="stage-setting">
                        <span className="stage-field-label">Type</span>
                        <select
                          className="stage-type-select"
                          value={stage.stageType ?? 'sequential'}
                          onChange={(e) =>
                            updateStage(stage.id, {
                              stageType: e.target.value as 'sequential' | 'simultaneous' | 'special',
                            })
                          }
                        >
                          <option value="sequential">Sequential</option>
                          <option value="simultaneous">Simultaneous</option>
                          <option value="special">Special</option>
                        </select>
                      </div>
                      {(stage.stageType ?? 'sequential') === 'sequential' && (
                        <div className="stage-setting">
                          <span className="stage-field-label">Slot (min)</span>
                          <input
                            type="number"
                            className="slot-duration-input"
                            value={stage.slotDuration ?? 60}
                            min={15}
                            step={15}
                            onChange={(e) =>
                              updateStage(stage.id, { slotDuration: Number(e.target.value) })
                            }
                          />
                        </div>
                      )}
                      <label className="stage-moonlight-toggle">
                        <input
                          type="checkbox"
                          checked={stage.useMoonlightScores ?? false}
                          onChange={(e) => updateStage(stage.id, { useMoonlightScores: e.target.checked })}
                        />
                        Use Moonlight Scores
                      </label>
                    </div>

                    {(stage.stageType ?? 'sequential') === 'special' && (
                      <div className="stage-days-section">
                        <span className="stage-field-label">Special event setup</span>
                        <p className="stage-helper-text">
                          Special stages are not day-bound and use open-ended picks.
                        </p>
                      </div>
                    )}

                    {(stage.stageType ?? 'sequential') !== 'special' && (
                      <div className="stage-days-section">
                        <span className="stage-field-label">Schedule by day</span>
                        <p className="stage-helper-text">
                          Enable a day, then set each event row Event Type to Timed Event or Special Event.
                        </p>
                      {CONVENTION_DAYS.map((day) => {
                        const isActive = (stage.activeDays ?? []).includes(day)
                        const events = isActive ? ((stage.schedule?.[day]) ?? [makeTimedEvent()]) : []

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
                              <div className="day-events-list">
                                {events.map((event, evtIdx) => {
                                  const eventType = getStageEventType(event)
                                  const crossesMidnight =
                                    eventType !== 'special' &&
                                    event.startTime &&
                                    event.endTime &&
                                    event.endTime <= event.startTime
                                  const overlap = eventType !== 'special' && hasOverlap(events, evtIdx)
                                  const labels = (stage.stageType ?? 'sequential') === 'sequential'
                                    ? getSlotLabels(stage, day, evtIdx)
                                    : []
                                  return (
                                    <div key={evtIdx} className="day-event-row">
                                      {events.length > 1 && (
                                        <span className="day-event-label-badge">
                                          {getEventLabel(event, evtIdx)}
                                        </span>
                                      )}
                                      <select
                                        className="stage-type-select"
                                        value={eventType}
                                        onChange={(e) =>
                                          updateEventField(stage.id, day, evtIdx, 'eventType', e.target.value)
                                        }
                                        aria-label="Event Type"
                                      >
                                        <option value="timed">Timed Event</option>
                                        <option value="special">Special Event</option>
                                      </select>
                                      {eventType !== 'special' && (
                                        <>
                                          <input
                                            type="time"
                                            value={event.startTime ?? ''}
                                            onChange={(e) =>
                                              updateEventField(stage.id, day, evtIdx, 'startTime', e.target.value)
                                            }
                                          />
                                          <span className="stage-field-label">–</span>
                                          <input
                                            type="time"
                                            value={event.endTime ?? ''}
                                            onChange={(e) =>
                                              updateEventField(stage.id, day, evtIdx, 'endTime', e.target.value)
                                            }
                                          />
                                        </>
                                      )}
                                      <input
                                        type="text"
                                        className="event-label-input"
                                        value={event.label ?? ''}
                                        placeholder={eventType === 'special' ? 'Label (e.g. VIP Showcase)' : 'Label (e.g. Evening Set)'}
                                        onChange={(e) =>
                                          updateEventField(stage.id, day, evtIdx, 'label', e.target.value)
                                        }
                                      />
                                      {crossesMidnight && (
                                        <span className="midnight-hint" title="Event crosses midnight">↷ next day</span>
                                      )}
                                      {(stage.stageType ?? 'sequential') === 'sequential' && labels.length > 0 && (
                                        <span className="slot-count-hint">
                                          {labels.length} slot{labels.length !== 1 ? 's' : ''}
                                        </span>
                                      )}
                                      {eventType === 'special' && (
                                        <span className="slot-count-hint">Special event (no fixed slot count)</span>
                                      )}
                                      {events.length > 1 && (
                                        <button
                                          type="button"
                                          className="btn-danger btn-small"
                                          title="Remove this event"
                                          onClick={() => removeEvent(stage.id, day, evtIdx)}
                                        >
                                          ✕
                                        </button>
                                      )}
                                      {overlap && (
                                        <span className="overlap-error">⚠ Overlaps</span>
                                      )}
                                    </div>
                                  )
                                })}
                                <button
                                  type="button"
                                  className="btn-secondary btn-small add-event-btn"
                                  onClick={() => addEvent(stage.id, day)}
                                >
                                  + Add Same Day Event
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    )}

                    <div className="stage-color-swatches">
                      <span className="stage-field-label">Color</span>
                      {/* "No color" neutral swatch */}
                      <button
                        type="button"
                        className={`stage-color-swatch stage-color-swatch--none${!stage.color ? ' stage-color-swatch--selected' : ''}`}
                        title="No color"
                        onClick={() => setStageColor(stage.id, undefined)}
                      />
                      {STAGE_COLOR_PALETTE.map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          className={`stage-color-swatch${stage.color === hex ? ' stage-color-swatch--selected' : ''}`}
                          style={{ backgroundColor: hex }}
                          title={hex}
                          onClick={() =>
                            setStageColor(stage.id, stage.color === hex ? undefined : hex)
                          }
                        />
                      ))}
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


