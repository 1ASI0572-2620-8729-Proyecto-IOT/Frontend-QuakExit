export type Earthquake = {
  id: string
  magnitude: number
  place: string
  depthKm: number
  latitude: number
  longitude: number
  occurredAt: string
}

export type EarthquakeRealtimeResponse = {
  earthquakes: Earthquake[]
  stale?: boolean
}