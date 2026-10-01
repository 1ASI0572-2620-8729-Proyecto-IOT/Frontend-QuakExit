import type { UserRole } from './enums'

export type RegistrationPropertyType = 'HOUSE' | 'APARTMENT'
export type RegistrationRole = 'OWNER' | 'RENTER' | 'BUILDING_ADMIN'

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  fullName: string
  email: string
  password: string
  phoneNumber: string
  propertyType: RegistrationPropertyType
  role: RegistrationRole
}

export type AuthTokenPayload = {
  sub?: string
  email?: string
  fullName?: string
  role?: UserRole
  exp?: number
  iat?: number
}

export type AuthUser = {
  id: string
  email: string
  fullName: string
  role: UserRole
}

export type AuthResponse = {
  token: string
  refreshToken?: string
  user: AuthUser
}
