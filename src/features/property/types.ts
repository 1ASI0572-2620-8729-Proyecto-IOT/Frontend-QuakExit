export type PropertyCardType = 'DOOR' | 'SPACE'

export type PropertyCard = {
  id: string
  type: PropertyCardType
  name: string
  state: string
  battery?: number
}

export type PropertyLevel = {
  id: string
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
    floor: number
    name: string
    rooms: Array<{ name: string }>
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
}