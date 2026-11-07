import { collection, doc, getDocs, limit, query, setDoc, where } from 'firebase/firestore'
import { db } from './firebase.ts'

async function resolveUid(target: string): Promise<string> {
  const normalized = target.trim()
  if (!normalized) throw new Error('User identifier is required.')

  const usersCol = collection(db, 'users')

  if (normalized.includes('@')) {
    const byEmail = query(usersCol, where('emailLower', '==', normalized.toLowerCase()), limit(1))
    const emailSnap = await getDocs(byEmail)
    if (emailSnap.empty) {
      throw new Error('No user found with that email. Ask them to sign in to the app once, then try again.')
    }
    return emailSnap.docs[0].id
  }

  const byUsername = query(usersCol, where('usernameLower', '==', normalized.toLowerCase()), limit(1))
  const usernameSnap = await getDocs(byUsername)
  if (!usernameSnap.empty) return usernameSnap.docs[0].id

  return normalized
}

export async function setUserCoordinator(target: string, coordinator: boolean): Promise<string> {
  const uid = await resolveUid(target)

  await setDoc(doc(db, 'users', uid), {
    roles: {
      coordinator,
    },
    updatedAt: new Date().toISOString(),
  }, { merge: true })

  return uid
}
