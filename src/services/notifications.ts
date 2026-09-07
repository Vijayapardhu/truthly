import { getMessaging, getToken, onMessage } from 'firebase/messaging'
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

    return token
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
