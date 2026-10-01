import { useMemo } from 'react'
import { jwtDecode } from 'jwt-decode'

import type { AuthTokenPayload } from '../types/auth'
import { useAuthStore } from '../store/authStore'

export const isJwtExpired = (token: string | null) => {
  if (!token) return true

  try {
    const payload = jwtDecode<AuthTokenPayload>(token)
    if (!payload.exp) return false
    return Date.now() >= payload.exp * 1000
  } catch {
    return true
  }
}

export function useAuth() {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)

  return useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token) && !isJwtExpired(token),
      logout: useAuthStore.getState().logout,
    }),
    [token, user],
  )
}
