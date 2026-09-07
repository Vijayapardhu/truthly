import { auth } from '../lib/firebase'
import {
  signInAnonymously,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  OAuthProvider,
} from 'firebase/auth'

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

export async function signInWithGoogle(): Promise<string | null> {
  try {
    const provider = new GoogleAuthProvider()
    const cred = await signInWithPopup(auth, provider)
    return cred.user.uid
  } catch {
    return null
  }
}

export async function signInWithApple(): Promise<string | null> {
  try {
    const provider = new OAuthProvider('apple.com')
    const cred = await signInWithPopup(auth, provider)
    return cred.user.uid
  } catch {
    return null
  }
}

export function onAnonymousUser(callback: (uid: string | null) => void) {
  return onAuthStateChanged(auth, (user) => {
    callback(user?.uid || null)
  })
}
