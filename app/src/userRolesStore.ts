import { collection, deleteDoc, doc, getDocs, limit, query, setDoc, where } from 'firebase/firestore'
import { db } from './firebase.ts'

type ResolvedTarget =
  | { type: 'uid'; uid: string }
  | { type: 'emailGrant'; emailLower: string }

async function resolveTarget(target: string): Promise<ResolvedTarget> {
  const normalized = target.trim()
  if (!normalized) throw new Error('User identifier is required.')

  const usersCol = collection(db, 'users')

  if (normalized.includes('@')) {
    const emailLower = normalized.toLowerCase()
    const byEmail = query(usersCol, where('emailLower', '==', emailLower), limit(1))
    const emailSnap = await getDocs(byEmail)
    if (emailSnap.empty) return { type: 'emailGrant', emailLower }
    return { type: 'uid', uid: emailSnap.docs[0].id }
  }

  const byUsername = query(usersCol, where('usernameLower', '==', normalized.toLowerCase()), limit(1))
  const usernameSnap = await getDocs(byUsername)
  if (!usernameSnap.empty) return { type: 'uid', uid: usernameSnap.docs[0].id }

  return { type: 'uid', uid: normalized }
}

export async function setUserCoordinator(target: string, coordinator: boolean): Promise<string> {
  const resolved = await resolveTarget(target)

  if (resolved.type === 'emailGrant') {
    const grantRef = doc(db, 'roleGrants', resolved.emailLower)
    if (coordinator) {
      await setDoc(grantRef, {
        coordinator: true,
        updatedAt: new Date().toISOString(),
      }, { merge: true })
    } else {
      await deleteDoc(grantRef)
    }

    return resolved.emailLower
  }

  await setDoc(doc(db, 'users', resolved.uid), {
    roles: {
      coordinator,
    },
    updatedAt: new Date().toISOString(),
  }, { merge: true })

  return resolved.uid
}
