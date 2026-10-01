export type BuildingUnit = {
  id: string
  unit: string
  resident: string
  status: 'SAFE' | 'ALERT' | 'OFFLINE'
  devices: number
}

export type BulkRow = BuildingUnit & { error?: string }