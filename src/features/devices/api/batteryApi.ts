import http from '../../../services/http'
import { env } from '../../../config/env'

import type { BatteryStatus } from '../types'

const mockBatteries: BatteryStatus[] = [
  { deviceId: 'hub-01', level: 82, status: 'OK', lastSeenAt: '2026-09-30T14:40:00Z' },
  { deviceId: 'hub-02', level: 24, status: 'LOW', lastSeenAt: '2026-09-30T14:38:00Z' },
  { deviceId: 'hub-03', level: 8, status: 'CRITICAL', lastSeenAt: '2026-09-30T14:35:00Z' },
]

type BackendBatteryStatus = {
  deviceId: number
  deviceCode: string
  alias: string
  batteryPercentage: number
  status: 'ONLINE' | 'OFFLINE' | 'ALERT'
  lastSeenAt: string
}

export async function getBatteryStatus() {
  if (env.useMocks) return mockBatteries

  // API: GET /devices/battery-status
  const { data } = await http.get<BackendBatteryStatus[]>('/api/v1/devices/battery-status')
  return data.map((device) => ({
    deviceId: device.deviceId,
    deviceCode: device.deviceCode,
    alias: device.alias,
    level: device.batteryPercentage,
    status: device.status === 'ALERT' || device.batteryPercentage < 10 ? 'CRITICAL' : device.status === 'OFFLINE' || device.batteryPercentage < 30 ? 'LOW' : 'OK',
    lastSeenAt: device.lastSeenAt,
  }))
}