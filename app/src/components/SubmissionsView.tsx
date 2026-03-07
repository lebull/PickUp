import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProjectContext } from '../ProjectContext.ts'
import { SubmissionList } from './SubmissionList.tsx'
import type { SortField, SortDir, ScoreMetric } from './SubmissionList.tsx'
import { SubmissionDetail } from './SubmissionDetail.tsx'

function SubmissionDetailRoute() {
  const { djIndex } = useParams<{ djIndex: string }>()
  const { submissions } = useProjectContext()
  const navigate = useNavigate()

  if (!submissions) return null

  const index = djIndex !== undefined ? parseInt(djIndex, 10) : NaN
  if (isNaN(index) || index < 0 || index >= submissions.length) {
    return <p className="no-selection">Submission not found.</p>
  }

  return (
    <SubmissionDetail
      submission={submissions[index]}
      onBack={() => navigate(-1)}
    />
  )
}

export function SubmissionsView() {
  const { submissions } = useProjectContext()
  const { djIndex } = useParams<{ djIndex: string }>()
  const navigate = useNavigate()

  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [scoreMetric, setScoreMetric] = useState<ScoreMetric>('avg')
  const [activeDays, setActiveDays] = useState<Set<string>>(new Set())

  if (submissions === null) return null

  const hasSelection = djIndex !== undefined

  function handleHeaderClick(field: SortField) {
    if (field === sortField) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  function handleDayToggle(day: string) {
    setActiveDays((prev) => {
      const next = new Set(prev)
      if (next.has(day)) next.delete(day)
      else next.add(day)
      return next
    })
  }

  function handleSelect(index: number) {
    navigate(String(index))
  }

  return (
    <div className={`split-layout${hasSelection ? ' has-selection' : ''}`}>
      <div className="split-list">
        <SubmissionList
          submissions={submissions}
          sortField={sortField}
          sortDir={sortDir}
          scoreMetric={scoreMetric}
          activeDays={activeDays}
          onHeaderClick={handleHeaderClick}
          onMetricChange={setScoreMetric}
          onDayToggle={handleDayToggle}
          onSelect={handleSelect}
        />
      </div>
      <div className="split-detail">
        {hasSelection ? (
          <SubmissionDetailRoute />
        ) : (
          <p className="no-selection">Select a submission to view details</p>
        )}
      </div>
    </div>
  )
}
