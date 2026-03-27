import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProjectContext } from '../ProjectContext.ts'
import { SubmissionList } from './SubmissionList.tsx'
import type { SortField, SortDir, ScoreMetric } from './SubmissionList.tsx'
import { SubmissionDetail } from './SubmissionDetail.tsx'
import { useAppPreferences } from '../AppPreferencesContext.ts'
import { SplitPane } from './SplitPane.tsx'
import { isSlotAssignment } from '../types.ts'
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
  const { hiddenNames } = useAppPreferences()

  const [sortField, setSortField] = useState<SortField>('number')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [scoreMetric, setScoreMetric] = useState<ScoreMetric>('avg')
  const [nameSearch, setNameSearch] = useState('')
  const [showStageAssignments, setShowStageAssignments] = useState(false)
  const [cursorIndex, setCursorIndex] = useState<number | null>(null)

  if (submissions === null) return null

  const hasSelection = djIndex !== undefined

  // Derive lineup submission numbers from project assignments
  const lineupSubmissionNumbers = new Set(project.assignments.filter((a) => a.type === 'dj').map((a) => a.submissionNumber))
  const discardedSubmissionNumbers = new Set(project.discardedSubmissions ?? [])

  function handleHeaderClick(field: SortField) {
    if (field === sortField) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
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
          stages={project.stages}
          assignments={project.assignments.filter(isSlotAssignment)}
          sortField={sortField}
          sortDir={sortDir}
          scoreMetric={scoreMetric}
          nameSearch={nameSearch}
          showStageAssignments={showStageAssignments}
          cursorIndex={cursorIndex}
          lineupSubmissionNumbers={lineupSubmissionNumbers}
          discardedSubmissionNumbers={discardedSubmissionNumbers}
          hiddenNames={hiddenNames}
          onHeaderClick={handleHeaderClick}
          onMetricChange={setScoreMetric}
          onNameSearchChange={setNameSearch}
          onStageAssignmentsToggle={setShowStageAssignments}
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
