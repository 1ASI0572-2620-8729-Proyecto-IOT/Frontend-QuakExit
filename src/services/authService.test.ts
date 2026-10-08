import { beforeEach, describe, expect, it, vi } from 'vitest'

import { authService } from './authService'
import http from './http'

vi.mock('./http', () => ({
  default: {
    post: vi.fn(),
  },
}))

const postMock = vi.mocked(http.post)

describe('F01 - User registration and login', () => {
  beforeEach(() => {
    postMock.mockReset()
  })

  it('registers a resident and maps the backend response', async () => {
    postMock.mockResolvedValueOnce({
      data: {
        token: 'registration-token',
        expiresInMs: 3600000,
        userId: 7,
        fullName: 'Ana Torres',
        email: 'ana@example.com',
        role: 'RESIDENT',
      },
    } as never)

    const result = await authService.register({
      fullName: 'Ana Torres',
      email: 'ana@example.com',
      password: 'SecurePass123!',
      phoneNumber: '+51987654321',
      propertyType: 'HOUSE',
      role: 'OWNER',
    })

    expect(postMock).toHaveBeenCalledWith('/api/v1/auth/register', {
      fullName: 'Ana Torres',
      email: 'ana@example.com',
      password: 'SecurePass123!',
      phoneNumber: '+51987654321',
      propertyType: 'HOUSE',
      ownershipRole: 'OWNER',
    })
    expect(result).toEqual({
      token: 'registration-token',
      user: {
        id: '7',
        fullName: 'Ana Torres',
        email: 'ana@example.com',
        role: 'RESIDENT',
      },
    })
  })

  it('logs in a registered resident with the supplied credentials', async () => {
    postMock.mockResolvedValueOnce({
      data: {
        token: 'login-token',
        expiresInMs: 3600000,
        userId: 7,
        fullName: 'Ana Torres',
        email: 'ana@example.com',
        role: 'RESIDENT',
      },
    } as never)

    const result = await authService.login({
      email: 'ana@example.com',
      password: 'SecurePass123!',
    })

    expect(postMock).toHaveBeenCalledWith('/api/v1/auth/login', {
      email: 'ana@example.com',
      password: 'SecurePass123!',
    })
    expect(result.token).toBe('login-token')
    expect(result.user.email).toBe('ana@example.com')
  })
})
