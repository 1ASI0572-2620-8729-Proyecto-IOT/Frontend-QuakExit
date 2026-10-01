import { Activity, AlertTriangle, BarChart3, Clock3, LineChart as LineChartIcon, MapPin, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import {
  Bar,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useRealtimeEarthquakes } from '../hooks/useRealtimeEarthquakes'
import type { Earthquake } from '../types'

type ChartMode = 'bar' | 'line'

const timeAgo = (date: string) => {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 60_000))
  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `Hace ${minutes} min`
  const hours = Math.round(minutes / 60)
  return `Hace ${hours} h`
}

const magnitudeTone = (magnitude: number) => {
  if (magnitude >= 5) return 'text-danger'
  if (magnitude >= 4) return 'text-warning'
  return 'text-success'
}

function LoadingState() {
  return <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]" aria-label="Cargando sismos" aria-busy="true">
    <div className="h-52 animate-pulse rounded-2xl bg-panelMuted" />
    <div className="h-52 animate-pulse rounded-2xl bg-panelMuted" />
  </div>
}

function LatestEarthquake({ earthquake }: { earthquake: Earthquake }) {
  return <div className="rounded-2xl border border-line bg-canvas p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Último sismo</p>
        <p className={`mt-3 text-5xl font-semibold ${magnitudeTone(earthquake.magnitude)}`}>{earthquake.magnitude.toFixed(1)}</p>
        <p className="mt-1 text-sm text-slate-300">Magnitud registrada</p>
      </div>
      <Activity className="h-6 w-6 text-amber" aria-hidden="true" />
    </div>
    <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
      <div><dt className="text-slate-500">Epicentro</dt><dd className="mt-1 flex items-center gap-1 text-slate-200"><MapPin className="h-3.5 w-3.5 text-amber" />{earthquake.place}</dd></div>
      <div><dt className="text-slate-500">Profundidad</dt><dd className="mt-1 text-slate-200">{earthquake.depthKm} km</dd></div>
      <div className="col-span-2"><dt className="text-slate-500">Ocurrió</dt><dd className="mt-1 flex items-center gap-1 text-slate-200"><Clock3 className="h-3.5 w-3.5" />{timeAgo(earthquake.occurredAt)}</dd></div>
    </dl>
  </div>
}

export function EarthquakeDashboard() {
  const [chartMode, setChartMode] = useState<ChartMode>('bar')
  const { data, isLoading, isError, refetch, isFetching } = useRealtimeEarthquakes()

  if (isLoading) return <section className="space-y-4"><h2 className="text-xl font-semibold text-white">Sismos en tiempo real</h2><LoadingState /></section>

  if (isError) return <section className="rounded-2xl border border-danger/40 bg-danger/10 p-6 text-center"><AlertTriangle className="mx-auto h-7 w-7 text-danger" aria-hidden="true" /><h2 className="mt-3 font-semibold text-white">No pudimos cargar los sismos</h2><p className="mt-1 text-sm text-slate-300">Verifica tu conexión e inténtalo nuevamente.</p><button type="button" onClick={() => refetch()} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white"><RefreshCw className="h-4 w-4" aria-hidden="true" />Reintentar</button></section>

  const earthquakes = data?.earthquakes ?? []
  if (earthquakes.length === 0) return <section className="rounded-2xl border border-line bg-panel p-8 text-center"><Activity className="mx-auto h-7 w-7 text-slate-400" aria-hidden="true" /><h2 className="mt-3 font-semibold text-white">Sin sismos recientes</h2><p className="mt-1 text-sm text-slate-400">No hay eventos reportados para Perú en este momento.</p></section>

  const chartData = [...earthquakes].reverse().map((earthquake) => ({ ...earthquake, label: new Date(earthquake.occurredAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) }))

  return <section className="space-y-4" aria-labelledby="earthquakes-title">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><p className="text-xs uppercase tracking-[0.22em] text-amber">Monitoreo nacional</p><h2 id="earthquakes-title" className="mt-1 text-xl font-semibold text-white">Sismos en tiempo real</h2></div>
      <div className="flex items-center gap-2">
        {data?.stale && <span className="rounded-full bg-warning/10 px-3 py-1 text-xs text-warning">Datos en caché</span>}
        <span className="text-xs text-slate-500">Actualiza cada 60 s</span>
        <button type="button" onClick={() => refetch()} disabled={isFetching} className="rounded-lg border border-line p-2 text-slate-300 hover:bg-panelMuted disabled:opacity-50" aria-label="Actualizar sismos"><RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} aria-hidden="true" /></button>
      </div>
    </div>
    <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
      <LatestEarthquake earthquake={earthquakes[0]} />
      <div className="rounded-2xl border border-line bg-canvas p-4">
        <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-white">Magnitud en Perú</h3><div className="flex rounded-lg border border-line p-1" role="group" aria-label="Tipo de gráfico"><button type="button" onClick={() => setChartMode('bar')} className={`rounded p-1.5 ${chartMode === 'bar' ? 'bg-amber text-slate-950' : 'text-slate-400'}`} aria-label="Gráfico de barras"><BarChart3 className="h-4 w-4" aria-hidden="true" /></button><button type="button" onClick={() => setChartMode('line')} className={`rounded p-1.5 ${chartMode === 'line' ? 'bg-amber text-slate-950' : 'text-slate-400'}`} aria-label="Gráfico de líneas"><LineChartIcon className="h-4 w-4" aria-hidden="true" /></button></div></div>
        <div className="h-56"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><CartesianGrid stroke="#263650" strokeDasharray="3 3" /><XAxis dataKey="label" tick={{ fill: '#94A3B8', fontSize: 11 }} /><YAxis domain={[0, 'auto']} tick={{ fill: '#94A3B8', fontSize: 11 }} /><Tooltip contentStyle={{ background: '#111C2E', border: '1px solid #263650', borderRadius: 12 }} labelStyle={{ color: '#F8FAFC' }} formatter={(value) => [typeof value === 'number' ? value.toFixed(1) : String(value ?? ''), 'Magnitud']} /><Bar dataKey="magnitude" fill="#F5B942" radius={[5, 5, 0, 0]} hide={chartMode !== 'bar'} /><Line type="monotone" dataKey="magnitude" stroke="#F5B942" strokeWidth={3} dot={{ fill: '#F5B942', r: 4 }} hide={chartMode !== 'line'} /></LineChart></ResponsiveContainer></div>
      </div>
    </div>
  </section>
}