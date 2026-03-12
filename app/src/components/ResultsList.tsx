import { useState } from 'react'
import { useProjectContext } from '../ProjectContext.ts'
import type { Submission, BlankSlotAssignment, Stage } from '../types.ts'
import { isBlankAssignment, getBlankLabel } from '../types.ts'
import { SplitPane } from './SplitPane.tsx'
import { SubmissionDetail } from './SubmissionDetail.tsx'
import { getSlotLabels } from '../lineupUtils.ts'

// ── Data helpers ─────────────────────────────────────────────────────────────

interface DJRow {
  submission: Submission
  stageLabel?: string // for accepted rows
}

interface BlankRow {
  blankAssignment: BlankSlotAssignment
  slotTime: string
}

type ResultRow = DJRow | BlankRow

function getSlotTimeLabel(assignment: BlankSlotAssignment, stage: Stage): string {
  if (assignment.positionIndex != null) return `Position ${assignment.positionIndex}`
  if (assignment.slotIndex != null) {
    const labels = getSlotLabels(stage, assignment.evening)
    const label = labels[assignment.slotIndex]
    return label ? `${assignment.evening} · ${label}` : assignment.evening
  }
  return assignment.evening
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

  // Only DJ assignments count toward "assigned" submission numbers
  const assignedNumbers = new Set<string>()
  for (const a of assignments) {
    if (!isBlankAssignment(a)) assignedNumbers.add(a.submissionNumber)
  }

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

  // Accepted: per stage, collect assigned submissions and blank slots in slot order
  const acceptedByStage: Array<{ stageId: string; stageName: string; rows: ResultRow[] }> = []
  for (const stage of stages) {
    const stageAssignments = assignments
      .filter((a) => a.stageId === stage.id)
      .sort((a, b) => {
        if (a.evening !== b.evening) return a.evening < b.evening ? -1 : 1
        const si = (a.slotIndex ?? 0) - (b.slotIndex ?? 0)
        if (si !== 0) return si
        return (a.positionIndex ?? 0) - (b.positionIndex ?? 0)
      })
    const rows: ResultRow[] = []
    for (const assignment of stageAssignments) {
      if (isBlankAssignment(assignment)) {
        rows.push({ blankAssignment: assignment, slotTime: getSlotTimeLabel(assignment, stage) })
      } else {
        const sub = subByNumber.get(assignment.submissionNumber)
        if (sub) rows.push({ submission: sub })
      }
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

  // Per-stage DJ counts (blank slots excluded)
  const djCountByStage = new Map<string, number>()
  for (const { stageId, rows } of acceptedByStage) {
    djCountByStage.set(stageId, rows.filter((r) => !('blankAssignment' in r)).length)
  }
  const totalDjCount = [...djCountByStage.values()].reduce((a, b) => a + b, 0)

  return { acceptedByStage, rejectionList, duplicateAlerts, assignedNumbers, djCountByStage, totalDjCount }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CopyIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

interface DJRowItemProps {
  row: DJRow
  isSelected: boolean
  onClick: (sub: Submission) => void
}

function DJRowItem({ row, isSelected, onClick }: DJRowItemProps) {
  const { submission: s } = row
  const [emailCopied, setEmailCopied] = useState(false)
  const canCopy = typeof navigator !== 'undefined' && !!navigator.clipboard

  return (
    <button
      className={`results-dj-row${isSelected ? ' selected' : ''}`}
      onClick={() => onClick(s)}
      type="button"
    >
      <span className="results-dj-name">{s.djName}</span>
      <span className="results-dj-contact">
        {s.contactEmail && (
          <span className="results-contact-row">
            <span className="results-contact-email">{s.contactEmail}</span>
            <button
              type="button"
              className={`results-copy-email-btn${emailCopied ? ' copied' : ''}`}
              title={canCopy ? 'Copy email address' : 'Clipboard not available'}
              disabled={!canCopy}
              aria-label="Copy email address"
              onClick={(e) => {
                e.stopPropagation()
                if (!canCopy) return
                navigator.clipboard.writeText(s.contactEmail).then(() => {
                  setEmailCopied(true)
                  setTimeout(() => setEmailCopied(false), 2000)
                })
              }}
            >
              {emailCopied ? '\u2713' : <CopyIcon />}
            </button>
          </span>
        )}
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

interface EmailModalProps {
  stageName: string
  emails: string
  onClose: () => void
}

function EmailModal({ stageName, emails, onClose }: EmailModalProps) {
  const canCopy = typeof navigator !== 'undefined' && !!navigator.clipboard
  const [copied, setCopied] = useState(false)

  return (
    <div
      className="results-email-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${stageName} emails`}
    >
      <div className="results-email-modal" onClick={(e) => e.stopPropagation()}>
        <div className="results-email-modal-header">
          <h3 className="results-email-modal-title">{stageName} — Emails</h3>
          <button
            type="button"
            className="results-email-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <textarea
          className="results-email-modal-textarea"
          readOnly
          value={emails}
          onFocus={(e) => e.target.select()}
        />
        <div className="results-email-modal-actions">
          <button
            type="button"
            className="results-email-modal-copy-btn"
            disabled={!canCopy || copied}
            onClick={() => {
              if (!canCopy) return
              navigator.clipboard.writeText(emails).then(() => {
                setCopied(true)
                setTimeout(() => {
                  setCopied(false)
                  onClose()
                }, 1200)
              })
            }}
          >
            {copied ? 'Copied!' : 'Copy to clipboard'}
          </button>
          <button
            type="button"
            className="results-email-modal-cancel-btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ResultsList() {
  const { project, submissions } = useProjectContext()
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [emailModal, setEmailModal] = useState<{ stageName: string; emails: string } | null>(null)

  if (!submissions) return null

  const { acceptedByStage, rejectionList, duplicateAlerts, djCountByStage, totalDjCount } =
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

  function handleOpenEmailModal(stageName: string, rows: ResultRow[]) {
    const emails = rows
      .filter((r): r is DJRow => !('blankAssignment' in r))
      .map((r) => r.submission.contactEmail)
      .filter(Boolean)
      .join(', ')
    setEmailModal({ stageName, emails })
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
        <>
          <div className="results-total-count">
            <span>{totalDjCount} DJ{totalDjCount !== 1 ? 's' : ''} assigned across all stages</span>
            <span className="results-count-note">Blocked/open slots are not included in these counts</span>
          </div>
          {acceptedByStage.map(({ stageId, stageName, rows }) => {
            const djCount = djCountByStage.get(stageId) ?? 0
            return (
              <section key={stageId} className="results-stage-section">
                <div className="results-stage-heading-row">
                  <h2 className="results-stage-heading">
                    {stageName}{' '}
                    <span className="results-count-badge">({djCount} DJ{djCount !== 1 ? 's' : ''})</span>
                  </h2>
                  <button
                    type="button"
                    className="results-copy-stage-btn"
                    onClick={() => handleOpenEmailModal(stageName, rows)}
                  >
                    Copy emails
                  </button>
                </div>
                <div className="results-dj-list">
                  {rows.map((row, rowIdx) =>
                    'blankAssignment' in row ? (
                      <div key={`blank-${rowIdx}`} className="results-dj-row results-dj-row--blank">
                        <span className="results-dj-name">{getBlankLabel(row.blankAssignment)}</span>
                        <span />
                        <span className="results-dj-slot-time">{row.slotTime}</span>
                      </div>
                    ) : (
                      <DJRowItem
                        key={row.submission.submissionNumber}
                        row={row}
                        isSelected={selectedSubmission?.submissionNumber === row.submission.submissionNumber}
                        onClick={handleSelectDJ}
                      />
                    )
                  )}
                </div>
              </section>
            )
          })}
        </>
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

  return (
    <>
      {emailModal && (
        <EmailModal
          stageName={emailModal.stageName}
          emails={emailModal.emails}
          onClose={() => setEmailModal(null)}
        />
      )}
      {hasSelection ? (
        <SplitPane initialSplit={45} minLeft={30} minRight={25}>
          {listPane}
          <div className="split-pane-detail-inner">
            <SubmissionDetail
              submission={selectedSubmission}
              onBack={handleCloseDetail}
            />
          </div>
        </SplitPane>
      ) : (
        <div className="results-full-width">
          {listPane}
        </div>
      )}
    </>
  )
}
