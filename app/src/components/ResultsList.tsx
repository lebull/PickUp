import { useState } from 'react'
import { useProjectContext } from '../ProjectContext.ts'
import type { Submission } from '../types.ts'
import { SplitPane } from './SplitPane.tsx'
import { SubmissionDetail } from './SubmissionDetail.tsx'

// ── Data helpers ─────────────────────────────────────────────────────────────

interface DJRow {
  submission: Submission
  stageLabel?: string // for accepted rows
}

interface DuplicateAlertEntry {
  djName: string
  contactEmail: string
  telegramDiscord: string
}

function buildResultsData(
  submissions: Submission[],
  project: import('../types.ts').Project
) {
  const { assignments, stages, discardedSubmissions } = project
  const discardedSet = new Set(discardedSubmissions ?? [])
  const assignedNumbers = new Set(assignments.map((a) => a.submissionNumber))

  // Build djName → Submission[] groups
  const djNameGroups = new Map<string, Submission[]>()
  for (const sub of submissions) {
    const group = djNameGroups.get(sub.djName) ?? []
    group.push(sub)
    djNameGroups.set(sub.djName, group)
  }

  // Set of djNames that have at least one assigned submission
  const acceptedDjNames = new Set<string>()
  for (const sub of submissions) {
    if (assignedNumbers.has(sub.submissionNumber)) {
      acceptedDjNames.add(sub.djName)
    }
  }

  // Build a lookup: submissionNumber → Submission
  const subByNumber = new Map<string, Submission>()
  for (const sub of submissions) {
    subByNumber.set(sub.submissionNumber, sub)
  }

  // Accepted: per stage, collect assigned submissions in slot order
  const acceptedByStage: Array<{ stageId: string; stageName: string; rows: DJRow[] }> = []
  for (const stage of stages) {
    const stageAssignments = assignments
      .filter((a) => a.stageId === stage.id)
      .sort((a, b) => {
        if (a.evening !== b.evening) return a.evening < b.evening ? -1 : 1
        const si = (a.slotIndex ?? 0) - (b.slotIndex ?? 0)
        if (si !== 0) return si
        return (a.positionIndex ?? 0) - (b.positionIndex ?? 0)
      })
    const rows: DJRow[] = []
    for (const assignment of stageAssignments) {
      const sub = subByNumber.get(assignment.submissionNumber)
      if (sub) rows.push({ submission: sub })
    }
    if (rows.length > 0) {
      acceptedByStage.push({ stageId: stage.id, stageName: stage.name, rows })
    }
  }

  // Rejection list: one entry per djName that is NOT in acceptedDjNames
  const rejectionList: DJRow[] = []
  for (const [djName, group] of djNameGroups) {
    if (acceptedDjNames.has(djName)) continue
    // Prefer non-discarded submission; fall back to first
    const rep =
      group.find((s) => !discardedSet.has(s.submissionNumber)) ?? group[0]
    rejectionList.push({ submission: rep })
  }

  // Duplicates alert: djName groups with more than one submission
  const duplicateAlerts: DuplicateAlertEntry[] = []
  for (const [djName, group] of djNameGroups) {
    if (group.length < 2) continue
    // Use the first non-discarded entry's contact info, or first overall
    const rep = group.find((s) => !discardedSet.has(s.submissionNumber)) ?? group[0]
    duplicateAlerts.push({
      djName,
      contactEmail: rep.contactEmail,
      telegramDiscord: rep.telegramDiscord,
    })
  }

  return { acceptedByStage, rejectionList, duplicateAlerts, assignedNumbers }
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface DJRowItemProps {
  row: DJRow
  isSelected: boolean
  onClick: (sub: Submission) => void
}

function DJRowItem({ row, isSelected, onClick }: DJRowItemProps) {
  const { submission: s } = row
  return (
    <button
      className={`results-dj-row${isSelected ? ' selected' : ''}`}
      onClick={() => onClick(s)}
      type="button"
    >
      <span className="results-dj-name">{s.djName}</span>
      <span className="results-dj-contact">
        {s.contactEmail && <span className="results-contact-email">{s.contactEmail}</span>}
        {s.telegramDiscord && (
          <span className="results-contact-telegram">{s.telegramDiscord}</span>
        )}
      </span>
      <span className="results-dj-meta">
        {s.genre && <span className="results-meta-genre">{s.genre}</span>}
        {s.formatGear && <span className="results-meta-format">{s.formatGear}</span>}
      </span>
    </button>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ResultsList() {
  const { project, submissions } = useProjectContext()
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)

  if (!submissions) return null

  const { acceptedByStage, rejectionList, duplicateAlerts } =
    buildResultsData(submissions, project)

  const hasSelection = selectedSubmission !== null

  function handleSelectDJ(sub: Submission) {
    setSelectedSubmission((prev) =>
      prev?.submissionNumber === sub.submissionNumber ? null : sub
    )
  }

  function handleCloseDetail() {
    setSelectedSubmission(null)
  }

  const listPane = (
    <div className="results-list-inner">
      {/* Duplicate-submission alert */}
      {duplicateAlerts.length > 0 && (
        <div className="results-duplicate-alert" role="status">
          <strong>Manual review needed:</strong> The following DJs have multiple
          submissions. Check these addresses manually before sending emails.
          <ul className="results-duplicate-list">
            {duplicateAlerts.map((entry) => (
              <li key={entry.djName}>
                <span className="results-duplicate-name">{entry.djName}</span>
                {entry.contactEmail && (
                  <span className="results-duplicate-email">{entry.contactEmail}</span>
                )}
                {entry.telegramDiscord && (
                  <span className="results-duplicate-telegram">
                    {entry.telegramDiscord}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Accepted sections — one per stage */}
      {acceptedByStage.length === 0 ? (
        <div className="results-empty-state">
          <p className="results-empty-message">
            No lineup has been built yet. Assign DJs in the Lineup Builder to see
            results here.
          </p>
        </div>
      ) : (
        acceptedByStage.map(({ stageId, stageName, rows }) => (
          <section key={stageId} className="results-stage-section">
            <h2 className="results-stage-heading">{stageName}</h2>
            <div className="results-dj-list">
              {rows.map(({ submission: s }) => (
                <DJRowItem
                  key={s.submissionNumber}
                  row={{ submission: s }}
                  isSelected={selectedSubmission?.submissionNumber === s.submissionNumber}
                  onClick={handleSelectDJ}
                />
              ))}
            </div>
          </section>
        ))
      )}

      {/* Did Not Make the Cut */}
      {rejectionList.length > 0 && (
        <section className="results-stage-section results-rejection-section">
          <h2 className="results-stage-heading results-rejection-heading">
            Did Not Make the Cut
          </h2>
          <div className="results-dj-list">
            {rejectionList.map(({ submission: s }) => (
              <DJRowItem
                key={s.submissionNumber}
                row={{ submission: s }}
                isSelected={selectedSubmission?.submissionNumber === s.submissionNumber}
                onClick={handleSelectDJ}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )

  if (!hasSelection) {
    return (
      <div className="results-full-width">
        {listPane}
      </div>
    )
  }

  return (
    <SplitPane initialSplit={45} minLeft={30} minRight={25}>
      {listPane}
      <div className="split-pane-detail-inner">
        <SubmissionDetail
          submission={selectedSubmission}
          onBack={handleCloseDetail}
        />
      </div>
    </SplitPane>
  )
}
