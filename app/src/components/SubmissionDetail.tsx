import { useRef, useState, useEffect } from 'react'
import type { Submission } from '../types.ts'
import { useAppPreferences } from '../AppPreferencesContext.ts'
import { useProjectContext } from '../ProjectContext.ts'

function val(s: string | null | undefined): string {
  return s?.trim() || '—'
}

function numVal(n: number | null): string {
  return n === null ? '—' : n.toFixed(2)
}

function rawScore(n: number | null): string {
  return n === null ? '—' : String(n)
}

interface SummaryProps {
  submission: Submission
  anonymousLabel: string
}

function SubmissionSummary({ submission: s, anonymousLabel: _anonymousLabel }: SummaryProps) {
  const mlScore = s.moonlightInterest && s.mlScore.avg !== null
    ? s.mlScore.avg.toFixed(2)
    : '—'
  return (
    <div className="detail-summary">
      <>
        <div className="detail-summary-item detail-summary-item--primary">
          <span className="detail-summary-label">Main Score</span>
          <span className="detail-summary-value">
            {numVal(s.mainScore.avg)}
            {s.mainScore.partial && <span className="partial-badge" title="Only one judge has scored"> *</span>}
          </span>
        </div>
        <div className="detail-summary-item">
          <span className="detail-summary-label">ML Score</span>
          <span className="detail-summary-value">{mlScore}</span>
        </div>
      </>
      <div className="detail-summary-item">
        <span className="detail-summary-label">Genre</span>
        <span className="detail-summary-value">{val(s.genre)}</span>
      </div>
    </div>
  )
}

interface SectionProps {
  title: string
  children: React.ReactNode
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="detail-section">
      <h2 className="section-title">{title}</h2>
      {children}
    </section>
  )
}

interface FieldProps {
  label: string
  value: string
}

function Field({ label, value }: FieldProps) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <span className="field-value">{value}</span>
    </div>
  )
}

interface Props {
  submission: Submission
  onBack: () => void
}

export function SubmissionDetail({ submission: s, onBack }: Props) {
  const { hiddenNames, appContext } = useAppPreferences()
  const { project, toggleDiscardSubmission } = useProjectContext()
  const isDiscarded = (project.discardedSubmissions ?? []).includes(s.submissionNumber)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function onPointerDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])
  const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th']
  const stagePrefsWithLabel = s.stagePreferences.map((p, i) => `${ORDINALS[i]}: ${p}`)

  // Anonymous label is stable (based on submission number, not sort order)
  const anonymousLabel = `DJ #${s.submissionNumber}`
  const displayName = hiddenNames ? anonymousLabel : s.djName

  const moonlightSection = s.moonlightInterest && (
    <Section title="Moonlight Festival">
      <Field label="ML Genre" value={val(s.mlGenre)} />
      <Field label="ML Submission Link" value={val(s.mlSubmissionLink)} />
      {s.mlKinkWhy && (
        <div className="field bio-field">
          <span className="field-label">Why Moonlight / Kink</span>
          <span className="field-value bio-text">{s.mlKinkWhy}</span>
        </div>
      )}
      <div className="judge-block">
        <h3>Judge ML</h3>
        <Field label="Technical" value={rawScore(s.mlTechnical)} />
        <Field label="Flow" value={rawScore(s.mlFlow)} />
        <Field label="Entertainment" value={rawScore(s.mlEntertainment)} />
        <Field label="Vibefit" value={val(s.mlVibefit)} />
        {s.mlNotes && <Field label="Notes" value={s.mlNotes} />}
      </div>
      <div className="final-score">
        <strong>Final ML Score:</strong>{' '}
        {numVal(s.mlScore.avg)}
        {s.mlScore.sum !== null && <span className="score-sum"> (sum: {s.mlScore.sum})</span>}
      </div>
    </Section>
  )

  const mainScoreSection = (
    <Section title="Judge Scores">
      <div className="judge-block">
        <h3>Judge 1</h3>
        <Field label="Technical" value={rawScore(s.j1Technical)} />
        <Field label="Flow" value={rawScore(s.j1Flow)} />
        <Field label="Entertainment" value={rawScore(s.j1Entertainment)} />
        {s.j1Notes && <Field label="Notes" value={s.j1Notes} />}
      </div>
      <div className="judge-block">
        <h3>Judge 2</h3>
        <Field label="Technical" value={rawScore(s.j2Technical)} />
        <Field label="Flow" value={rawScore(s.j2Flow)} />
        <Field label="Entertainment" value={rawScore(s.j2Entertainment)} />
        {s.j2Notes && <Field label="Notes" value={s.j2Notes} />}
      </div>
      <div className="final-score">
        <strong>Final Main Score:</strong>{' '}
        {numVal(s.mainScore.avg)}
        {s.mainScore.partial && <span className="partial-badge" title="Only one judge has scored"> *partial*</span>}
        {s.mainScore.sum !== null && <span className="score-sum"> (sum: {s.mainScore.sum})</span>}
      </div>
    </Section>
  )

  return (
    <div className="detail-view">
      <div className="detail-header-row">
        <button type="button" className="back-button" onClick={onBack}>← Back</button>
        <div className="detail-actions-menu" ref={menuRef}>
          <button
            type="button"
            className="btn-secondary btn-small"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            ⋯ Actions
          </button>
          {menuOpen && (
            <div className="nav-actions-dropdown detail-actions-dropdown">
              <button
                type="button"
                className={`detail-action-item${isDiscarded ? ' detail-action-item--active' : ''}`}
                onClick={() => { toggleDiscardSubmission(s.submissionNumber); setMenuOpen(false) }}
              >
                {isDiscarded ? '↩ Un-discard submission' : '🚫 Discard submission'}
              </button>
            </div>
          )}
        </div>
      </div>

      <h1 className="detail-title">{displayName}</h1>

      <SubmissionSummary submission={s} anonymousLabel={anonymousLabel} />

      <Section title="Basic Info">
        <Field label="DJ Name" value={hiddenNames ? anonymousLabel : val(s.djName)} />
        <Field label="Fur Name" value={hiddenNames ? '—' : val(s.furName)} />
        <Field label="Contact Email" value={val(s.contactEmail)} />
        <Field label="Telegram / Discord" value={val(s.telegramDiscord)} />
        <Field label="Social Media" value={val(s.socialMedia)} />
        <Field label="Phone" value={val(s.phone)} />
        <Field label="Submission Link" value={val(s.submissionLink)} />
        <Field label="Genre" value={val(s.genre)} />
        <Field label="Format / Gear" value={val(s.formatGear)} />
        <Field label="Days Available" value={val(s.daysAvailable)} />
        <Field label="Prior Experience" value={val(s.priorExperience)} />
        {s.notesForJudges && <Field label="Notes for Judges" value={s.notesForJudges} />}
        {s.bio && (
          <div className="field bio-field">
            <span className="field-label">Bio</span>
            <span className="field-value bio-text">{s.bio}</span>
          </div>
        )}
      </Section>

      {stagePrefsWithLabel.length > 0 && (
        <Section title="Stage Preferences">
          {stagePrefsWithLabel.map((p, i) => (
            <Field key={i} label={ORDINALS[i]} value={p.replace(`${ORDINALS[i]}: `, '')} />
          ))}
        </Section>
      )}

      {appContext === 'moonlight' ? (
        <>{moonlightSection}{mainScoreSection}</>
      ) : (
        <>{mainScoreSection}{moonlightSection}</>
      )}
    </div>
  )
}
