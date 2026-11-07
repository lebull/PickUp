import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../../../firebase.ts'

type LogoutButtonProps = {
  className?: string
}

export function LogoutButton({ className = 'btn-secondary' }: LogoutButtonProps) {
  const [busy, setBusy] = useState(false)

  async function handleLogout() {
    if (busy) return
    setBusy(true)
    try {
      await signOut(auth)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button type="button" className={className} onClick={handleLogout} disabled={busy}>
      {busy ? 'Signing out…' : 'Log out'}
    </button>
  )
}