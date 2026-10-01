import { useMemo } from 'react'

import type { DeviceStatusResponse } from '../types/device'
import type { EarthquakeEvent } from '../types/emergency'

export type HomeState = 'NORMAL' | 'SLEEPING' | 'OFFLINE' | 'ALERT'

export const deriveHomeState = (
  devices: DeviceStatusResponse[],
  events: EarthquakeEvent[],
): HomeState => {
  if (events.some((event) => event.status === 'ACTIVE' || event.status === 'DETECTED')) {
    return 'ALERT'
  }

  if (devices.some((device) => device.status === 'ALERT' || device.lockStatus === 'FAULT')) {
    return 'ALERT'
  }

  if (devices.some((device) => device.status === 'OFFLINE')) {
    return 'OFFLINE'
  }

  if (devices.some((device) => device.status === 'SLEEPING')) {
    return 'SLEEPING'
  }

  return 'NORMAL'
}

export function useHomeState(devices: DeviceStatusResponse[], events: EarthquakeEvent[]) {
  return useMemo(() => deriveHomeState(devices, events), [devices, events])
}
