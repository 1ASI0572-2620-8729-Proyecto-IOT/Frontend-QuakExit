import http from './http'

import type { NotificationFilters, NotificationPreferences, NotificationRecord, PageResponse } from '../types/operations'

export async function getNotificationPreferences() {
  const { data } = await http.get<NotificationPreferences>('/api/v1/notificaciones/preferences')
  return data
}

export async function updateNotificationPreferences(preferences: NotificationPreferences) {
  const { data } = await http.put<NotificationPreferences>('/api/v1/notificaciones/preferences', preferences)
  return data
}

export async function registerPushToken(token: string) {
  const { data } = await http.post<{ id: number | string; token?: string }>('/api/v1/notificaciones/push-tokens', { token })
  return data
}

export async function deactivatePushToken(tokenId: number | string) {
  await http.delete(`/api/v1/notificaciones/push-tokens/${tokenId}`)
}

export async function getNotifications(filters: NotificationFilters) {
  const { data } = await http.get<PageResponse<NotificationRecord> | NotificationRecord[]>('/api/v1/notificaciones', { params: filters })
  return Array.isArray(data) ? { content: data, totalElements: data.length } : data
}
