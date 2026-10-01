import http from './http'

import type { MaintenanceAlert, MaintenanceFilters, PageResponse } from '../types/operations'

export async function getMaintenanceAlerts(filters: MaintenanceFilters) {
  const { data } = await http.get<PageResponse<MaintenanceAlert> | MaintenanceAlert[]>('/api/v1/maintenance-alerts', { params: filters })
  return Array.isArray(data) ? { content: data, totalElements: data.length } : data
}

export async function acknowledgeMaintenanceAlert(id: number | string) {
  const { data } = await http.patch<MaintenanceAlert>(`/api/v1/maintenance-alerts/${id}/acknowledge`)
  return data
}

export async function resolveMaintenanceAlert(id: number | string, resolutionNote: string) {
  const { data } = await http.patch<MaintenanceAlert>(`/api/v1/maintenance-alerts/${id}/resolve`, { resolutionNote })
  return data
}
