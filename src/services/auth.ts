import { auth } from '../lib/firebase'
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth'

let currentUserPromise: Promise<string> | null = null

export async function getOrCreateAnonymousUserId(): Promise<string> {
  if (currentUserPromise) return currentUserPromise

  currentUserPromise = new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      if (user) {
        resolve(user.uid)
      } else {
        signInAnonymously(auth).then((cred) => {
          resolve(cred.user.uid)
        }).catch(() => {
          resolve(`local-${Math.random().toString(36).slice(2, 15)}`)
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
