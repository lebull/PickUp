import type { Submission, SlotAssignment } from '../types.ts'

interface Props {
  submissions: Submission[]
  assignments: SlotAssignment[]
  evening: string
  /** If set, clicking a DJ assigns them to this pending slot. */
  pendingSlot: { stageId: string; evening: string; slotIndex: number } | null
  onAssign: (stageId: string, evening: string, slotIndex: number, submissionNumber: string) => void
}

export function DJPool({ submissions, assignments, evening, pendingSlot, onAssign }: Props) {
  // All submission numbers assigned anywhere in the lineup (sequential slotIndex or simultaneous positionIndex).
  // This assignment-type-agnostic check correctly excludes DJs on silent disco stages too.
  const assignedGlobally = new Set(assignments.map((a) => a.submissionNumber))

  // DJs available on this evening and not yet assigned anywhere
  const pool = submissions.filter(
    (s) =>
      s.daysAvailable.toLowerCase().includes(evening.toLowerCase()) &&
      !assignedGlobally.has(s.submissionNumber)
  )

  // All submissions available on this evening (for count display)
  const availableCount = submissions.filter((s) =>
    s.daysAvailable.toLowerCase().includes(evening.toLowerCase())
  ).length
  const assignedCount = availableCount - pool.length

  return (
    <div className="dj-pool">
      <div className="dj-pool-header">
        <h3>DJ Pool</h3>
        <span className="pool-stats">
          {pool.length} unscheduled · {assignedCount} scheduled
        </span>
      </div>

      {pendingSlot && (
        <p className="pool-hint">Click a DJ to assign them to the selected slot.</p>
      )}

      {pool.length === 0 ? (
        <p className="pool-empty">All available DJs have been scheduled.</p>
      ) : (
        <ul className="pool-list">
          {pool.map((s) => (
            <li key={s.submissionNumber} className="pool-item">
              <button
                type="button"
                className={`pool-dj-btn${pendingSlot ? ' pool-dj-btn--selectable' : ''}`}
                onClick={() => {
                  if (pendingSlot) {
                    onAssign(pendingSlot.stageId, pendingSlot.evening, pendingSlot.slotIndex, s.submissionNumber)
                  }
                }}
                disabled={!pendingSlot}
              >
                <span className="pool-dj-name">{s.djName}</span>
                {s.genre && <span className="pool-dj-genre">{s.genre}</span>}
                {s.mainScore.avg !== null && (
                  <span className="pool-dj-score">{s.mainScore.avg.toFixed(2)}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
