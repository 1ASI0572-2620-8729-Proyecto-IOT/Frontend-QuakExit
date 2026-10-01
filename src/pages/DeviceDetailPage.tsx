import { BatteryFull, Lock, RefreshCw, Unlock, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Link, useParams } from 'react-router-dom'

import { deviceService } from '../services/deviceService'
import type { DeviceStatusResponse } from '../types/device'

export function DeviceDetailPage() {
  const { id = '' } = useParams()
  const [device, setDevice] = useState<DeviceStatusResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  const loadStatus = async () => {
    if (!id) return
    setIsLoading(true)
    try {
      setDevice(await deviceService.getStatus(id))
    } catch {
      toast.error('No se pudo cargar el estado del dispositivo.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadStatus()
  }, [id])

  const unlockDevice = async () => {
    if (!id) return
    setIsUpdating(true)
    try {
      const result = await deviceService.unlockPrivate(id)
      setDevice((current) => current ? { ...current, ...result } : current)
      toast.success('Dispositivo desbloqueado.')
    } catch {
      toast.error('No se pudo desbloquear el dispositivo.')
    } finally {
      setIsUpdating(false)
    }
  }

  const changePowerMode = async (powerMode: 'DEEP_SLEEP' | 'NORMAL') => {
    if (!id || device?.powerMode === powerMode) return
    setIsUpdating(true)
    try {
      const result = await deviceService.setPowerMode(id, powerMode)
      setDevice((current) => current ? { ...current, ...result } : current)
      toast.success(`Modo de energía: ${powerMode === 'NORMAL' ? 'normal' : 'ahorro profundo'}.`)
    } catch {
      toast.error('No se pudo cambiar el modo de energía.')
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) return <div className="h-64 animate-pulse rounded-[28px] bg-panelMuted" aria-label="Cargando dispositivo" />
  if (!device) return <div className="rounded-[28px] border border-danger/40 bg-danger/10 p-6 text-red-100">No se encontró el dispositivo. <button type="button" onClick={() => void loadStatus()} className="ml-2 underline">Reintentar</button></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-amber">Dispositivo</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Detalle: {device.alias ?? device.deviceCode}</h1>
        </div>
        <button type="button" onClick={() => void loadStatus()} disabled={isUpdating} className="rounded-xl border border-line p-2 text-slate-300 hover:bg-panelMuted disabled:opacity-50" aria-label="Actualizar estado"><RefreshCw className="h-4 w-4" aria-hidden="true" /></button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-[28px] border border-line bg-panel p-5 shadow-soft">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Código" value={device.deviceCode} />
            <StatCard label="Estado" value={device.status} />
            <StatCard label="Batería" value={`${device.battery ?? '--'}%`} />
            <StatCard label="Bloqueo" value={device.lockStatus} />
            <StatCard label="Luz" value={device.lightStatus} />
            <StatCard label="Última conexión" value={device.lastSeen ? new Date(device.lastSeen).toLocaleString('es-PE') : '--'} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => void unlockDevice()} disabled={isUpdating || device.lockStatus === 'UNLOCKED'} className="inline-flex items-center gap-2 rounded-xl bg-amber px-4 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"><Unlock className="h-4 w-4" aria-hidden="true" />{device.lockStatus === 'UNLOCKED' ? 'Ya está desbloqueado' : 'Desbloquear dispositivo'}</button>
            <Link to="/devices" className="rounded-xl border border-line px-4 py-3 text-sm text-slate-300 hover:bg-panelMuted">Volver a dispositivos</Link>
          </div>
        </section>

        <section className="rounded-[28px] border border-line bg-panel p-5 shadow-soft">
          <h2 className="text-lg font-semibold text-white">Controles</h2>
          <div className="mt-5 space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-canvas p-3 text-slate-300"><BatteryFull className="h-4 w-4 text-success" /> Batería <span className="ml-auto font-medium text-white">{device.battery ?? '--'}%</span></div>
            <div className="rounded-xl bg-canvas p-3"><div className="flex items-center gap-2 text-slate-300"><Lock className="h-4 w-4 text-info" /> Modo de energía</div><div className="mt-3 grid grid-cols-2 gap-2">{(['NORMAL', 'DEEP_SLEEP'] as const).map((mode) => <button key={mode} type="button" onClick={() => void changePowerMode(mode)} disabled={isUpdating} className={`rounded-lg px-3 py-2 text-xs font-medium ${device.powerMode === mode ? 'bg-amber text-slate-950' : 'border border-line text-slate-300 hover:bg-panelMuted'}`}>{mode === 'NORMAL' ? 'Normal' : 'Ahorro profundo'}</button>)}</div></div>
            <div className="flex items-center gap-3 rounded-xl bg-canvas p-3 text-slate-300"><Zap className="h-4 w-4 text-warning" /> Conectividad <span className="ml-auto font-medium text-white">{device.connected ? 'Conectado' : 'Offline'}</span></div>
          </div>
        </section>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-canvas p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p><p className="mt-3 text-lg font-semibold text-white">{value}</p></div>
}
