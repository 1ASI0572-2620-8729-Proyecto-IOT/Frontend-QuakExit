import http from './http'

import type { EarthquakeEvent, FalseAlarmRequest, SimulateReadingRequest } from '../types/emergency'

export const emergencyService = {
  simulateReading: async (payload: SimulateReadingRequest) => {
    const { data } = await http.post<{
      id: number
      deviceId: number
      status: EarthquakeEvent['status']
      severity: EarthquakeEvent['severity']
      peakAcceleration: number
      detectedAt: string
      resolvedAt?: string | null
      smsNotificationsSent: number
    } | null>('/api/v1/internal/mqtt/simulate-reading', payload)
    return data ? {
      ...data,
      id: String(data.id),
      deviceCode: payload.deviceCode,
    } satisfies EarthquakeEvent : null
  },
  markFalseAlarm: async (eventId: string, payload: FalseAlarmRequest) => {
    const { data } = await http.post<{ ok: true }>(`/api/v1/emergencies/${eventId}/false-alarm`, payload)
    return data
  },
}
