import http from './http'

import type { PageResponse, ReportFilters, ReportRow, ReportSummary } from '../types/operations'

const getReport = async (path: string, filters: ReportFilters) => {
  const { data } = await http.get<PageResponse<ReportRow> | ReportRow[]>(path, { params: filters })
  return Array.isArray(data) ? { content: data, totalElements: data.length } : data
}

export const getEarthquakeReport = (filters: ReportFilters) => getReport('/api/v1/reportes/sismos', filters)
export const getSimulationReport = (filters: ReportFilters) => getReport('/api/v1/reportes/simulacros', filters)
export const getDeviceReport = (filters: ReportFilters) => getReport('/api/v1/reportes/dispositivos', filters)
export const getFalseAlarmReport = (filters: ReportFilters) => getReport('/api/v1/reportes/falsas-alarmas', filters)

export async function getReportSummary(filters: Pick<ReportFilters, 'from' | 'to' | 'buildingId'>) {
  const { data } = await http.get<ReportSummary>('/api/v1/reportes/resumen', { params: filters })
  return data
}
