import { useEffect, useMemo } from 'react'
import type { RefObject } from 'react'
import type { Submission, Stage, SlotAssignment } from '../types.ts'
import type { AppContextMode } from '../AppPreferencesContext.ts'
import { hexToTint } from '../stageColors.ts'

export type SortField = 'main' | 'ml' | 'number' | null
export type SortDir = 'asc' | 'desc'
export type ScoreMetric = 'avg' | 'sum'
export type RowState = 'discarded' | 'in-lineup' | 'duplicate-name' | 'none'

function getScore(s: Submission, field: SortField, metric: ScoreMetric): number | null {
  if (field === 'main') return metric === 'avg' ? s.mainScore.avg : s.mainScore.sum
  if (field === 'ml') return metric === 'avg' ? s.mlScore.avg : s.mlScore.sum
  return null
}

function fmt(n: number | null): string {
  return n === null ? '—' : n.toFixed(2)
}

function displayScore(s: Submission, field: 'main' | 'ml', metric: ScoreMetric): string {
  return field === 'main'
    ? fmt(metric === 'avg' ? s.mainScore.avg : s.mainScore.sum)
    : fmt(metric === 'avg' ? s.mlScore.avg : s.mlScore.sum)
}

interface StageBadgeProps {
  name: string | undefined
  color: string | undefined
}

function StageBadge({ name, color }: StageBadgeProps) {
  return (
    <span
      className="lineup-badge"
      style={color
        ? { backgroundColor: hexToTint(color, 0.25), borderColor: color, color }
        : undefined}
    >
      {name ?? '—'}
    </span>
  )
}

interface Props {
  submissions: Submission[]
  stages: Stage[]
  assignments: SlotAssignment[]
  sortField: SortField
  sortDir: SortDir
  scoreMetric: ScoreMetric
  nameSearch: string
  showStageAssignments: boolean
  cursorIndex: number | null
  lineupSubmissionNumbers: Set<string>
  discardedSubmissionNumbers: Set<string>
  hiddenNames: boolean
  appContext: AppContextMode
  listRef: RefObject<HTMLDivElement | null>
  onHeaderClick: (field: SortField) => void
  onMetricChange: (metric: ScoreMetric) => void
  onNameSearchChange: (value: string) => void
  onStageAssignmentsToggle: (value: boolean) => void
  onSelect: (origIndex: number, displayedIndex: number) => void
  onCursorChange: (index: number | null) => void
}

export function SubmissionList({
  submissions,
  stages,
  assignments,
  sortField,
  sortDir,
  scoreMetric,
  nameSearch,
  showStageAssignments,
  cursorIndex,
  lineupSubmissionNumbers,
  discardedSubmissionNumbers,
  hiddenNames,
  appContext,
  listRef,
  onHeaderClick,
  onMetricChange,
  onNameSearchChange,
  onStageAssignmentsToggle,
  onSelect,
  onCursorChange,
}: Props) {
  const filtered = useMemo(() => {
    if (!nameSearch.trim()) return submissions
    const query = nameSearch.trim().toLowerCase()
    return submissions.filter((s) => {
      const label = hiddenNames
        ? `dj #${submissions.indexOf(s) + 1}`
        : s.djName.toLowerCase()
      return label.includes(query)
    })
  }, [submissions, nameSearch, hiddenNames])

  const sorted = useMemo(() => {
    if (sortField === null) return filtered
    return [...filtered].sort((a, b) => {
      if (sortField === 'number') {
        const na = parseInt(a.submissionNumber, 10)
        const nb = parseInt(b.submissionNumber, 10)
        if (!isNaN(na) && !isNaN(nb)) {
          return sortDir === 'desc' ? nb - na : na - nb
        }
        // fallback: lexicographic
        return sortDir === 'desc'
          ? b.submissionNumber.localeCompare(a.submissionNumber)
          : a.submissionNumber.localeCompare(b.submissionNumber)
      }
      const sa = getScore(a, sortField, scoreMetric)
      const sb = getScore(b, sortField, scoreMetric)
      if (sa === null && sb === null) return 0
      if (sa === null) return 1
      if (sb === null) return -1
      return sortDir === 'desc' ? sb - sa : sa - sb
    })
  }, [filtered, sortField, sortDir, scoreMetric])

  // Compute set of djNames that appear in more than one non-discarded submission
  const duplicateNames = useMemo(() => {
    const nameCount = new Map<string, number>()
    for (const s of submissions) {
      if (!discardedSubmissionNumbers.has(s.submissionNumber)) {
        nameCount.set(s.djName, (nameCount.get(s.djName) ?? 0) + 1)
      }
    }
    const dupes = new Set<string>()
    for (const [name, count] of nameCount) {
      if (count > 1) dupes.add(name)
    }
    return dupes
  }, [submissions, discardedSubmissionNumbers])

  // Map submissionNumber → { color, name } (from any assignment) for lineup badge
  const submissionStageInfo = useMemo(() => {
    const stageById = new Map(stages.map((s) => [s.id, s]))
    const map = new Map<string, { color: string | undefined; name: string | undefined }>()
    for (const a of assignments) {
      if (!map.has(a.submissionNumber)) {
        const stage = stageById.get(a.stageId)
        map.set(a.submissionNumber, { color: stage?.color, name: stage?.name })
      }
    }
    return map
  }, [stages, assignments])

  // Keyboard navigation handler attached to the list container
  useEffect(() => {
    const el: HTMLDivElement | null = listRef.current
    if (!el) return
    const container: HTMLDivElement = el

    function onKeyDown(e: KeyboardEvent) {
      if (sorted.length === 0) return
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const newIndex = e.key === 'ArrowDown'
          ? Math.min((cursorIndex ?? -1) + 1, sorted.length - 1)
          : Math.max((cursorIndex ?? sorted.length) - 1, 0)
        onCursorChange(newIndex)
        const s = sorted[newIndex]
        if (s) onSelect(submissions.indexOf(s), newIndex)
        const row = container.querySelector(`[data-displayed-index="${newIndex}"]`)
        row?.scrollIntoView({ block: 'nearest' })
      } else if ((e.key === 'Enter' || e.key === ' ') && cursorIndex !== null) {
        e.preventDefault()
        const s = sorted[cursorIndex]
        if (s) onSelect(submissions.indexOf(s), cursorIndex)
      }
    }

    el.addEventListener('keydown', onKeyDown)
    return () => el.removeEventListener('keydown', onKeyDown)
  }, [listRef, sorted, cursorIndex, submissions, onCursorChange, onSelect])

  function arrow(field: SortField) {
    if (sortField !== field) return <span className="sort-arrow" aria-hidden> </span>
    return <span className="sort-arrow active">{sortDir === 'desc' ? '▼' : '▲'}</span>
  }

  return (
    <div className="list-view">
      <div className="controls">
        <label>
          Score:{' '}
          <select value={scoreMetric} onChange={(e) => onMetricChange(e.target.value as ScoreMetric)}>
            <option value="avg">Average</option>
            <option value="sum">Sum</option>
          </select>
        </label>
        <label className="search-label">
          <input
            type="search"
            className="dj-search"
            placeholder="Search DJ name"
            value={nameSearch}
            onChange={(e) => onNameSearchChange(e.target.value)}
          />
        </label>
        <label className="stage-toggle-label">
          <input
            type="checkbox"
            checked={showStageAssignments}
            onChange={(e) => onStageAssignmentsToggle(e.target.checked)}
          />
          {' '}View stage assignments
        </label>
        <span className="submission-count-label">
          {filtered.length < submissions.length
            ? `${filtered.length} / ${submissions.length} submissions`
            : `${submissions.length} submissions`}
        </span>
      </div>
      <div className="submission-table-wrapper">
        <table className="submission-table">
          <thead>
            <tr>
              <th
                className={`th-sortable${sortField === 'number' ? ' th-active' : ''}`}
                onClick={() => onHeaderClick('number')}
              >
                # {arrow('number')}
              </th>
              <th>DJ Name</th>
              {showStageAssignments && <th>Stage Assignment</th>}
              <th
                className={`th-sortable${sortField === 'main' ? ' th-active' : ''}`}
                onClick={() => onHeaderClick('main')}
              >
                Main Score {arrow('main')}
              </th>
              <th
                className={`th-sortable${sortField === 'ml' ? ' th-active' : ''}`}
                onClick={() => onHeaderClick('ml')}
              >
                ML Score {arrow('ml')}
              </th>
              <th>Genre</th>
              <th>Preferred Stages</th>
              <th>Days Available</th>
              {appContext === 'moonlight' && <th>Vibefit</th>}
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, displayedIndex) => {
              const origIndex = submissions.indexOf(s)
              const isDiscarded = discardedSubmissionNumbers.has(s.submissionNumber)
              const inLineup = lineupSubmissionNumbers.has(s.submissionNumber)
              const isDuplicate = !isDiscarded && duplicateNames.has(s.djName)
              const isCursor = cursorIndex === displayedIndex

              const rowState: RowState = isDiscarded ? 'discarded'
                : inLineup ? (showStageAssignments ? 'in-lineup' : 'none')
                  : isDuplicate ? 'duplicate-name'
                    : 'none'

              const stageInfo = submissionStageInfo.get(s.submissionNumber)

              const rowClass = [
                'submission-row',
                rowState !== 'none' ? rowState : '',
                isCursor ? 'row-cursor' : '',
              ].filter(Boolean).join(' ')

              const rowStyle = showStageAssignments && stageInfo?.color
                ? { '--stage-color': stageInfo.color } as React.CSSProperties
                : undefined

              return (
                <tr
                  key={origIndex}
                  data-displayed-index={displayedIndex}
                  className={rowClass}
                  style={rowStyle}
                  onClick={() => onSelect(origIndex, displayedIndex)}
                >
                  <td>{origIndex + 1}</td>

                  <td>
                    {hiddenNames ? `DJ #${origIndex + 1}` : s.djName}
                    {rowState === 'discarded' && <span className="discarded-badge">✕ Discarded</span>}
                    {rowState === 'duplicate-name' && <span className="duplicate-badge">⚠ Duplicate Name</span>}
                  </td> 
                  {showStageAssignments && (
                    <td>
                      {stageInfo && <StageBadge name={stageInfo.name} color={stageInfo.color} />}
                    </td>
                  )}
                  <td>
                    {displayScore(s, 'main', scoreMetric)}
                    {s.mainScore.partial && <span className="partial-badge" title="Only one judge has scored">*</span>}
                  </td>
                  <td>{displayScore(s, 'ml', scoreMetric)}</td>
                  <td>{s.genre || '—'}</td>
                  <td>{s.stagePreferences.join(', ') || '—'}</td>
                  <td>{s.daysAvailable || '—'}</td>
                  {appContext === 'moonlight' && <td>{s.mlVibefit || '—'}</td>}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {sorted.length === 0 && (
        <p className="empty-state">No submissions match the current filter.</p>
      )}
    </div>
  )
}
