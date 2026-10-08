import type { EventStatus, Severity } from './enums'

export type EarthquakeEvent = {
  id: string
  deviceCode: string
  status: EventStatus
  severity: Severity
  peakAcceleration: number
  detectedAt: string
  resolvedAt?: string | null
  smsNotificationsSent: number
  reason?: string
}

export type FalseAlarmRequest = {
  reason: string
}

export type SimulateReadingRequest = {
  deviceCode: string
  timestamp: string
  ax: number
  ay: number
  az: number
  freqHz: number
  battery: number
}
