import { useRef, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProjectContext } from '../ProjectContext.ts'
import { SubmissionList } from './SubmissionList.tsx'
import type { SortField, SortDir, ScoreMetric } from './SubmissionList.tsx'
import { SubmissionDetail } from './SubmissionDetail.tsx'
import { useAppPreferences } from '../AppPreferencesContext.ts'
import { SplitPane } from './SplitPane.tsx'

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
  const { project, submissions } = useProjectContext()
  const { id: projectId, djIndex } = useParams<{ id: string; djIndex: string }>()
  const navigate = useNavigate()
  const listRef = useRef<HTMLDivElement>(null)
  const { appContext, hiddenNames } = useAppPreferences()

  const [sortField, setSortField] = useState<SortField>(() =>
    appContext === 'moonlight' ? 'ml' : 'main'
  )
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [scoreMetric, setScoreMetric] = useState<ScoreMetric>('avg')
  const [activeDays, setActiveDays] = useState<Set<string>>(new Set())
  const [cursorIndex, setCursorIndex] = useState<number | null>(null)

  // Reset sort to active context score when appContext changes
  useEffect(() => {
    setSortField(appContext === 'moonlight' ? 'ml' : 'main')
    setSortDir('desc')
  }, [appContext])

  if (submissions === null) return null

  const hasSelection = djIndex !== undefined

  // Derive lineup submission numbers from project assignments
  const lineupSubmissionNumbers = new Set(project.assignments.map((a) => a.submissionNumber))

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

  function handleSelect(index: number, displayedIndex: number) {
    setCursorIndex(displayedIndex)
    navigate(`/project/${projectId}/submissions/${index}`)
    listRef.current?.focus()
  }

  return (
    <SplitPane initialSplit={40} minLeft={25} minRight={20}>
      <div
        className="split-pane-list-inner"
        ref={listRef}
        tabIndex={0}
      >
        <SubmissionList
          submissions={submissions}
          sortField={sortField}
          sortDir={sortDir}
          scoreMetric={scoreMetric}
          activeDays={activeDays}
          cursorIndex={cursorIndex}
          lineupSubmissionNumbers={lineupSubmissionNumbers}
          hiddenNames={hiddenNames}
          appContext={appContext}
          onHeaderClick={handleHeaderClick}
          onMetricChange={setScoreMetric}
          onDayToggle={handleDayToggle}
          onSelect={handleSelect}
          onCursorChange={setCursorIndex}
          listRef={listRef}
        />
      </div>
      <div className="split-pane-detail-inner">
        {hasSelection ? (
          <SubmissionDetailRoute />
        ) : (
          <p className="no-selection">Select a submission to view details</p>
        )}
      </div>
    </SplitPane>
  )
}
