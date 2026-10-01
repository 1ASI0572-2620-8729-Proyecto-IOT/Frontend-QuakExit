import { useQuery } from '@tanstack/react-query'

import { getBatteryStatus } from '../api/batteryApi'

export function useBatteryStatus() {
  return useQuery({
    queryKey: ['devices', 'battery-status'],
    queryFn: getBatteryStatus,
    refetchInterval: 30_000,
    staleTime: 30_000,
  })
}