import http from './http'
import { env } from '../config/env'

import type { DeviceBindingRequest, DeviceRecord, DeviceStatusResponse } from '../types/device'

type BackendDeviceResponse = Omit<DeviceRecord, 'battery' | 'lastSeen'> & {
  batteryPercentage: number
  lastSeenAt: string
  sirenStatus?: string
}

const mapDevice = (device: BackendDeviceResponse): DeviceRecord => ({
  ...device,
  battery: device.batteryPercentage,
  lastSeen: device.lastSeenAt,
})

export const deviceService = {
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
