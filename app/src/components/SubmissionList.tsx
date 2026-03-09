import { useEffect, useMemo } from 'react'
import type { RefObject } from 'react'
import type { Submission, Stage, SlotAssignment } from '../types.ts'
import type { AppContextMode } from '../AppPreferencesContext.ts'
import { hexToTint } from '../stageColors.ts'

export type SortField = 'main' | 'ml' | 'number' | null
export type SortDir = 'asc' | 'desc'
export type ScoreMetric = 'avg' | 'sum'
export type RowState = 'discarded' | 'in-lineup' | 'duplicate-name' | 'none'

const DAYS = ['Thursday', 'Friday', 'Saturday', 'Sunday']

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

interface Props {
  submissions: Submission[]
  stages: Stage[]
  assignments: SlotAssignment[]
  sortField: SortField
  sortDir: SortDir
  scoreMetric: ScoreMetric
  activeDays: Set<string>
  cursorIndex: number | null
  lineupSubmissionNumbers: Set<string>
  discardedSubmissionNumbers: Set<string>
  hiddenNames: boolean
  appContext: AppContextMode
  listRef: RefObject<HTMLDivElement | null>
  onHeaderClick: (field: SortField) => void
  onMetricChange: (metric: ScoreMetric) => void
  onDayToggle: (day: string) => void
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
  activeDays,
  cursorIndex,
  lineupSubmissionNumbers,
  discardedSubmissionNumbers,
  hiddenNames,
  appContext,
  listRef,
  onHeaderClick,
  onMetricChange,
  onDayToggle,
  onSelect,
  onCursorChange,
}: Props) {
  const filtered = useMemo(() => {
    if (activeDays.size === 0) return submissions
    return submissions.filter((s) =>
      [...activeDays].some((day) => s.daysAvailable.toLowerCase().includes(day.toLowerCase()))
    )
  }, [submissions, activeDays])

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

  // Task 3.2: compute set of djNames that appear in more than one non-discarded submission
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

  // Map submissionNumber → stage color hex (from any assignment) for lineup badge tinting
  const submissionStageColor = useMemo(() => {
    const stageById = new Map(stages.map((s) => [s.id, s]))
    const map = new Map<string, string | undefined>()
    for (const a of assignments) {
      if (!map.has(a.submissionNumber)) {
        const color = stageById.get(a.stageId)?.color
        map.set(a.submissionNumber, color)
      }
    }
    return map
  }, [stages, assignments])

  // Keyboard navigation handler attached to the list container
  useEffect(() => {
    const el = listRef.current
    if (!el) return

    function onKeyDown(e: KeyboardEvent) {
      if (sorted.length === 0) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        onCursorChange(Math.min((cursorIndex ?? -1) + 1, sorted.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        onCursorChange(Math.max((cursorIndex ?? sorted.length) - 1, 0))
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
        <div className="day-toggles">
          {DAYS.map((day) => (
            <button
              key={day}
              type="button"
              className={`day-btn${activeDays.has(day) ? ' active' : ''}`}
              onClick={() => onDayToggle(day)}
            >
              {day}
            </button>
          ))}
        </div>
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

              // Task 3.3: priority-ordered row state
              const rowState: RowState = isDiscarded ? 'discarded'
                : inLineup ? 'in-lineup'
                : isDuplicate ? 'duplicate-name'
                : 'none'

              const rowClass = [
                'submission-row',
                rowState !== 'none' ? rowState : '',
                isCursor ? 'row-cursor' : '',
              ].filter(Boolean).join(' ')
              const inLineupColor = rowState === 'in-lineup' ? submissionStageColor.get(s.submissionNumber) : undefined
              return (
                <tr
                  key={origIndex}
                  className={rowClass}
                  style={inLineupColor ? { '--stage-color': inLineupColor } as React.CSSProperties : undefined}
                  onClick={() => onSelect(origIndex, displayedIndex)}
                >
                  <td>{origIndex + 1}</td>
                  <td>
                    {hiddenNames ? `DJ #${origIndex + 1}` : s.djName}
                    {rowState === 'in-lineup' && (() => {
                      const color = submissionStageColor.get(s.submissionNumber)
                      return (
                        <span
                          className="lineup-badge"
                          style={color
                            ? { backgroundColor: hexToTint(color, 0.25), borderColor: color, color: color }
                            : undefined}
                        >
                          ✓ In Lineup
                        </span>
                      )
                    })()}
                    {rowState === 'discarded' && <span className="discarded-badge">✕ Discarded</span>}
                    {rowState === 'duplicate-name' && <span className="duplicate-badge">⚠ Duplicate Name</span>}
                  </td>
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
