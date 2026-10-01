import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getPropertyLayout, savePropertyLayout, triggerSimulation } from '../api/propertyApi'
import type { PropertyLayout } from '../types'

export function usePropertyLayout() {
  return useQuery({ queryKey: ['property', 'layout'], queryFn: getPropertyLayout })
}

export function useSavePropertyLayout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (layout: PropertyLayout) => savePropertyLayout(layout),
    onSuccess: (layout) => queryClient.setQueryData(['property', 'layout'], layout),
  })
}

export function useTriggerSimulation() {
  return useMutation({ mutationFn: triggerSimulation })
}
