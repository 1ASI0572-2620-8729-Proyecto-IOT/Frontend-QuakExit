import { useMemo } from 'react'

import { useDeviceStore } from '../store/deviceStore'

export function useDevices(userId?: string) {
  const devices = useDeviceStore((state) => state.devicesByUser)

  return useMemo(
    () => (userId ? devices[userId] ?? [] : Object.values(devices).flat()),
    [devices, userId],
  )
}
