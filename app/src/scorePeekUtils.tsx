import type { ReactNode } from 'react'
import type { Submission } from './types.ts'

function fmt(n: number | null): string {
  return n === null ? '—' : n.toFixed(2)
}

/** Returns true if the submission has at least one non-null score value. */
export function hasAnyScore(sub: Submission, useMoonlight: boolean): boolean {
  if (useMoonlight) {
    return sub.mlTechnical !== null || sub.mlFlow !== null || sub.mlEntertainment !== null
  }
  return (
    sub.j1Technical !== null || sub.j1Flow !== null || sub.j1Entertainment !== null ||
    sub.j2Technical !== null || sub.j2Flow !== null || sub.j2Entertainment !== null ||
    sub.j3Technical !== null || sub.j3Flow !== null || sub.j3Entertainment !== null
  )
}

/** Builds the content for a score-peek tooltip for the given submission. Returns null if there are no scores. */
export function buildPeekContent(sub: Submission, useMoonlight: boolean): ReactNode {
  const avgScore = useMoonlight ? sub.mlScore.avg : sub.mainScore.avg

  if (useMoonlight) {
    if (sub.mlTechnical === null && sub.mlFlow === null && sub.mlEntertainment === null) return null
    return (
      <>
        <div className="score-peek-header">
          <span className="score-peek-avg"><span className="score-peek-dim">Avg</span> {fmt(avgScore)}</span>
          {sub.formatGear && <span className="score-peek-gear" title={sub.formatGear}>{sub.formatGear}</span>}
        </div>
        <div className="score-peek-subscores">
          <span className="score-peek-item"><span className="score-peek-dim">Tech</span> {sub.mlTechnical ?? '—'}</span>
          <span className="score-peek-item"><span className="score-peek-dim">Flow</span> {sub.mlFlow ?? '—'}</span>
          <span className="score-peek-item"><span className="score-peek-dim">Ent</span> {sub.mlEntertainment ?? '—'}</span>
        </div>
        {sub.mlNotes && <div className="score-peek-notes">{sub.mlNotes}</div>}
      </>
    )
  }

  const judges = [
    { label: 'J1', tech: sub.j1Technical, flow: sub.j1Flow, ent: sub.j1Entertainment, notes: sub.j1Notes },
    { label: 'J2', tech: sub.j2Technical, flow: sub.j2Flow, ent: sub.j2Entertainment, notes: sub.j2Notes },
    { label: 'J3', tech: sub.j3Technical, flow: sub.j3Flow, ent: sub.j3Entertainment, notes: sub.j3Notes },
  ].filter((j) => j.tech !== null || j.flow !== null || j.ent !== null)

  if (judges.length === 0) return null

  return (
    <>
      <div className="score-peek-header">
        <span className="score-peek-avg"><span className="score-peek-dim">Avg</span> {fmt(avgScore)}</span>
      </div>
      {sub.formatGear && <div className="score-peek-gear-row"><span className="score-peek-gear" title={sub.formatGear}>{sub.formatGear}</span></div>}
      {judges.map((j) => (
        <div key={j.label} className="score-peek-judge">
          <div className="score-peek-subscores">
            <span className="score-peek-judge-label">{j.label}</span>
            <span className="score-peek-item"><span className="score-peek-dim">T</span> {j.tech ?? '—'}</span>
            <span className="score-peek-item"><span className="score-peek-dim">F</span> {j.flow ?? '—'}</span>
            <span className="score-peek-item"><span className="score-peek-dim">E</span> {j.ent ?? '—'}</span>
          </div>
          {j.notes && <div className="score-peek-notes">{j.notes}</div>}
        </div>
      ))}
    </>
  )
}
