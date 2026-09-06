import { create } from 'zustand'

export interface Identity {
  nickname: string
  avatarId: string
}

interface IdentityState {
  identity: Identity | null
  setIdentity: (identity: Identity) => void
  clearIdentity: () => void
}

export const useIdentityStore = create<IdentityState>((set) => ({
  identity: null,
  setIdentity: (identity) => set({ identity }),
  clearIdentity: () => set({ identity: null }),
}))
