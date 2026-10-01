export const roomLabels = ['Sala', 'Cocina', 'Dormitorio principal', 'Dormitorio 2', 'Baño', 'Pasillo', 'Garaje', 'Jardín']

export type DoorState = 'LOCKED' | 'UNLOCKED' | 'FAULT' | 'UNKNOWN'
export type LightState = 'ON' | 'OFF' | 'FAULT' | 'UNKNOWN'

export function getDoorAngle(state: DoorState) {
  if (state === 'UNLOCKED') return 75
  if (state === 'FAULT' || state === 'UNKNOWN') return 0
  return 0
}

export function getHouseSummary(state: string, count: { opened: number; lit: number }) {
  if (state === 'ALERT') {
    return `Casa en alerta: ${count.opened} puertas abiertas, ${count.lit} luces encendidas.`
  }

  return `Casa en ${state.toLowerCase()}: ${count.opened} puertas abiertas, ${count.lit} luces encendidas.`
}
