import type { DeviceStatus, LightStatus, LockStatus, PowerMode } from './enums'

export type DeviceBindingRequest = {
  deviceCode: string
  macAddress: string
  alias: string
}

export type DeviceStatusResponse = {
  id: string
  deviceCode: string
  alias?: string
  status: DeviceStatus
  lockStatus: LockStatus
  lightStatus: LightStatus
  battery?: number
  lastSeen?: string
  powerMode?: PowerMode
  connected?: boolean
  signalQuality?: number
}

export type DeviceRecord = {
  id: string
  deviceCode: string
  alias: string
  macAddress?: string
  status: DeviceStatus
  lockStatus: LockStatus
  lightStatus: LightStatus
  battery: number
  lastSeen: string
  powerMode: PowerMode
  connected: boolean
}
