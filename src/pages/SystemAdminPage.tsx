import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, LayoutDashboard, Plus, Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { adminService } from '../services/adminService'

const defaultLayout = JSON.stringify({
  levels: [{ floor: 1, name: 'Piso 1', rooms: [{ name: 'Sala', type: 'SPACE', deviceIds: [] }] }],
}, null, 2)

export function SystemAdminPage() {
  const queryClient = useQueryClient()
  const { data: buildings = [] } = useQuery({ queryKey: ['admin', 'buildings'], queryFn: adminService.listBuildings })
  const { data: users = [] } = useQuery({ queryKey: ['admin', 'users'], queryFn: adminService.listUsers })
  const [building, setBuilding] = useState({ name: '', address: '', district: '', city: '', totalFloors: '1' })
  const [unit, setUnit] = useState({ buildingId: '', unit: '', residentId: '' })
  const [layout, setLayout] = useState(defaultLayout)
  const [isSaving, setIsSaving] = useState(false)

  const createBuilding = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    try {
      await adminService.createBuilding({ ...building, totalFloors: Number(building.totalFloors) })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'buildings'] })
      setBuilding({ name: '', address: '', district: '', city: '', totalFloors: '1' })
      toast.success('Edificio creado')
    } catch (error) {
      console.error(error)
      toast.error('No se pudo crear el edificio')
    } finally {
      setIsSaving(false)
    }
  }

  const createUnit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    try {
      await adminService.createUnit({ buildingId: Number(unit.buildingId), unit: unit.unit, residentId: Number(unit.residentId), deviceIds: [] })
      setUnit({ buildingId: '', unit: '', residentId: '' })
      toast.success('Unidad creada')
    } catch (error) {
      console.error(error)
      toast.error('No se pudo crear la unidad')
    } finally {
      setIsSaving(false)
    }
  }

  const saveLayout = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      await adminService.saveLayout(JSON.parse(layout) as Parameters<typeof adminService.saveLayout>[0])
      toast.success('Layout guardado')
    } catch (error) {
      console.error(error)
      toast.error('Revisa el JSON del layout o la respuesta del backend')
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div><p className="text-xs uppercase tracking-[0.22em] text-amber">SYSTEM_ADMIN</p><h1 className="mt-2 text-2xl font-semibold text-white">Configuración inicial</h1><p className="mt-2 text-sm text-slate-400">Crea los recursos que necesitan las cuentas y sus suscripciones.</p></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={createBuilding} className="space-y-3 rounded-2xl border border-line bg-panel p-5">
          <h2 className="flex items-center gap-2 font-semibold text-white"><Building2 className="h-5 w-5 text-amber" />Crear edificio</h2>
          {(['name', 'address', 'district', 'city'] as const).map((field) => <input key={field} required={field === 'name' || field === 'address'} value={building[field]} onChange={(event) => setBuilding({ ...building, [field]: event.target.value })} placeholder={field === 'name' ? 'Nombre' : field === 'address' ? 'Dirección' : field === 'district' ? 'Distrito' : 'Ciudad'} className="w-full rounded-xl border border-line bg-canvas px-3 py-2.5 text-white outline-none focus:border-amber" />)}
          <input required type="number" min="1" value={building.totalFloors} onChange={(event) => setBuilding({ ...building, totalFloors: event.target.value })} placeholder="Pisos" className="w-full rounded-xl border border-line bg-canvas px-3 py-2.5 text-white outline-none focus:border-amber" />
          <button disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-amber px-4 py-2.5 font-semibold text-slate-950 disabled:opacity-50"><Plus className="h-4 w-4" />Crear edificio</button>
        </form>

        <form onSubmit={createUnit} className="space-y-3 rounded-2xl border border-line bg-panel p-5">
          <h2 className="flex items-center gap-2 font-semibold text-white"><Users className="h-5 w-5 text-amber" />Crear unidad</h2>
          <select required value={unit.buildingId} onChange={(event) => setUnit({ ...unit, buildingId: event.target.value })} className="w-full rounded-xl border border-line bg-canvas px-3 py-2.5 text-white"><option value="">Selecciona edificio</option>{buildings.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          <input required value={unit.unit} onChange={(event) => setUnit({ ...unit, unit: event.target.value })} placeholder="Número o código de unidad" className="w-full rounded-xl border border-line bg-canvas px-3 py-2.5 text-white outline-none focus:border-amber" />
          <select required value={unit.residentId} onChange={(event) => setUnit({ ...unit, residentId: event.target.value })} className="w-full rounded-xl border border-line bg-canvas px-3 py-2.5 text-white"><option value="">Selecciona residente</option>{users.filter((item) => item.role !== 'SYSTEM_ADMIN').map((item) => <option key={item.id} value={item.id}>{item.fullName} · {item.email}</option>)}</select>
          <button disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-amber px-4 py-2.5 font-semibold text-slate-950 disabled:opacity-50"><Plus className="h-4 w-4" />Crear unidad</button>
        </form>
      </div>

      <form onSubmit={saveLayout} className="space-y-3 rounded-2xl border border-line bg-panel p-5">
        <h2 className="flex items-center gap-2 font-semibold text-white"><LayoutDashboard className="h-5 w-5 text-amber" />Crear o actualizar layout</h2>
        <p className="text-sm text-slate-400">Define pisos y ambientes. Los `deviceIds` deben pertenecer al propietario del layout.</p>
        <textarea value={layout} onChange={(event) => setLayout(event.target.value)} rows={12} className="w-full rounded-xl border border-line bg-canvas p-3 font-mono text-sm text-white outline-none focus:border-amber" />
        <button className="rounded-xl bg-amber px-4 py-2.5 font-semibold text-slate-950">Guardar layout</button>
      </form>
    </div>
  )
}
