import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'

import { env } from '../config/env'
import { ApiError } from '../types/api-error'
import { useAuthStore } from '../store/authStore'

const http = axios.create({
  baseURL: env.apiUrl || undefined,
  timeout: 15000,
})

const refreshClient = axios.create({ baseURL: env.apiUrl || undefined, timeout: 15000 })

type RetryableRequestConfig = AxiosRequestConfig & { _retry?: boolean }

const appendAuthToken = (config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

http.interceptors.request.use((config) => appendAuthToken(config))

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; fieldErrors?: Array<{ field: string; message: string }> }>) => {
    const status = error.response?.status ?? 500
    const request = error.config as RetryableRequestConfig | undefined
    const refreshToken = useAuthStore.getState().refreshToken

    if (status === 401 && request && !request._retry && refreshToken) {
      request._retry = true

      try {
        const { data } = await refreshClient.post<{ token: string; refreshToken?: string }>(
          '/api/v1/auth/refresh',
          { refreshToken },
        )
        useAuthStore.getState().setToken(data.token)
        if (data.refreshToken) {
          useAuthStore.setState({ refreshToken: data.refreshToken })
        }
        request.headers = {
          ...request.headers,
          Authorization: `Bearer ${data.token}`,
        }
        return http(request)
      } catch {
        useAuthStore.getState().logout()
      }
    }

    const message =
      error.response?.data?.message ??
      (status === 401 ? 'Tu sesión expiró' : error.message ?? 'Ocurrió un error inesperado')
    const fieldErrors = error.response?.data?.fieldErrors

    if (status === 401) {
      useAuthStore.getState().logout()
      window.location.assign(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
    }

    if (status === 403) {
      window.location.assign('/403')
    }

    return Promise.reject(
      new ApiError({
        status,
        message,
        fieldErrors,
      }),
    )
  },
)

export default http
