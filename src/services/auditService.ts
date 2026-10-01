import http from './http'

import type { AuditFilters, AuditRecord, PageResponse } from '../types/operations'

export async function getAuditRecords(filters: AuditFilters) {
  const { data } = await http.get<PageResponse<AuditRecord> | AuditRecord[]>('/api/v1/auditoria', { params: filters })
  return Array.isArray(data) ? { content: data, totalElements: data.length } : data
}
