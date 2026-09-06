const API_BASE = typeof window !== 'undefined' ? window.location.origin : '/'

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }

  if (res.status === 204) return null
  return res.json()
}

export const api = {
  createRoom: (data: {
    name: string
    visibility: string
    topics: string[]
    intensity: string
    allowSkipping: boolean
    skipsPerPlayer: number
    hostName: string
    hostAvatarId: string
  }) =>
    request('/api/rooms/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getRoomByCode: (code: string) => request(`/api/rooms/code/${encodeURIComponent(code)}`),

  async resolveRoomId(identifier: string): Promise<string> {
    try {
      const res = await this.getRoomByCode(identifier)
      return res.id
    } catch {
      const res = await this.getRoom(identifier)
      return res.room.id
    }
  },

  getRoom: (id: string) => request(`/api/rooms/${encodeURIComponent(id)}`),

  joinRoom: (roomId: string, data: { nickname: string; avatarId: string }) =>
    request(`/api/rooms/${encodeURIComponent(roomId)}/join`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  startGame: (roomId: string, playerId: string) =>
    request(`/api/rooms/${encodeURIComponent(roomId)}/start`, {
      method: 'POST',
      body: JSON.stringify({ playerId }),
    }),

  getChatMessages: (roomId: string) => request(`/api/chat/${encodeURIComponent(roomId)}`),

  sendChatMessage: (roomId: string, data: { playerId: string; playerName: string; playerAvatarId: string; text: string }) =>
    request(`/api/chat/${encodeURIComponent(roomId)}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}
