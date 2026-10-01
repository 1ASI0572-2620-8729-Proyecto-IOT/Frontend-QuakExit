import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import type { UserRole } from '../types/enums'
import { useAuthStore } from '../store/authStore'

const isTokenExpired = (token: string | null) => {
  if (!token) return true

  const payload = token.split('.')[1]
  if (!payload) return true

  try {
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    if (!decoded.exp) return false
    return Date.now() >= decoded.exp * 1000
  } catch {
    return true
  }
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation()
  const token = useAuthStore((state) => state.token)

  if (!token || isTokenExpired(token)) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  return <>{children}</>
}

export function RoleRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[]
  children: ReactNode
}) {
  const user = useAuthStore((state) => state.user)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />
  }

  return <>{children}</>
}
