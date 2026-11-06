import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { setUserCoordinator } from '../userRolesStore.ts'

type Mode = 'grant' | 'revoke'

function parseErrorMessage(err: unknown): string {
  if (!err || typeof err !== 'object') return 'Role update failed.'
  const maybe = err as { message?: unknown }
  if (typeof maybe.message === 'string' && maybe.message.trim()) return maybe.message
  return 'Role update failed.'
}

export function UserManagement() {
  const [targetIdentifier, setTargetIdentifier] = useState('')
  const [mode, setMode] = useState<Mode>('grant')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ uid: string; coordinator: boolean } | null>(null)

  const normalizedTarget = useMemo(() => targetIdentifier.trim(), [targetIdentifier])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)

    if (!normalizedTarget) {
      setError('Enter a user UID, email, or username.')
      return
    }

    setBusy(true)
    try {
      const coordinator = mode === 'grant'
      const resolvedUid = await setUserCoordinator(normalizedTarget, coordinator)
      setResult({ uid: resolvedUid, coordinator })
    } catch (err) {
      setError(parseErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="project-create-page">
      <header className="app-header">
        <Link to="/" className="back-link">← Projects</Link>
        <h1 className="app-title">User Management</h1>
      </header>

      <main className="app-main">
        <form className="project-create-form" onSubmit={handleSubmit}>
          <p className="empty-state-message user-mgmt-note">
            Manage coordinator access by Firebase Auth UID, email, or username. Users must sign in once so their profile is indexed.
          </p>

          <div className="form-field">
            <label htmlFor="user-target" className="form-label">User UID, Email, or Username</label>
            <input
              id="user-target"
              type="text"
              className="form-input"
              placeholder="uid, user@example.com, or username"
              value={targetIdentifier}
              onChange={(e) => setTargetIdentifier(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-field">
            <label htmlFor="role-action" className="form-label">Action</label>
            <select
              id="role-action"
              className="form-input"
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
            >
              <option value="grant">Grant coordinator role</option>
              <option value="revoke">Revoke coordinator role</option>
            </select>
          </div>

          {error && <p className="form-error">{error}</p>}

          {result && (
            <div className="user-mgmt-result">
              <p><strong>Updated user:</strong> {result.uid}</p>
              <p><strong>Coordinator:</strong> {result.coordinator ? 'yes' : 'no'}</p>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? 'Saving…' : mode === 'grant' ? 'Grant Access' : 'Revoke Access'}
            </button>
            <Link to="/" className="btn-secondary">Back</Link>
          </div>
        </form>
      </main>
    </div>
  )
}
