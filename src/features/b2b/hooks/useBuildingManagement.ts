import { useMutation, useQuery } from '@tanstack/react-query'

import { bulkRegisterDevices, bulkRegisterDevicesCsv, getBuildingUnits, triggerAllAlarms, type BulkRegisterRequest } from '../api/buildingApi'

export function useBuildingUnits() {
  return useQuery({ queryKey: ['b2b', 'units'], queryFn: getBuildingUnits })
}

export function useTriggerAllAlarms() {
  return useMutation({ mutationFn: (buildingId: number) => triggerAllAlarms(buildingId) })
}

export function useBulkRegisterDevices() {
  return useMutation({ mutationFn: (request: BulkRegisterRequest) => bulkRegisterDevices(request) })
}

export function useBulkRegisterDevicesCsv() {
  return useMutation({ mutationFn: ({ buildingId, file }: { buildingId: number; file: File }) => bulkRegisterDevicesCsv(buildingId, file) })
}