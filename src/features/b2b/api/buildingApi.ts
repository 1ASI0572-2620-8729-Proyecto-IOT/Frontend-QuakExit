import http from '../../../services/http'
import { env } from '../../../config/env'

import type { BuildingUnit } from '../types'
import type { DeviceBindingRequest } from '../../../types/device'

const mockUnits: BuildingUnit[] = [
  { id: 'unit-101', unit: '101', resident: 'María Torres', status: 'SAFE', devices: 4 },
  { id: 'unit-102', unit: '102', resident: 'Luis Rojas', status: 'ALERT', devices: 4 },
  { id: 'unit-201', unit: '201', resident: 'Ana Pérez', status: 'OFFLINE', devices: 2 },
  { id: 'unit-202', unit: '202', resident: 'Diego León', status: 'SAFE', devices: 5 },
]

export async function getBuildingUnits() {
  if (env.useMocks) return mockUnits
  // API: GET /b2b/units
  const { data } = await http.get<BuildingUnit[]>('/api/v1/b2b/units')
  return data
}

export type BulkRegisterRequest = {
  buildingId: number
  devices: DeviceBindingRequest[]
}

type BulkRegisterResponse = {
  registered?: number
  devicesAffected?: number
  message?: string
}

export async function bulkRegisterDevices(request: BulkRegisterRequest) {
  if (env.useMocks) return { registered: request.devices.length }
  const { data } = await http.post<BulkRegisterResponse>('/api/v1/b2b/devices/bulk-register', request)
  return data
}

export async function bulkRegisterDevicesCsv(buildingId: number, file: File) {
  const formData = new FormData()
  formData.append('buildingId', String(buildingId))
  formData.append('file', file)
  const { data } = await http.post<BulkRegisterResponse>('/api/v1/b2b/devices/bulk-register-csv', formData)
  return data
}

export async function triggerAllAlarms(buildingId: number) {
  if (env.useMocks) return { activated: true, devicesAffected: 0, scope: `building-${buildingId}` }
  // API: POST /b2b/alarms/trigger-all
  const { data } = await http.post<{ activated: boolean; devicesAffected: number; scope: string }>(`/api/v1/b2b/alarms/trigger-all?buildingId=${buildingId}`)
  return data
}