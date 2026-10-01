import { create } from 'zustand'

import type { EarthquakeEvent } from '../types/emergency'

type SessionEventStore = {
  events: EarthquakeEvent[]
  addEvent: (event: EarthquakeEvent) => void
  clear: () => void
}

export const useSessionEventsStore = create<SessionEventStore>((set) => ({
  events: [],
  addEvent: (event) => set((state) => ({ events: [event, ...state.events] })),
  clear: () => set({ events: [] }),
}))
