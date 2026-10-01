/*
  These typed stubs intentionally avoid calling endpoints that do not exist yet,
  but they keep the API surface ready for future backend features.
*/

import type { EarthquakeEvent } from '../types/emergency'

export type UserProfile = {
  id: string
  email: string
  fullName: string
  role: 'HOMEOWNER' | 'B2B_ADMIN'
}

export const futureServices = {
  getCurrentUser: async () => ({
    data: null,
  }),
  getActiveEmergencies: async () => ({
    data: [] as EarthquakeEvent[],
  }),
  getEmergencyHistory: async () => ({
    data: [] as EarthquakeEvent[],
  }),
  getSimulationTemplates: async () => ({
    data: [],
  }),
  getB2bOverview: async () => ({
    data: null,
  }),
}
