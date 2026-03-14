import type { Submission, Stage, SlotAssignment } from '../types.ts'

interface Props {
  submissions: Submission[]
  stages: Stage[]
  assignments: SlotAssignment[]
  onAssign: (stageId: string, evening: string, slotIndex: number, djName: string) => void
  onRemove: (stageId: string, evening: string, slotIndex: number) => void
}

interface ActiveSlot {
  stageId: string
  evening: string
  slotIndex: number
  timeLabel: string
}

export function SlotPicker({
  submissions,
  stages,
  assignments,
  onAssign,
  onRemove,
  activeSlot,
  onClose,
}: Props & { activeSlot: ActiveSlot; onClose: () => void }) {
  const stage = stages.find((s) => s.id === activeSlot.stageId)
  const currentAssignment = assignments.find(
    (a) =>
      a.stageId === activeSlot.stageId &&
      a.evening === activeSlot.evening &&
      a.slotIndex === activeSlot.slotIndex
  )

  // Submissions already assigned anywhere in the lineup (globally)
  const assignedNumbers = new Set(assignments.flatMap(a => a.type === 'dj' ? [a.submissionNumber] : []))

  // Available pool: available on this evening, not assigned anywhere
  const available = submissions.filter((s) => {
    if (currentAssignment && currentAssignment.type === 'dj' && s.submissionNumber === currentAssignment.submissionNumber) return false
    if (assignedNumbers.has(s.submissionNumber)) return false
    return s.daysAvailable.toLowerCase().includes(activeSlot.evening.toLowerCase())
  })

  return (
    <div className="slot-picker-overlay" onClick={onClose}>
      <div className="slot-picker" onClick={(e) => e.stopPropagation()}>
        <div className="slot-picker-header">
          <span>
            {stage?.name} — {activeSlot.evening} {activeSlot.timeLabel}
          </span>
          <button type="button" className="close-btn" onClick={onClose}>✕</button>
        </div>

        {currentAssignment && currentAssignment.type === 'dj' && (
          <div className="slot-picker-current">
            <span>Currently: <strong>{submissions.find((s) => s.submissionNumber === currentAssignment.submissionNumber)?.djName ?? currentAssignment.submissionNumber}</strong></span>
            <button
              type="button"
              className="btn-danger btn-small"
              onClick={() => {
                onRemove(activeSlot.stageId, activeSlot.evening, activeSlot.slotIndex)
                onClose()
              }}
            >
              Remove
            </button>
          </div>
        )}

        <div className="slot-picker-list">
          {available.length === 0 ? (
            <p className="slot-picker-empty">No available DJs for this evening.</p>
          ) : (
            available.map((s) => (
              <button
                key={s.submissionNumber}
                type="button"
                className="slot-picker-dj"
                onClick={() => {
                  onAssign(activeSlot.stageId, activeSlot.evening, activeSlot.slotIndex, s.submissionNumber)
                  onClose()
                }}
              >
                {s.djName}
                {s.genre && <span className="slot-picker-genre">{s.genre}</span>}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
