import { LockKeyhole, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { useFeatureAccess, type AppFeature } from '../hooks/useSubscription'

const featureNames: Record<AppFeature, string> = {
  DASHBOARD: 'el dashboard',
  DEVICE_CONTROL: 'el control de dispositivos',
  PROPERTY: 'la configuración de tu vivienda',
  MANUAL_SIMULATIONS: 'los simulacros manuales',
  NOTIFICATIONS: 'las notificaciones',
  REPORTS: 'los reportes',
  AUDIT: 'la auditoría',
  FALSE_ALARMS: 'la gestión de falsas alarmas',
  MAINTENANCE: 'el mantenimiento',
  BUILDING_MANAGEMENT: 'la gestión del edificio',
  COMMON_AREA_SIMULATIONS: 'los simulacros en áreas comunes',
}

export function FeatureGate({ feature, children }: { feature: AppFeature; children: ReactNode }) {
  const access = useFeatureAccess(feature)

  if (access.isLoading) return <div className="h-40 animate-pulse rounded-2xl bg-panelMuted" aria-label="Cargando permisos del plan" />
  if (access.allowed) return <>{children}</>

  return (
    <section className="rounded-[28px] border border-amber/30 bg-panel p-8 text-center shadow-soft">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber/15 text-amber">
        <LockKeyhole className="h-7 w-7" aria-hidden="true" />
      </div>
      <p className="mt-5 text-xs uppercase tracking-[0.22em] text-amber">Función protegida</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Mejora tu plan para usar {featureNames[feature]}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">Tu suscripción actual no incluye esta función. Puedes revisar los planes disponibles y simular una suscripción sin ingresar datos reales de tarjeta.</p>
      <Link to="/subscription" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber/90">
        <Sparkles className="h-4 w-4" aria-hidden="true" /> Ver planes
      </Link>
    </section>
  )
}
