import { auth } from '../lib/firebase'
import {
  signInAnonymously,
  onAuthStateChanged,
} from 'firebase/auth'

const LOCAL_UID_KEY = 'truthly-uid'

function getLocalUid(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(LOCAL_UID_KEY)
  } catch {
    return null
  }
}

function setLocalUid(uid: string) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LOCAL_UID_KEY, uid)
  } catch {
    // ignore
  }
}

function generateLocalUid(): string {
  return `local-${Math.random().toString(36).slice(2, 15)}`
}

let currentUserPromise: Promise<string> | null = null

export async function getOrCreateAnonymousUserId(): Promise<string> {
  if (currentUserPromise) return currentUserPromise

  const existing = getLocalUid()
  if (existing) {
    currentUserPromise = Promise.resolve(existing)
    return currentUserPromise
  }

  currentUserPromise = new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      if (user) {
        setLocalUid(user.uid)
        resolve(user.uid)
      } else {
        signInAnonymously(auth).then((cred) => {
          setLocalUid(cred.user.uid)
          resolve(cred.user.uid)
        }).catch(() => {
          const localUid = generateLocalUid()
          setLocalUid(localUid)
          resolve(localUid)
        })
      }
    })
  })

  return currentUserPromise
}

export function onAnonymousUser(callback: (uid: string | null) => void) {
  return onAuthStateChanged(auth, (user) => {
    callback(user?.uid || null)
  })
}
