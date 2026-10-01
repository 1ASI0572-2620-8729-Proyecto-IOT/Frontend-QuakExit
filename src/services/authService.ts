import http from './http'

import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth'
import type { RegistrationRole } from '../types/auth'

type BackendAuthResponse = {
  token: string
  expiresInMs: number
  userId: number
  fullName: string
  email: string
  role: AuthResponse['user']['role']
}

type BackendRegisterRequest = Omit<RegisterRequest, 'role'> & {
  ownershipRole: RegistrationRole
}

const mapAuthResponse = (response: BackendAuthResponse): AuthResponse => ({
  token: response.token,
  user: {
    id: String(response.userId),
    fullName: response.fullName,
    email: response.email,
    role: response.role,
  },
})

export const authService = {
  register: async (payload: RegisterRequest) => {
    // API: POST /auth/register
    const backendPayload: BackendRegisterRequest = {
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password,
      phoneNumber: payload.phoneNumber,
      propertyType: payload.propertyType,
      ownershipRole: payload.role,
    }
    const { data } = await http.post<BackendAuthResponse>('/api/v1/auth/register', backendPayload)
    return mapAuthResponse(data)
  },
  login: async (payload: LoginRequest) => {
    // API: POST /auth/login
    const { data } = await http.post<BackendAuthResponse>('/api/v1/auth/login', payload)
    return mapAuthResponse(data)
  },
}
