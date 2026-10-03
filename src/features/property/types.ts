export type PropertyCardType = 'DOOR' | 'SPACE'

export type PropertyCard = {
  id: string
  type: PropertyCardType
  name: string
  state: string
  battery?: number
  deviceIds: number[]
}

export type PropertyLevel = {
  id: string
  floor: number
  name: string
  cards: PropertyCard[]
}

export type PropertyLayout = {
  levels: PropertyLevel[]
}

export type BackendPropertyLayout = {
  id?: number
  ownerId?: number
  levels: Array<{
    id?: number
    floor: number
    name: string
    rooms: Array<{
      id?: number
      name: string
      type?: PropertyCardType
      deviceIds?: number[]
    }>
  }>
}

export type SimulationRequest = {
  target: 'COMMON_AREAS' | 'PRIVATE_HOME'
  type: 'MANUAL' | 'SCHEDULED'
}

export type SimulationResponse = {
  simulation_id: string
  simulation_active: boolean
  duration_seconds: number
  target?: 'COMMON_AREAS' | 'PRIVATE_HOME'
  results?: Array<{
    device_id: number
    success: boolean
    error_message: string | null
  }>
}