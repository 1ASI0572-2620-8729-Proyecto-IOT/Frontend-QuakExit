import { Activity, BatteryCharging, ShieldAlert, Wifi, Zap } from 'lucide-react'

import { HomeTwin } from '../features/home-twin/HomeTwin'
import { EarthquakeDashboard } from '../features/earthquakes/components/EarthquakeDashboard'
import { ResidentSafetyPanel } from '../features/devices/components/ResidentSafetyPanel'
import { useAuthStore } from '../store/authStore'

const stats = [
  { label: 'Estado del sistema', value: 'Normal', tone: 'text-success' },
  { label: 'Dispositivos en línea', value: '4/5', tone: 'text-info' },
  { label: 'Batería mínima', value: '72%', tone: 'text-warning' },
  { label: 'Alertas activas', value: '1', tone: 'text-danger' },
  { label: 'Última conexión', value: '18s', tone: 'text-slate-700' },
]

const services = [
  { name: 'Cerraduras', status: 'Conectado', latency: '18 ms' },
  { name: 'Luces', status: 'OK', latency: '24 ms' },
  { name: 'Acelerómetro', status: 'Monitoreando', latency: '11 ms' },
  { name: 'Batería', status: '72%', latency: '42 ms' },
  { name: 'Conectividad', status: 'Wi-Fi', latency: '19 ms' },
]

import { Navigate } from 'react-router-dom'
import { useSubscription } from '../features/subscriptions/hooks/useSubscription'
import { PlanGate } from '../features/subscriptions/components/PlanGate'

// ... (stats and services remain above)

export function DashboardPage() {
  const role = useAuthStore((state) => state.user?.role)
  const isResident = role === 'HOMEOWNER' || role === 'OWNER' || role === 'RENTER'
  const { current } = useSubscription()

  // Avoid loading dashboard components if user has no active subscription
  if (
    (current.isSuccess && current.data?.status !== 'ACTIVE' && current.data?.status !== 'TRIAL') ||
    current.isError
  ) {
    return <Navigate to="/subscription" replace />
  }

  return (
    <PlanGate feature="DASHBOARD">
      <div className="space-y-6">
        <EarthquakeDashboard />
        {isResident && <ResidentSafetyPanel />}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className={`text-2xl font-semibold ${stat.tone}`}>{stat.value}</span>
                <Activity className="h-5 w-5 text-slate-400" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.6fr_0.7fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Casa</p>
                <h2 className="text-xl font-semibold text-slate-900">Gemelo digital del hogar</h2>
              </div>
              <button type="button" onClick={() => window.location.assign('/simulation')} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                Reproducir evacuación
              </button>
            </div>
            <HomeTwin />
          </section>

          <aside className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Servicios IoT</h3>
              <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">online</span>
            </div>
            <div className="space-y-3">
              {services.map((service) => (
                <div key={service.name} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-3">
                    {service.name.includes('Batería') ? (
                      <BatteryCharging className="h-4 w-4 text-warning" />
                    ) : service.name.includes('Wifi') || service.name.includes('Conectividad') ? (
                      <Wifi className="h-4 w-4 text-info" />
                    ) : service.name.includes('Luces') ? (
                      <Zap className="h-4 w-4 text-success" />
                    ) : (
                      <ShieldAlert className="h-4 w-4 text-slate-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-800">{service.name}</p>
                      <p className="text-xs text-slate-500">{service.latency}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-700">{service.status}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </PlanGate>
  )
}
