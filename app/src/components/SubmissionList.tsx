import { useMemo } from 'react'
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
  onHeaderClick: (field: SortField) => void
  onMetricChange: (metric: ScoreMetric) => void
  onDayToggle: (day: string) => void
  onSelect: (index: number) => void
}

export function SubmissionList({
  submissions,
  sortField,
  sortDir,
  scoreMetric,
  activeDays,
  onHeaderClick,
  onMetricChange,
  onDayToggle,
  onSelect,
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
          {sorted.map((s) => {
            const origIndex = submissions.indexOf(s)
            return (
              <tr key={origIndex} onClick={() => onSelect(origIndex)} className="submission-row">
                <td>{origIndex + 1}</td>
                <td>{s.djName}</td>
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
      {sorted.length === 0 && (
        <p className="empty-state">No submissions match the current filter.</p>
      )}
    </div>
  )
}
