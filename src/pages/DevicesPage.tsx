import { Plus, Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { deviceService } from '../services/deviceService'
import type { DeviceRecord } from '../types/device'

export function DevicesPage() {
  const [devices, setDevices] = useState<DeviceRecord[]>([])
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ deviceCode: '', macAddress: '', alias: '' })
  const visibleDevices = useMemo(() => devices.filter((device) => `${device.alias} ${device.deviceCode}`.toLowerCase().includes(search.toLowerCase())), [devices, search])

  useEffect(() => {
    let isMounted = true

    const loadDevices = async () => {
      try {
        const storedDevices = await deviceService.list()
        if (isMounted) {
          setDevices(storedDevices)
        }
      } catch (error) {
        console.error(error)
        if (isMounted) {
          toast.error('No fue posible cargar tus dispositivos.')
        }
      }
    }

    void loadDevices()

    return () => {
      isMounted = false
    }
  }, [])

  const bindDevice = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      const device = await deviceService.bind(form)
      setDevices((current) => [device, ...current])
      setForm({ deviceCode: '', macAddress: '', alias: '' })
      setIsOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return <div className="space-y-6 rounded-[28px] border border-line bg-panel p-5 shadow-soft"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="text-xs uppercase tracking-[0.22em] text-amber">Dispositivos</p><h1 className="mt-2 text-2xl font-semibold text-white">Hub y nodos vinculados</h1></div><div className="flex gap-3"><label className="flex items-center gap-2 rounded-xl border border-line bg-canvas px-3 py-2 text-sm text-slate-400"><Search className="h-4 w-4" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="bg-transparent text-white outline-none placeholder:text-slate-400" placeholder="Buscar" /></label><button type="button" onClick={() => setIsOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-amber px-4 py-2.5 text-sm font-semibold text-slate-950"><Plus className="h-4 w-4" />Vincular dispositivo</button></div></div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="text-slate-400"><tr className="border-b border-line"><th className="py-3 pr-4">Alias</th><th className="py-3 pr-4">Código</th><th className="py-3 pr-4">Estado</th><th className="py-3 pr-4">Batería</th></tr></thead><tbody>{visibleDevices.map((device) => <tr key={device.id} className="border-b border-line"><td className="py-3 pr-4 font-medium text-white"><Link to={`/devices/${device.id}`} className="hover:text-amber hover:underline">{device.alias}</Link></td><td className="py-3 pr-4 text-slate-300">{device.deviceCode}</td><td className="py-3 pr-4"><span className={`rounded-full px-2 py-1 text-xs font-medium ${device.status === 'ALERT' ? 'bg-danger/10 text-red-200' : device.status === 'SLEEPING' ? 'bg-info/10 text-blue-200' : 'bg-success/10 text-green-200'}`}>{device.status}</span></td><td className="py-3 pr-4"><div className="flex items-center gap-2"><div className="h-2.5 w-20 overflow-hidden rounded-full bg-panelMuted"><div className={`h-full ${device.battery < 30 ? 'bg-danger' : device.battery < 60 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${device.battery}%` }} /></div><span className="text-slate-300">{device.battery}%</span></div></td></tr>)}</tbody></table></div>{isOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4" role="dialog" aria-modal="true" aria-labelledby="bind-device-title"><form onSubmit={bindDevice} className="w-full max-w-md rounded-2xl border border-line bg-panel p-6"><div className="flex items-center justify-between"><h2 id="bind-device-title" className="text-lg font-semibold text-white">Vincular dispositivo</h2><button type="button" onClick={() => setIsOpen(false)} className="text-slate-400" aria-label="Cerrar"><X className="h-5 w-5" /></button></div><div className="mt-5 space-y-3"><input required value={form.alias} onChange={(event) => setForm({ ...form, alias: event.target.value })} placeholder="Alias, por ejemplo Puerta principal" className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-sm text-white outline-none focus:border-amber" /><input required value={form.deviceCode} onChange={(event) => setForm({ ...form, deviceCode: event.target.value })} placeholder="Código QX-001" className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-sm text-white outline-none focus:border-amber" /><input required value={form.macAddress} onChange={(event) => setForm({ ...form, macAddress: event.target.value })} placeholder="MAC AA:BB:CC:DD:EE:FF" className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-sm text-white outline-none focus:border-amber" /></div><button type="submit" disabled={isSubmitting} className="mt-5 w-full rounded-xl bg-amber px-4 py-3 font-semibold text-slate-950 disabled:opacity-60">{isSubmitting ? 'Vinculando...' : 'Registrar dispositivo'}</button></form></div>}</div>
}
