import http from '../../../services/http'
import { env } from '../../../config/env'

import type { Earthquake, EarthquakeRealtimeResponse } from '../types'

const mockEarthquakes: Earthquake[] = [
  { id: 'mock-1', magnitude: 4.6, place: 'Cañete, Lima', depthKm: 41, latitude: -13.07, longitude: -76.39, occurredAt: '2026-09-30T14:20:00Z' },
  { id: 'mock-2', magnitude: 3.8, place: 'Chimbote, Ancash', depthKm: 54, latitude: -9.07, longitude: -78.59, occurredAt: '2026-09-30T10:10:00Z' },
  { id: 'mock-3', magnitude: 5.1, place: 'Arequipa, Arequipa', depthKm: 82, latitude: -16.40, longitude: -71.54, occurredAt: '2026-09-29T22:45:00Z' },
  { id: 'mock-4', magnitude: 3.4, place: 'Pisco, Ica', depthKm: 33, latitude: -13.71, longitude: -76.20, occurredAt: '2026-09-29T16:30:00Z' },
]

export async function getRealtimeEarthquakes(): Promise<EarthquakeRealtimeResponse> {
  if (env.useMocks) {
    return { earthquakes: mockEarthquakes, stale: false }
  }

  // API: GET /earthquakes/realtime
  const { data } = await http.get<Earthquake[] | EarthquakeRealtimeResponse>('/api/v1/earthquakes/realtime')
  return Array.isArray(data) ? { earthquakes: data } : data
}