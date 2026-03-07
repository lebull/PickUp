import { useEffect, useMemo } from 'react'
import type { RefObject } from 'react'
import type { Submission } from '../types.ts'

export type SortField = 'main' | 'ml' | null
export type SortDir = 'asc' | 'desc'
export type ScoreMetric = 'avg' | 'sum'

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
  sortField: SortField
  sortDir: SortDir
  scoreMetric: ScoreMetric
  activeDays: Set<string>
  cursorIndex: number | null
  lineupSubmissionNumbers: Set<string>
  listRef: RefObject<HTMLDivElement | null>
  onHeaderClick: (field: SortField) => void
  onMetricChange: (metric: ScoreMetric) => void
  onDayToggle: (day: string) => void
  onSelect: (origIndex: number, displayedIndex: number) => void
  onCursorChange: (index: number | null) => void
}

export function SubmissionList({
  submissions,
  sortField,
  sortDir,
  scoreMetric,
  activeDays,
  cursorIndex,
  lineupSubmissionNumbers,
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
      const sa = getScore(a, sortField, scoreMetric)
      const sb = getScore(b, sortField, scoreMetric)
      if (sa === null && sb === null) return 0
      if (sa === null) return 1
      if (sb === null) return -1
      return sortDir === 'desc' ? sb - sa : sa - sb
    })
  }, [filtered, sortField, sortDir, scoreMetric])

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

  function arrow(field: 'main' | 'ml') {
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
      </div>
      <div className="submission-table-wrapper">
        <table className="submission-table">
          <thead>
            <tr>
              <th>#</th>
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
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, displayedIndex) => {
              const origIndex = submissions.indexOf(s)
              const inLineup = lineupSubmissionNumbers.has(s.submissionNumber)
              const isCursor = cursorIndex === displayedIndex
              const rowClass = [
                'submission-row',
                inLineup ? 'in-lineup' : '',
                isCursor ? 'row-cursor' : '',
              ].filter(Boolean).join(' ')
              return (
                <tr
                  key={origIndex}
                  className={rowClass}
                  onClick={() => onSelect(origIndex, displayedIndex)}
                >
                  <td>{origIndex + 1}</td>
                  <td>
                    {s.djName}
                    {inLineup && <span className="lineup-badge">✓ In Lineup</span>}
                  </td>
                  <td>
                    {displayScore(s, 'main', scoreMetric)}
                    {s.mainScore.partial && <span className="partial-badge" title="Only one judge has scored">*</span>}
                  </td>
                  <td>{displayScore(s, 'ml', scoreMetric)}</td>
                  <td>{s.genre || '—'}</td>
                  <td>{s.stagePreferences.join(', ') || '—'}</td>
                  <td>{s.daysAvailable || '—'}</td>
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
