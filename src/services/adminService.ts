import http from './http'

export type AdminUser = { id: number; fullName: string; email: string; role: string }
export type Building = { id: number; name: string; address: string; district?: string; city?: string; totalFloors?: number }
export type LayoutSetup = {
  levels: Array<{
    floor: number
    name: string
    rooms: Array<{ name: string; type: 'DOOR' | 'SPACE'; deviceIds: number[] }>
  }>
}

export const adminService = {
  listUsers: async () => (await http.get<AdminUser[]>('/api/v1/users')).data,
  listBuildings: async () => (await http.get<Building[]>('/api/v1/b2b/buildings')).data,
  createBuilding: async (payload: Omit<Building, 'id'>) => (await http.post<Building>('/api/v1/b2b/buildings', payload)).data,
  createUnit: async (payload: { buildingId: number; unit: string; residentId: number; deviceIds: number[] }) =>
    (await http.post('/api/v1/b2b/units', payload)).data,
  saveLayout: async (payload: LayoutSetup) => (await http.post('/api/v1/property/setup', payload)).data,
}
