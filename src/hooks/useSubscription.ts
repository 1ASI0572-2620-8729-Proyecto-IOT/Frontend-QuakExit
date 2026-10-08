import { useQuery } from '@tanstack/react-query'

import { subscriptionService } from '../services/subscriptionService'

export function useCurrentSubscription() {
  return useQuery({
    queryKey: ['subscription', 'current'],
    queryFn: subscriptionService.getCurrent,
    staleTime: 30_000,
  })
}
