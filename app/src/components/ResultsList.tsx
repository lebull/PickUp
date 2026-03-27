import { useState } from 'react'
import { useProjectContext } from '../ProjectContext.ts'
import type { Submission, BlankSlotAssignment, Stage, SlotAssignment, DJSlotAssignment, SlotCoord } from '../types.ts'
import { isBlankAssignment, getBlankLabel, isSlotAssignment, isSimultaneousCoord } from '../types.ts'
import { SplitPane } from './SplitPane.tsx'
import { SubmissionDetail } from './SubmissionDetail.tsx'
import { useAppPreferences } from '../AppPreferencesContext.ts'
import { getEventLabel, getSlotLabels, getStageEventType, formatTimeLabel } from '../lineupUtils.ts'
import { DJSelectionPanel } from './DJSelectionPanel.tsx'
import type { ActiveSlot } from './DJSelectionPanel.tsx'
import { getAssignmentDisplayContext } from '../declinedContext.ts'

// ── Data helpers ─────────────────────────────────────────────────────────────

interface DJRow {
  submission: Submission
  stageLabel?: string // for accepted rows
  assignment?: DJSlotAssignment // for stage-section rows (acceptance tracking)
}

interface StageResultSection {
  stageId: string
  stageName: string
  rows: ResultRow[] // flat (for email/count)
  dayGroups: Array<{ evening: string; rows: ResultRow[] }>
}

interface BlankRow {
  blankAssignment: BlankSlotAssignment
  slotTime: string
}

type ResultRow = DJRow | BlankRow

function getSlotTimeLabel(assignment: BlankSlotAssignment, stage: Stage): string {
  if (assignment.positionIndex != null) return `Position ${assignment.positionIndex}`
  if (assignment.slotIndex != null) {
    const labels = getSlotLabels(stage, assignment.evening, assignment.eventIndex ?? 0)
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

interface SpecialEventSection {
  key: string
  label: string
  rows: DJRow[]
}

function getRowEvening(row: ResultRow): string {
  if ('blankAssignment' in row) return row.blankAssignment.evening
  return row.assignment?.evening ?? ''
}

function buildResultsData(
  submissions: Submission[],
  project: import('../types.ts').Project
) {
  const { assignments, stages, discardedSubmissions } = project
  const discardedSet = new Set(discardedSubmissions ?? [])
  const stageById = new Map(stages.map((stage) => [stage.id, stage]))

  // Filter to only slot assignments (exclude special stage assignments for now)
  const slotAssignments = assignments.filter(isSlotAssignment) as SlotAssignment[]

  function isSpecialEventAssignment(a: SlotAssignment): boolean {
    const stage = stageById.get(a.stageId)
    const event = stage?.schedule?.[a.evening]?.[a.eventIndex ?? 0]
    return !!event && getStageEventType(event) === 'special'
  }

  // Only DJ assignments count toward "assigned" submission numbers
  const assignedNumbers = new Set<string>()
  for (const a of slotAssignments) {
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
  const acceptedByStage: StageResultSection[] = []
  for (const stage of stages) {
    if (stage.stageType === 'special') continue
    const stageAssignments = slotAssignments
      .filter((a) => a.stageId === stage.id && !isSpecialEventAssignment(a))
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
        if (sub) rows.push({ submission: sub, assignment })
      }
    }
    if (rows.length > 0) {
      // Build day groups ordered by activeDays, then 'Other'
      const activeDays = stage.activeDays ?? []
      const byEvening = new Map<string, ResultRow[]>()
      for (const row of rows) {
        const evening = getRowEvening(row)
        const bucket = byEvening.get(evening) ?? []
        bucket.push(row)
        byEvening.set(evening, bucket)
      }
      const dayGroups: Array<{ evening: string; rows: ResultRow[] }> = []
      for (const day of activeDays) {
        if (byEvening.has(day)) dayGroups.push({ evening: day, rows: byEvening.get(day)! })
      }
      const otherRows: ResultRow[] = []
      for (const [evening, eveningRows] of byEvening) {
        if (!activeDays.includes(evening)) otherRows.push(...eveningRows)
      }
      if (otherRows.length > 0) dayGroups.push({ evening: 'Other', rows: otherRows })
      acceptedByStage.push({ stageId: stage.id, stageName: stage.name, rows, dayGroups })
    }
  }

  const specialEventSections: SpecialEventSection[] = []
  for (const stage of stages) {
    if (stage.stageType === 'special') {
      const rows: DJRow[] = slotAssignments
        .filter((a): a is DJSlotAssignment => a.stageId === stage.id && !isBlankAssignment(a))
        .sort((a, b) => (a.slotIndex ?? 0) - (b.slotIndex ?? 0))
        .map((a) => {
          const submission = subByNumber.get(a.submissionNumber)
          return submission ? { submission } : null
        })
        .filter((row): row is DJRow => row !== null)
      if (rows.length > 0) {
        specialEventSections.push({
          key: stage.id,
          label: stage.name,
          rows,
        })
      }
      continue
    }

    const byEvent = new Map<number, SlotAssignment[]>()
    for (const assignment of slotAssignments) {
      if (assignment.stageId !== stage.id) continue
      if (!isSpecialEventAssignment(assignment)) continue
      const eventIndex = assignment.eventIndex ?? 0
      const bucket = byEvent.get(eventIndex) ?? []
      bucket.push(assignment)
      byEvent.set(eventIndex, bucket)
    }
    for (const [eventIndex, eventAssignments] of byEvent.entries()) {
      if (eventAssignments.length === 0) continue
      const evening = eventAssignments[0].evening
      const event = stage.schedule?.[evening]?.[eventIndex]
      const label = `${stage.name} · ${evening} · ${event ? getEventLabel(event, eventIndex) : `Special Event ${eventIndex + 1}`}`
      const rows: DJRow[] = eventAssignments
        .filter((a): a is DJSlotAssignment => !isBlankAssignment(a))
        .sort((a, b) => (a.slotIndex ?? 0) - (b.slotIndex ?? 0))
        .map((a) => {
          const submission = subByNumber.get(a.submissionNumber)
          return submission ? { submission } : null
        })
        .filter((row): row is DJRow => row !== null)
      if (rows.length > 0) {
        specialEventSections.push({
          key: `${stage.id}|${evening}|${eventIndex}`,
          label,
          rows,
        })
      }
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

  return { acceptedByStage, rejectionList, specialEventSections, duplicateAlerts, assignedNumbers, djCountByStage, totalDjCount }
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
  displayName: string
  isSelected: boolean
  onClick: (sub: Submission, assignment?: DJSlotAssignment) => void
  acceptanceStatus?: 'pending' | 'yes' | 'no'
  onSetAcceptance?: (status: 'yes' | 'no') => void
  isReplacementActive?: boolean
  onReplacementClick?: () => void
}

function DJRowItem({ row, displayName, isSelected, onClick, acceptanceStatus, onSetAcceptance, isReplacementActive, onReplacementClick }: DJRowItemProps) {
  const { submission: s } = row
  const [emailCopied, setEmailCopied] = useState(false)
  const canCopy = typeof navigator !== 'undefined' && !!navigator.clipboard

  return (
    <button
      className={`results-dj-row${isSelected ? ' selected' : ''}${acceptanceStatus === 'yes' ? ' results-dj-row--accepted' : ''}${acceptanceStatus === 'no' ? ' results-dj-row--declined' : ''}${isReplacementActive ? ' results-dj-row--picker-active' : ''}`}
      onClick={() => {
        if (acceptanceStatus === 'no' && onReplacementClick) {
          onReplacementClick()
        } else {
          onClick(s, row.assignment)
        }
      }}
      type="button"
    >
      <span className="results-dj-name">{displayName}</span>
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
      {acceptanceStatus !== undefined && (
        <span className="results-acceptance-controls">
          <button
            type="button"
            className={`results-acceptance-btn results-acceptance-btn--yes${acceptanceStatus === 'yes' ? ' active' : ''}`}
            onClick={(e) => { e.stopPropagation(); onSetAcceptance?.('yes') }}
            aria-label="Mark as accepted"
            aria-pressed={acceptanceStatus === 'yes'}
          >
            Yes
          </button>
          <button
            type="button"
            className={`results-acceptance-btn results-acceptance-btn--no${acceptanceStatus === 'no' ? ' active' : ''}`}
            onClick={(e) => { e.stopPropagation(); onSetAcceptance?.('no') }}
            aria-label="Mark as declined"
            aria-pressed={acceptanceStatus === 'no'}
          >
            No
          </button>
        </span>
      )}
    </button>
  )
}

interface EmailModalProps {
  label: string
  emails: string
  onClose: () => void
}

function EmailModal({ label, emails, onClose }: EmailModalProps) {
  const canCopy = typeof navigator !== 'undefined' && !!navigator.clipboard
  const [copied, setCopied] = useState(false)

  return (
    <div
      className="results-email-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${label} emails`}
    >
      <div className="results-email-modal" onClick={(e) => e.stopPropagation()}>
        <div className="results-email-modal-header">
          <h3 className="results-email-modal-title">{label} — Emails</h3>
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
  const { project, submissions, setAcceptanceStatus, replaceWithDeclineHistory } = useProjectContext()
  const { hiddenNames, timeFormat } = useAppPreferences()
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [selectedSlotAssignment, setSelectedSlotAssignment] = useState<DJSlotAssignment | null>(null)
  const [emailModal, setEmailModal] = useState<{ label: string; emails: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeReplacementSlot, setActiveReplacementSlot] = useState<{ slotCoord: SlotCoord; assignment: DJSlotAssignment } | null>(null)

  if (!submissions) return null
  const allSubmissions = submissions

  const { acceptedByStage, rejectionList, specialEventSections, duplicateAlerts, djCountByStage, totalDjCount } =
    buildResultsData(allSubmissions, project)

  const hasSelection = selectedSubmission !== null
  const hasReplacementPicker = activeReplacementSlot !== null

  function handleSelectDJ(sub: Submission, assignment?: DJSlotAssignment) {
    const isSameSubmission = selectedSubmission?.submissionNumber === sub.submissionNumber
    const isSameSlot =
      (!selectedSlotAssignment && !assignment) ||
      (!!selectedSlotAssignment && !!assignment && isSameSlotCoord(assignmentToSlotCoord(selectedSlotAssignment), assignmentToSlotCoord(assignment)))

    setActiveReplacementSlot(null)
    if (isSameSubmission && isSameSlot) {
      setSelectedSubmission(null)
      setSelectedSlotAssignment(null)
      return
    }
    setSelectedSubmission(sub)
    setSelectedSlotAssignment(assignment ?? null)
  }

  function handleCloseDetail() {
    setSelectedSubmission(null)
    setSelectedSlotAssignment(null)
  }

  function getDisplayName(sub: Submission): string {
    if (!hiddenNames) return sub.djName
    const idx = allSubmissions.findIndex((s) => s.submissionNumber === sub.submissionNumber)
    return idx >= 0 ? `DJ #${idx + 1}` : sub.djName
  }

  function handleOpenEmailModal(label: string, rows: ResultRow[]) {
    const emails = rows
      .filter((r): r is DJRow => !('blankAssignment' in r))
      .map((r) => r.submission.contactEmail)
      .filter(Boolean)
      .join(', ')
    setEmailModal({ label, emails })
  }

  function assignmentToSlotCoord(a: DJSlotAssignment): SlotCoord {
    if (a.positionIndex != null) {
      return { stageId: a.stageId, evening: a.evening, positionIndex: a.positionIndex, eventIndex: a.eventIndex ?? 0 }
    }
    return { stageId: a.stageId, evening: a.evening, slotIndex: a.slotIndex!, eventIndex: a.eventIndex ?? 0 }
  }

  function isSameSlotCoord(a: SlotCoord, b: SlotCoord): boolean {
    if (isSimultaneousCoord(a) !== isSimultaneousCoord(b)) return false
    if (isSimultaneousCoord(a) && isSimultaneousCoord(b)) {
      return a.stageId === b.stageId && a.evening === b.evening && a.positionIndex === b.positionIndex && a.eventIndex === b.eventIndex
    }
    const as = a as { stageId: string; evening: string; slotIndex: number; eventIndex: number }
    const bs = b as { stageId: string; evening: string; slotIndex: number; eventIndex: number }
    return as.stageId === bs.stageId && as.evening === bs.evening && as.slotIndex === bs.slotIndex && as.eventIndex === bs.eventIndex
  }

  function buildActiveSlot(a: DJSlotAssignment, stage: Stage): ActiveSlot {
    if (a.positionIndex != null) {
      return { stageId: a.stageId, evening: a.evening, eventIndex: a.eventIndex ?? 0, positionIndex: a.positionIndex, timeLabel: `Pos ${a.positionIndex}` }
    }
    const labels = getSlotLabels(stage, a.evening, a.eventIndex ?? 0)
    const rawLabel = a.slotIndex != null ? (labels[a.slotIndex] ?? a.evening) : a.evening
    const timeLabel = formatTimeLabel(rawLabel, timeFormat)
    return { stageId: a.stageId, evening: a.evening, slotIndex: a.slotIndex, eventIndex: a.eventIndex ?? 0, timeLabel }
  }

  function matchesSearch(sub: Submission): boolean {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      sub.djName.toLowerCase().includes(q) ||
      sub.furName.toLowerCase().includes(q) ||
      sub.contactEmail.toLowerCase().includes(q) ||
      sub.telegramDiscord.toLowerCase().includes(q) ||
      sub.phone.toLowerCase().includes(q)
    )
  }

  function handleReplacementToggle(assignment: DJSlotAssignment) {
    const coord = assignmentToSlotCoord(assignment)
    setSelectedSubmission(null)
    setSelectedSlotAssignment(null)
    setActiveReplacementSlot((prev) => {
      if (prev && isSameSlotCoord(prev.slotCoord, coord)) return null
      return { slotCoord: coord, assignment }
    })
  }

  function isReplacementPickerActive(assignment: DJSlotAssignment): boolean {
    if (!activeReplacementSlot) return false
    return isSameSlotCoord(activeReplacementSlot.slotCoord, assignmentToSlotCoord(assignment))
  }

  // Build replacement picker panel (used in right pane when a declined slot is selected)
  const replacementPickerPanel = hasReplacementPicker ? (() => {
    const { slotCoord, assignment: declinedAssignment } = activeReplacementSlot
    const stage = project.stages.find((s) => s.id === declinedAssignment.stageId)
    if (!stage) return null
    const activeSlot = buildActiveSlot(declinedAssignment, stage)
    const excluded = new Set([...(declinedAssignment.declinedBy ?? []), declinedAssignment.submissionNumber])
    // Filter out the declining DJ's slot so the panel sees an empty slot (enables single-click assign)
    const filteredAssignments = project.assignments.filter(isSlotAssignment).filter((a): a is SlotAssignment => {
      if (isSimultaneousCoord(slotCoord)) {
        return !(a.stageId === slotCoord.stageId && a.evening === slotCoord.evening && a.positionIndex === slotCoord.positionIndex && (a.eventIndex ?? 0) === slotCoord.eventIndex)
      }
      const sc = slotCoord as { stageId: string; evening: string; slotIndex: number; eventIndex: number }
      return !(a.stageId === sc.stageId && a.evening === sc.evening && a.slotIndex === sc.slotIndex && (a.eventIndex ?? 0) === sc.eventIndex)
    })
    return (
      <DJSelectionPanel
        submissions={allSubmissions}
        stages={project.stages}
        assignments={filteredAssignments}
        discardedSubmissionNumbers={new Set(project.discardedSubmissions ?? [])}
        excludedSubmissionNumbers={excluded}
        activeSlot={activeSlot}
        currentEvening={declinedAssignment.evening}
        onAssign={(_stageId, _evening, _slotIndex, submissionNumber) => {
          replaceWithDeclineHistory(slotCoord, submissionNumber)
          setActiveReplacementSlot(null)
        }}
        onAddSimultaneous={(_stageId, _evening, _positionIndex, submissionNumber) => {
          replaceWithDeclineHistory(slotCoord, submissionNumber)
          setActiveReplacementSlot(null)
        }}
        onRemove={() => {}}
        onRemoveSimultaneous={() => {}}
        onAssignBlank={() => {}}
        onAddBlankSimultaneous={() => {}}
        onPositionSelect={() => {}}
        onSelectSlot={() => {}}
        onClose={() => setActiveReplacementSlot(null)}
      />
    )
  })() : null

  const listPane = (
    <div className="results-list-inner">
      {/* Search input */}
      <div className="results-search-row">
        <input
          type="search"
          className="results-search-input"
          placeholder="Search DJs…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search DJs"
        />
      </div>

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
          {acceptedByStage.map(({ stageId, stageName, rows, dayGroups }) => {
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
                {dayGroups.map(({ evening, rows: dayRows }) => {
                  const filteredDayRows = searchQuery
                    ? dayRows.filter((row) => 'blankAssignment' in row || matchesSearch(row.submission))
                    : dayRows
                  return (
                    <div key={evening} className="results-day-group">
                      <h3 className="results-day-heading">{evening}</h3>
                      <div className="results-dj-list">
                        {filteredDayRows.map((row, rowIdx) =>
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
                              displayName={getDisplayName(row.submission)}
                              isSelected={selectedSubmission?.submissionNumber === row.submission.submissionNumber}
                              onClick={handleSelectDJ}
                              acceptanceStatus={row.assignment?.acceptanceStatus ?? 'pending'}
                              onSetAcceptance={(status) => {
                                if (row.assignment) setAcceptanceStatus(assignmentToSlotCoord(row.assignment), status)
                              }}
                              isReplacementActive={row.assignment ? isReplacementPickerActive(row.assignment) : false}
                              onReplacementClick={row.assignment ? () => handleReplacementToggle(row.assignment!) : undefined}
                            />
                          )
                        )}
                      </div>
                    </div>
                  )
                })}
              </section>
            )
          })}
        </>
      )}

      {specialEventSections.length > 0 && (
        <section className="results-stage-section results-special-events-section">
          <div className="results-stage-heading-row">
            <h2 className="results-stage-heading">Special Events</h2>
          </div>
          {specialEventSections.map((section) => (
            <section key={section.key} className="results-stage-section">
              <div className="results-stage-heading-row">
                <h3 className="results-stage-heading">{section.label}</h3>
                <button
                  type="button"
                  className="results-copy-stage-btn"
                  onClick={() => handleOpenEmailModal(section.label, section.rows)}
                >
                  Copy emails
                </button>
              </div>
              <div className="results-dj-list">
                {section.rows.map((row) => (
                  <DJRowItem
                    key={`${section.key}|${row.submission.submissionNumber}`}
                    row={row}
                    displayName={getDisplayName(row.submission)}
                    isSelected={selectedSubmission?.submissionNumber === row.submission.submissionNumber}
                    onClick={handleSelectDJ}
                  />
                ))}
              </div>
            </section>
          ))}
        </section>
      )}

      {/* Did Not Make the Cut */}
      {rejectionList.length > 0 && (
        <section className="results-stage-section results-rejection-section">
          <div className="results-stage-heading-row">
            <h2 className="results-stage-heading results-rejection-heading">
              Did Not Make the Cut
            </h2>
            <button
              type="button"
              className="results-copy-stage-btn"
              onClick={() => handleOpenEmailModal('Did Not Make the Cut', rejectionList)}
            >
              Copy emails
            </button>
          </div>
          <div className="results-dj-list">
            {rejectionList.filter(({ submission: s }) => matchesSearch(s)).map(({ submission: s }) => (
              <DJRowItem
                key={s.submissionNumber}
                row={{ submission: s }}
                displayName={getDisplayName(s)}
                isSelected={selectedSubmission?.submissionNumber === s.submissionNumber}
                onClick={handleSelectDJ}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )

  const activePanelAssignment = activeReplacementSlot?.assignment ?? selectedSlotAssignment
  const priorDeclinedNumbers = activePanelAssignment?.declinedBy ?? []
  const priorDeclinedNames = [...new Set(priorDeclinedNumbers.map((submissionNumber) => {
    const sub = allSubmissions.find((s) => s.submissionNumber === submissionNumber)
    return sub ? getDisplayName(sub) : `DJ ${submissionNumber}`
  }))]
  const priorDeclineContext = activePanelAssignment
    ? getAssignmentDisplayContext(project.stages, activePanelAssignment, timeFormat)
    : null

  const priorDeclineStatus = activePanelAssignment && priorDeclinedNames.length > 0 && priorDeclineContext ? (
    <div className="results-prior-decline-status" role="status">
      <strong>Previously declined:</strong>{' '}
      {priorDeclinedNames.join(', ')}
      <span className="results-prior-decline-slot">{priorDeclineContext.summary}</span>
    </div>
  ) : null

  return (
    <>
      {emailModal && (
        <EmailModal
          label={emailModal.label}
          emails={emailModal.emails}
          onClose={() => setEmailModal(null)}
        />
      )}
      {hasReplacementPicker ? (
        <SplitPane initialSplit={45} minLeft={30} minRight={25}>
          {listPane}
          <div className="split-pane-detail-inner">
            {priorDeclineStatus}
            {replacementPickerPanel}
          </div>
        </SplitPane>
      ) : hasSelection ? (
        <SplitPane initialSplit={45} minLeft={30} minRight={25}>
          {listPane}
          <div className="split-pane-detail-inner">
            {priorDeclineStatus}
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
