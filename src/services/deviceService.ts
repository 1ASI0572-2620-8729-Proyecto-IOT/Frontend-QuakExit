import http from './http'
import { env } from '../config/env'

import type { DeviceBindingRequest, DeviceRecord, DeviceStatusResponse } from '../types/device'

type BackendDeviceResponse = Omit<DeviceRecord, 'battery' | 'lastSeen'> & {
  batteryPercentage: number
  lastSeenAt: string
  sirenStatus?: string
}

const mockDevices: DeviceRecord[] = [
  { id: 'hp-1', alias: 'Puerta principal', deviceCode: 'QX-005', status: 'ONLINE', battery: 88, lockStatus: 'LOCKED', lightStatus: 'OFF', lastSeen: 'Ahora', powerMode: 'NORMAL', connected: true },
  { id: 'hp-2', alias: 'Dormitorio principal', deviceCode: 'QX-012', status: 'SLEEPING', battery: 63, lockStatus: 'LOCKED', lightStatus: 'OFF', lastSeen: 'Hace 2 min', powerMode: 'DEEP_SLEEP', connected: true },
  { id: 'hp-3', alias: 'Garaje', deviceCode: 'QX-029', status: 'ALERT', battery: 24, lockStatus: 'FAULT', lightStatus: 'ON', lastSeen: 'Hace 1 min', powerMode: 'NORMAL', connected: true },
]

const mapDevice = (device: BackendDeviceResponse): DeviceRecord => ({
  ...device,
  id: String(device.id),
  battery: device.batteryPercentage,
  lastSeen: device.lastSeenAt,
})

export const deviceService = {
  list: async () => {
    if (env.useMocks) {
      return mockDevices
    }

    const { data } = await http.get<BackendDeviceResponse[]>('/api/v1/devices')
    return data.map(mapDevice)
  },
  bind: async (payload: DeviceBindingRequest) => {
    if (env.useMocks) {
      return {
        id: `mock-${Date.now()}`,
        ...payload,
        status: 'ONLINE',
        lockStatus: 'LOCKED',
        lightStatus: 'OFF',
        battery: 100,
        lastSeen: new Date().toISOString(),
        powerMode: 'NORMAL',
        connected: true,
      } satisfies DeviceRecord
    }

    // API: POST /devices/bind
    const { data } = await http.post<BackendDeviceResponse>('/api/v1/devices/bind', payload)
    return mapDevice(data)
  },
  getStatus: async (id: string) => {
    if (env.useMocks) {
      return {
        id,
        deviceCode: 'QX-005',
        alias: 'Puerta principal',
        status: 'ONLINE',
        lockStatus: 'LOCKED',
        lightStatus: 'OFF',
        battery: 88,
        lastSeen: new Date().toISOString(),
        powerMode: 'NORMAL',
        connected: true,
      } satisfies DeviceStatusResponse
    }

    const { data } = await http.get<BackendDeviceResponse>(`/api/v1/devices/${id}/status`)
    return mapDevice(data) as DeviceStatusResponse
  },
  unlockPrivate: async (id: string) => {
    if (env.useMocks) {
      return { id, lockStatus: 'UNLOCKED' } satisfies Pick<DeviceStatusResponse, 'id' | 'lockStatus'>
    }

    const { data } = await http.post<DeviceStatusResponse>(`/api/v1/devices/${id}/unlock-private`)
    return data
  },
  setPowerMode: async (id: string, powerMode: 'DEEP_SLEEP' | 'NORMAL') => {
    if (env.useMocks) {
      return { id, powerMode } satisfies Pick<DeviceStatusResponse, 'id' | 'powerMode'>
    }

    const { data } = await http.put<DeviceStatusResponse>(`/api/v1/devices/${id}/power-mode`, {
      powerMode,
    })
    return data
  },
}
