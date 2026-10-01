import { useQuery } from '@tanstack/react-query'

import { getRealtimeEarthquakes } from '../api/earthquakesApi'

export function useRealtimeEarthquakes() {
  return useQuery({
    queryKey: ['earthquakes', 'realtime'],
    queryFn: getRealtimeEarthquakes,
    refetchInterval: 60_000,
    staleTime: 60_000,
  })
}