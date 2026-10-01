import http from './http'

import type { EarthquakeEvent, FalseAlarmRequest, SimulateReadingRequest } from '../types/emergency'

export const emergencyService = {
  simulateReading: async (payload: SimulateReadingRequest) => {
    const { data } = await http.post<EarthquakeEvent | { event?: EarthquakeEvent; message?: string }>(
      '/api/v1/internal/mqtt/simulate-reading',
      payload,
    )
    return data
  },
  markFalseAlarm: async (eventId: string, payload: FalseAlarmRequest) => {
    const { data } = await http.post<{ ok: true }>(`/api/v1/emergencies/${eventId}/false-alarm`, payload)
    return data
  },
}
