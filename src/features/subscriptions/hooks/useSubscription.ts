import { useQuery } from '@tanstack/react-query'

import { subscriptionService } from '../../../services/subscriptionService'
import type { SubscriptionPlanCode } from '../../../types/subscription'

export type AppFeature = 'DASHBOARD' | 'DEVICE_CONTROL' | 'PROPERTY' | 'MANUAL_SIMULATIONS' | 'NOTIFICATIONS' | 'REPORTS' | 'AUDIT' | 'FALSE_ALARMS' | 'MAINTENANCE' | 'BUILDING_MANAGEMENT' | 'COMMON_AREA_SIMULATIONS'

const planFeatures: Record<SubscriptionPlanCode, AppFeature[]> = {
  CLOUD_ESSENTIAL: ['DASHBOARD', 'DEVICE_CONTROL', 'PROPERTY', 'MANUAL_SIMULATIONS', 'NOTIFICATIONS', 'MAINTENANCE'],
  CLOUD_PLUS: ['DASHBOARD', 'DEVICE_CONTROL', 'PROPERTY', 'MANUAL_SIMULATIONS', 'NOTIFICATIONS', 'REPORTS', 'AUDIT', 'FALSE_ALARMS', 'MAINTENANCE'],
  CLOUD_BUILDING: ['DASHBOARD', 'DEVICE_CONTROL', 'PROPERTY', 'MANUAL_SIMULATIONS', 'NOTIFICATIONS', 'REPORTS', 'AUDIT', 'FALSE_ALARMS', 'MAINTENANCE', 'BUILDING_MANAGEMENT', 'COMMON_AREA_SIMULATIONS'],
  CLOUD_ENTERPRISE: ['DASHBOARD', 'DEVICE_CONTROL', 'PROPERTY', 'MANUAL_SIMULATIONS', 'NOTIFICATIONS', 'REPORTS', 'AUDIT', 'FALSE_ALARMS', 'MAINTENANCE', 'BUILDING_MANAGEMENT', 'COMMON_AREA_SIMULATIONS'],
}

const normalizeFeature = (feature: string) => feature.replace(/[^A-Z0-9]/gi, '').toUpperCase()

export function useSubscription() {
  const current = useQuery({ queryKey: ['subscription', 'current'], queryFn: subscriptionService.getCurrent })
  const features = useQuery({ queryKey: ['subscription', 'features'], queryFn: subscriptionService.getFeatures })
  return { current, features }
}

export function useFeatureAccess(feature: AppFeature) {
  const subscription = useSubscription()
  const planCode = subscription.features.data?.planCode ?? subscription.current.data?.planCode
  const backendFeatures = subscription.features.data?.features ?? {}
  const matchingFeature = Object.entries(backendFeatures).find(([key]) => normalizeFeature(key) === normalizeFeature(feature))
  const enabledByBackend = matchingFeature?.[1]
  const enabledByPlan = planCode ? planFeatures[planCode]?.includes(feature) : false

  return {
    ...subscription,
    planCode,
    allowed: enabledByBackend ?? enabledByPlan,
    isLoading: subscription.current.isLoading || subscription.features.isLoading,
    isError: subscription.current.isError || subscription.features.isError,
  }
}
