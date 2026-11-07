import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { auth } from '../../../firebase.ts'
import { db } from '../../../firebase.ts'
import { hasCoordinatorRole } from '../../../authz.ts'

function getDefaultUsername(user: User): string {
  if (user.displayName && user.displayName.trim()) return user.displayName.trim()
  const email = user.email ?? ''
  const at = email.indexOf('@')
  return at > 0 ? email.slice(0, at) : user.uid
}

async function syncUserProfile(user: User): Promise<void> {
  const username = getDefaultUsername(user)
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email: user.email ?? null,
    emailLower: user.email ? user.email.toLowerCase() : null,
    username,
    usernameLower: username.toLowerCase(),
    lastSeenAt: new Date().toISOString(),
  }, { merge: true })
}

export function AuthGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const [authorized, setAuthorized] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | null = null

    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u)

      if (unsubscribeUserDoc) {
        unsubscribeUserDoc()
        unsubscribeUserDoc = null
      }

      if (!u) {
        setAuthorized(false)
        setReady(true)
        return
      }

      void syncUserProfile(u).catch(() => {
        // Best-effort profile sync; authorization is still determined from roles.
      })

      unsubscribeUserDoc = onSnapshot(doc(db, 'users', u.uid), (snap) => {
        setAuthorized(hasCoordinatorRole(snap.data()))
        setReady(true)
      }, () => {
        setAuthorized(false)
        setReady(true)
      })
    })

    return () => {
      unsubscribeAuth()
      if (unsubscribeUserDoc) unsubscribeUserDoc()
    }
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

  if (!authorized) {
    return (
      <div className="app">
        <main className="app-main">
          <div className="empty-state">
            <p className="empty-state-message">You do not have permission to access projects.</p>
            <p className="empty-state-message">Ask an administrator to assign the coordinator role to your account.</p>
            <button type="button" className="btn-secondary" onClick={() => signOut(auth)}>
              Sign out
            </button>
          </div>
        </main>
      </div>
    )
  }

  return <>{children}</>
}
