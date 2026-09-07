import { useEffect } from 'react'
import { useIdentityStore } from '../stores/identity-store'

const SESSION_KEY = 'truthly-session'

function loadSession() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function SessionHydrator() {
  const setIdentity = useIdentityStore((state) => state.setIdentity)
  const identity = useIdentityStore((state) => state.identity)

  useEffect(() => {
    if (identity) return
    const session = loadSession()
    if (session?.nickname && session?.avatarId) {
      setIdentity({ nickname: session.nickname, avatarId: session.avatarId })
    }
  }, [identity, setIdentity])

  return null
}
