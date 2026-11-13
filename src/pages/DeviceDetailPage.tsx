import { BatteryFull, Lock, RefreshCw, Unlock, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Link, useParams } from 'react-router-dom'

import { useI18n } from '../i18n/I18nProvider'
import { deviceService } from '../services/deviceService'
import type { DeviceStatusResponse } from '../types/device'

export function DeviceDetailPage() {
  const { id = '' } = useParams()
  const { locale } = useI18n()
  const isEnglish = locale === 'en'
  const [device, setDevice] = useState<DeviceStatusResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  const loadStatus = async () => {
    if (!id) return
    setIsLoading(true)
    try {
      setDevice(await deviceService.getStatus(id))
    } catch {
      toast.error(isEnglish ? 'The device status could not be loaded.' : 'No se pudo cargar el estado del dispositivo.')
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
      toast.success(isEnglish ? 'Device unlocked.' : 'Dispositivo desbloqueado.')
    } catch {
      toast.error(isEnglish ? 'The device could not be unlocked.' : 'No se pudo desbloquear el dispositivo.')
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
      toast.success(isEnglish ? `Power mode: ${powerMode === 'NORMAL' ? 'normal' : 'deep sleep'}.` : `Modo de energía: ${powerMode === 'NORMAL' ? 'normal' : 'ahorro profundo'}.`)
    } catch {
      toast.error(isEnglish ? 'The power mode could not be changed.' : 'No se pudo cambiar el modo de energía.')
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) return <div className="h-64 animate-pulse rounded-[28px] bg-panelMuted" aria-label={isEnglish ? 'Loading device' : 'Cargando dispositivo'} />
  if (!device) return <div className="rounded-[28px] border border-danger/40 bg-danger/10 p-6 text-red-100">{isEnglish ? 'Device not found.' : 'No se encontró el dispositivo.'} <button type="button" onClick={() => void loadStatus()} className="ml-2 underline">{isEnglish ? 'Retry' : 'Reintentar'}</button></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-amber">{isEnglish ? 'Device' : 'Dispositivo'}</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">{isEnglish ? 'Detail:' : 'Detalle:'} {device.alias ?? device.deviceCode}</h1>
        </div>
        <button type="button" onClick={() => void loadStatus()} disabled={isUpdating} className="rounded-xl border border-line p-2 text-slate-300 hover:bg-panelMuted disabled:opacity-50" aria-label={isEnglish ? 'Refresh status' : 'Actualizar estado'}><RefreshCw className="h-4 w-4" aria-hidden="true" /></button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-[28px] border border-line bg-panel p-5 shadow-soft">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label={isEnglish ? 'Code' : 'Código'} value={device.deviceCode} />
            <StatCard label={isEnglish ? 'Status' : 'Estado'} value={device.status} />
            <StatCard label={isEnglish ? 'Battery' : 'Batería'} value={`${device.battery ?? '--'}%`} />
            <StatCard label={isEnglish ? 'Lock' : 'Bloqueo'} value={device.lockStatus} />
            <StatCard label={isEnglish ? 'Light' : 'Luz'} value={device.lightStatus} />
            <StatCard label={isEnglish ? 'Last connection' : 'Última conexión'} value={device.lastSeen ? new Date(device.lastSeen).toLocaleString(isEnglish ? 'en-US' : 'es-PE') : '--'} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => void unlockDevice()} disabled={isUpdating || device.lockStatus === 'UNLOCKED'} className="inline-flex items-center gap-2 rounded-xl bg-amber px-4 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"><Unlock className="h-4 w-4" aria-hidden="true" />{device.lockStatus === 'UNLOCKED' ? (isEnglish ? 'Already unlocked' : 'Ya está desbloqueado') : (isEnglish ? 'Unlock device' : 'Desbloquear dispositivo')}</button>
            <Link to="/devices" className="rounded-xl border border-line px-4 py-3 text-sm text-slate-300 hover:bg-panelMuted">{isEnglish ? 'Back to devices' : 'Volver a dispositivos'}</Link>
          </div>
        </section>

        <section className="rounded-[28px] border border-line bg-panel p-5 shadow-soft">
          <h2 className="text-lg font-semibold text-white">{isEnglish ? 'Controls' : 'Controles'}</h2>
          <div className="mt-5 space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-canvas p-3 text-slate-300"><BatteryFull className="h-4 w-4 text-success" /> {isEnglish ? 'Battery' : 'Batería'} <span className="ml-auto font-medium text-white">{device.battery ?? '--'}%</span></div>
            <div className="rounded-xl bg-canvas p-3"><div className="flex items-center gap-2 text-slate-300"><Lock className="h-4 w-4 text-info" /> {isEnglish ? 'Power mode' : 'Modo de energía'}</div><div className="mt-3 grid grid-cols-2 gap-2">{(['NORMAL', 'DEEP_SLEEP'] as const).map((mode) => <button key={mode} type="button" onClick={() => void changePowerMode(mode)} disabled={isUpdating} className={`rounded-lg px-3 py-2 text-xs font-medium ${device.powerMode === mode ? 'bg-amber text-slate-950' : 'border border-line text-slate-300 hover:bg-panelMuted'}`}>{mode === 'NORMAL' ? (isEnglish ? 'Normal' : 'Normal') : (isEnglish ? 'Deep sleep' : 'Ahorro profundo')}</button>)}</div></div>
            <div className="flex items-center gap-3 rounded-xl bg-canvas p-3 text-slate-300"><Zap className="h-4 w-4 text-warning" /> {isEnglish ? 'Connectivity' : 'Conectividad'} <span className="ml-auto font-medium text-white">{device.connected ? (isEnglish ? 'Connected' : 'Conectado') : 'Offline'}</span></div>
          </div>
        </section>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-canvas p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p><p className="mt-3 text-lg font-semibold text-white">{value}</p></div>
}
