export type PageParams = {
  page?: number
  size?: number
}

export type PageResponse<T> = {
  content?: T[]
  items?: T[]
  data?: T[]
  totalElements?: number
  totalPages?: number
  page?: number
  size?: number
}

export type AuditFilters = PageParams & {
  userId?: string
  action?: string
  from?: string
  to?: string
  propertyId?: string
  buildingId?: string
  entityType?: string
}

export type AuditRecord = {
  id: number | string
  action: string
  entityType?: string
  entityId?: number | string
  userId?: number | string
  userName?: string
  propertyId?: number | string
  buildingId?: number | string
  createdAt?: string
  details?: string | Record<string, unknown>
}

export type NotificationChannel = 'PUSH' | 'SMS' | 'WHATSAPP'
export type NotificationType = 'EARTHQUAKE' | 'EMERGENCY' | 'BULK_ALARM' | 'LOW_BATTERY' | 'DEVICE_OFFLINE'
export type NotificationStatus = 'SENT' | 'FAILED' | 'RETRIED' | 'SIMULATION'

export type NotificationPreferences = {
  push: boolean
  sms: boolean
  whatsapp: boolean
  earthquakes: boolean
  emergencies: boolean
  bulkAlarms: boolean
  lowBattery: boolean
  deviceOffline: boolean
}

export type NotificationRecord = {
  id: number | string
  channel: NotificationChannel
  type: NotificationType
  status: NotificationStatus
  recipient?: string
  message?: string
  createdAt?: string
}

export type NotificationFilters = PageParams & {
  channel?: NotificationChannel
  status?: NotificationStatus
  type?: NotificationType
  from?: string
  to?: string
}

export type ReportFilters = PageParams & {
  from?: string
  to?: string
  buildingId?: string
  status?: string
  minAcceleration?: string
  maxAcceleration?: string
  powerMode?: string
  lowBattery?: boolean
  disconnected?: boolean
  deviceId?: string
}

export type ReportRow = Record<string, unknown> & { id?: number | string; createdAt?: string; status?: string }

export type ReportSummary = {
  activeDevices?: number
  activeAlerts?: number
  totalEvents?: number
  from?: string
  to?: string
}

export type MaintenanceStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED'
export type MaintenanceType = 'LOW_BATTERY' | 'DEVICE_OFFLINE'

export type MaintenanceAlert = {
  id: number | string
  type: MaintenanceType
  status: MaintenanceStatus
  deviceId?: number | string
  deviceName?: string
  buildingId?: number | string
  message?: string
  createdAt?: string
  resolutionNote?: string
}

export type MaintenanceFilters = PageParams & {
  status?: MaintenanceStatus
  type?: MaintenanceType
  deviceId?: string
  buildingId?: string
}
