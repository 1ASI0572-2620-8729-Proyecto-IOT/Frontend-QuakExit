import http from '../../../services/http'
import { env } from '../../../config/env'
import { ApiError } from '../../../types/api-error'

import type { BackendPropertyLayout, PropertyLayout, SimulationRequest, SimulationResponse } from '../types'

const mockLayout: PropertyLayout = {
  levels: [
    { id: 'level-1', name: 'Piso 1', cards: [{ id: 'card-1', type: 'DOOR', name: 'Puerta Principal', state: 'LOCKED', battery: 88 }, { id: 'card-2', type: 'SPACE', name: 'Sala', state: 'ONLINE', battery: 76 }] },
    { id: 'level-2', name: 'Piso 2', cards: [{ id: 'card-3', type: 'SPACE', name: 'Cuarto Principal', state: 'ONLINE', battery: 63 }] },
  ],
}

export async function getPropertyLayout() {
  if (env.useMocks) return mockLayout

  // API: GET /property/layout
  try {
    const { data } = await http.get<BackendPropertyLayout>('/api/v1/property/layout')
    return normalizeLayout(data)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return savePropertyLayout(mockLayout)
    }
    throw error
  }
}

export async function savePropertyLayout(layout: PropertyLayout) {
  if (env.useMocks) return layout

  // API: POST /property/setup
  const { data } = await http.post<BackendPropertyLayout>('/api/v1/property/setup', serializeLayout(layout))
  return normalizeLayout(data)
}

export async function triggerSimulation(request: SimulationRequest) {
  if (env.useMocks) return { simulation_id: `mock-${Date.now()}`, simulation_active: true, duration_seconds: 30, target: request.target }

  // API: POST /simulations/trigger
  const { data } = await http.post<SimulationResponse>('/api/v1/simulations/trigger', request)
  return data
}

function normalizeLayout(layout: BackendPropertyLayout): PropertyLayout {
  return {
    levels: layout.levels.map((level, levelIndex) => ({
      id: `level-${level.floor ?? levelIndex + 1}`,
      name: level.name,
      cards: level.rooms.map((room, roomIndex) => ({
        id: `room-${level.floor ?? levelIndex + 1}-${roomIndex}`,
        type: room.name.toLowerCase().includes('puerta') ? 'DOOR' : 'SPACE',
        name: room.name,
        state: 'ONLINE',
        battery: undefined,
      })),
    })),
  }
}

function serializeLayout(layout: PropertyLayout): BackendPropertyLayout {
  return {
    levels: layout.levels.map((level, index) => ({
      floor: index + 1,
      name: level.name,
      rooms: level.cards.map((card) => ({ name: card.name })),
    })),
  }
}
