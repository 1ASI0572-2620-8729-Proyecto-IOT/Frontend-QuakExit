export type BatteryStatus = {
  deviceId: string | number
  deviceCode?: string
  alias?: string
  level: number
  status: 'OK' | 'LOW' | 'CRITICAL'
  lastSeenAt: string
}