import { createContext, useContext } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { Project, Submission } from './types.ts'

export interface ProjectContextValue {
  project: Project
  setProject: Dispatch<SetStateAction<Project | null>>
  submissions: Submission[] | null
  setSubmissions: Dispatch<SetStateAction<Submission[] | null>>
  rowCountMismatch: boolean
  setRowCountMismatch: Dispatch<SetStateAction<boolean>>
  toggleDiscardSubmission: (submissionNumber: string) => void
}

export const ProjectContext = createContext<ProjectContextValue | null>(null)

export function useProjectContext(): ProjectContextValue {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProjectContext must be used inside ProjectWorkspace')
  return ctx
}
