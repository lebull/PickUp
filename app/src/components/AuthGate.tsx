import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type User,
} from 'firebase/auth'
import { auth } from '../firebase'

export function AuthGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setReady(true)
    })
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      if (mode === 'signin') await signInWithEmailAndPassword(auth, email, password)
      else await createUserWithEmailAndPassword(auth, email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.')
    }
  }

  if (!ready) {
    return (
      <div className="app">
        <main className="app-main"><p className="loading-message">Loading…</p></main>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="app">
        <main className="app-main">
          <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: '4rem auto', display: 'grid', gap: '0.75rem' }}>
            <h1>{mode === 'signin' ? 'Sign in' : 'Create account'}</h1>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
            {error && <p role="alert">{error}</p>}
            <button type="submit" className="btn-primary">{mode === 'signin' ? 'Sign in' : 'Sign up'}</button>
            <button type="button" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
              {mode === 'signin' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
            </button>
          </form>
        </main>
      </div>
    )
  }

  return <>{children}</>
}
