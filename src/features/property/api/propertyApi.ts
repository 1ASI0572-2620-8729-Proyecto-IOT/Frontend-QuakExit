import http from '../../../services/http'
import { env } from '../../../config/env'
import { ApiError } from '../../../types/api-error'

import type { BackendPropertyLayout, PropertyLayout, SimulationRequest, SimulationResponse } from '../types'

const mockLayout: PropertyLayout = {
  levels: [
    { id: 'level-1', floor: 1, name: 'Piso 1', cards: [{ id: 'card-1', type: 'DOOR', name: 'Puerta Principal', state: 'LOCKED', battery: 88, deviceIds: [] }, { id: 'card-2', type: 'SPACE', name: 'Sala', state: 'ONLINE', battery: 76, deviceIds: [] }] },
    { id: 'level-2', floor: 2, name: 'Piso 2', cards: [{ id: 'card-3', type: 'SPACE', name: 'Cuarto Principal', state: 'ONLINE', battery: 63, deviceIds: [] }] },
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
      return null
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
      id: String(level.id ?? `level-${level.floor ?? levelIndex + 1}`),
      floor: level.floor ?? levelIndex + 1,
      name: level.name,
      cards: level.rooms.map((room, roomIndex) => ({
        id: String(room.id ?? `room-${level.floor ?? levelIndex + 1}-${roomIndex}`),
        type: room.type ?? 'SPACE',
        name: room.name,
        state: 'ONLINE',
        battery: undefined,
        deviceIds: room.deviceIds ?? [],
      })),
    })),
  }
}

function serializeLayout(layout: PropertyLayout): BackendPropertyLayout {
  return {
    levels: layout.levels.map((level, index) => ({
      id: toNumericId(level.id),
      floor: index + 1,
      name: level.name,
      rooms: level.cards.map((card) => ({
        id: toNumericId(card.id),
        name: card.name,
        type: card.type,
        deviceIds: card.deviceIds,
      })),
    })),
  }
}

function toNumericId(id: string) {
  const numericId = Number(id)
  return Number.isSafeInteger(numericId) ? numericId : undefined
}
