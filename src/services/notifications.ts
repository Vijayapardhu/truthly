import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import app from '../lib/firebase'

let messaging: ReturnType<typeof getMessaging> | null = null

try {
  messaging = getMessaging(app)
} catch {
  messaging = null
}

export async function requestNotificationPermission(): Promise<string | null> {
  if (!messaging) return null

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null

    const token = await getToken(messaging, { vapidKey: undefined })
    if (!token) return null

    const uid = await getCurrentUserId()
    if (uid) {
      await setDoc(doc(db, 'userTokens', uid), {
        token,
        userId: uid,
        updatedAt: new Date(),
      })
    }

    return token
  } catch {
    return null
  }
}

async function getCurrentUserId(): Promise<string | null> {
  try {
    const { auth } = await import('../lib/firebase')
    const { onAuthStateChanged } = await import('firebase/auth')
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe()
        resolve(user?.uid || null)
      })
    })
  } catch {
    return null
  }
}

export function onNotificationMessage(callback: (payload: any) => void) {
  if (!messaging) return () => {}
  return onMessage(messaging, (payload) => {
    callback(payload)
  })
}
