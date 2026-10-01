import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type BoundDevice = {
  id: string
  deviceCode: string
  alias: string
  macAddress?: string
}

type DeviceStore = {
  devicesByUser: Record<string, BoundDevice[]>
  addDevice: (userId: string, device: BoundDevice) => void
  removeDevice: (userId: string, deviceId: string) => void
  getDevicesForUser: (userId: string) => BoundDevice[]
}

export const useDeviceStore = create<DeviceStore>()(
  persist(
    (set, get) => ({
      devicesByUser: {},
      addDevice: (userId, device) =>
        set((state) => ({
          devicesByUser: {
            ...state.devicesByUser,
            [userId]: [...(state.devicesByUser[userId] ?? []), device],
          },
        })),
      removeDevice: (userId, deviceId) =>
        set((state) => ({
          devicesByUser: {
            ...state.devicesByUser,
            [userId]: (state.devicesByUser[userId] ?? []).filter((device) => device.id !== deviceId),
          },
        })),
      getDevicesForUser: (userId) => get().devicesByUser[userId] ?? [],
    }),
    { name: 'quakexit-bound-devices' },
  ),
)
