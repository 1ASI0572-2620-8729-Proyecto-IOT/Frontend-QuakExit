import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { AuthUser } from '../types/auth'

type AuthState = {
  token: string | null
  refreshToken: string | null
  user: AuthUser | null
  remember: boolean
  setSession: (token: string, user: AuthUser, remember?: boolean, refreshToken?: string) => void
  setToken: (token: string) => void
  logout: () => void
  setRemember: (value: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      remember: false,
      setSession: (token, user, remember = false, refreshToken = '') =>
        set({ token, user, remember, refreshToken: refreshToken || null }),
      setToken: (token) => set({ token }),
      logout: () => set({ token: null, refreshToken: null, user: null }),
      setRemember: (value) => set({ remember: value }),
    }),
    {
      name: 'quakexit-auth',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
