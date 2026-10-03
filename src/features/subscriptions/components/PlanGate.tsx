import { ArrowRight, Crown, Lock, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import type { AppFeature } from '../hooks/useSubscription'
import { useFeatureAccess } from '../hooks/useSubscription'
import type { SubscriptionPlanCode } from '../../../types/subscription'

const planLabel: Record<SubscriptionPlanCode, string> = {
  CLOUD_ESSENTIAL: 'Cloud Esencial',
  CLOUD_PLUS: 'Cloud Plus',
  CLOUD_BUILDING: 'Cloud Edificio',
  CLOUD_ENTERPRISE: 'Cloud Enterprise',
}

// Minimum plan required per feature
const requiredPlan: Partial<Record<AppFeature, SubscriptionPlanCode>> = {
  REPORTS: 'CLOUD_PLUS',
  AUDIT: 'CLOUD_PLUS',
  FALSE_ALARMS: 'CLOUD_PLUS',
  BUILDING_MANAGEMENT: 'CLOUD_BUILDING',
  COMMON_AREA_SIMULATIONS: 'CLOUD_BUILDING',
}

const featureLabel: Partial<Record<AppFeature, string>> = {
  REPORTS: 'Reportes operativos',
  AUDIT: 'Auditoría del sistema',
  FALSE_ALARMS: 'Registro de falsas alarmas',
  NOTIFICATIONS: 'Historial de notificaciones avanzado',
  MAINTENANCE: 'Alertas de mantenimiento',
  BUILDING_MANAGEMENT: 'Gestión de edificio',
  COMMON_AREA_SIMULATIONS: 'Simulacros de áreas comunes',
  DEVICE_CONTROL: 'Control de dispositivos',
  PROPERTY: 'Gemelo digital del hogar',
  MANUAL_SIMULATIONS: 'Simulacros manuales',
}

type PlanGateProps = {
  feature: AppFeature
  children: ReactNode
  /** Show a compact inline banner instead of a full-page block */
  inline?: boolean
}

/**
 * Renders `children` when the user's plan includes `feature`.
 * Otherwise, shows a polished "upgrade your plan" prompt.
 */
export function PlanGate({ feature, children, inline = false }: PlanGateProps) {
  const access = useFeatureAccess(feature)

  // While loading, just render children (optimistic render)
  if (access.isLoading) {
    return <>{children}</>
  }

  if (access.isError) {
    if (inline) {
      return (
        <div className="flex items-start gap-4 rounded-2xl border border-danger/30 bg-danger/5 p-4">
          <p className="text-sm font-semibold text-danger">No se pudo verificar el acceso a {feature}</p>
        </div>
      )
    }
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <p className="text-sm font-semibold text-danger">Error de conexión con el servidor. No se pudo verificar tu suscripción.</p>
        </div>
      </div>
    )
  }

  // Access granted
  if (access.allowed) {
    return <>{children}</>
  }

  // Access denied → show upgrade prompt
  const needed = requiredPlan[feature]
  const label = featureLabel[feature] ?? feature

  if (inline) {
    return (
      <div className="flex items-start gap-4 rounded-2xl border border-amber/30 bg-amber/5 p-4">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber/15">
          <Lock className="h-4 w-4 text-amber" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">{label} no incluido en tu plan actual</p>
          <p className="mt-1 text-xs text-slate-400">
            {needed ? `Requiere ${planLabel[needed]} o superior.` : 'Mejora tu plan para acceder a esta función.'}
          </p>
        </div>
        <Link
          to="/subscription"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-amber px-3 py-1.5 text-xs font-semibold text-slate-950"
        >
          Mejorar <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        {/* Icon ring */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-amber/30 bg-[linear-gradient(135deg,rgba(245,185,66,0.12),rgba(245,185,66,0.04))] shadow-[0_0_40px_rgba(245,185,66,0.08)]">
          {needed === 'CLOUD_BUILDING' || needed === 'CLOUD_ENTERPRISE' ? (
            <Crown className="h-9 w-9 text-amber" />
          ) : (
            <Sparkles className="h-9 w-9 text-amber" />
          )}
        </div>

        <p className="text-xs uppercase tracking-[0.26em] text-amber">Función bloqueada</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">{label}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {needed
            ? `Esta función está disponible a partir del plan ${planLabel[needed]}.`
            : 'Necesitas un plan superior para acceder a esta función.'}
          {' '}Mejora tu suscripción para desbloquearla.
        </p>

        {/* Current plan badge */}
        {access.planCode && (
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-panelMuted px-4 py-1.5 text-sm text-slate-300">
            <span className="h-2 w-2 rounded-full bg-amber" />
            Plan actual: <span className="font-semibold text-white">{planLabel[access.planCode]}</span>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/subscription"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber px-6 py-3 font-semibold text-slate-950 shadow-[0_0_24px_rgba(245,185,66,0.2)] transition hover:bg-amber/90"
          >
            <Crown className="h-4 w-4" />
            Ver planes
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center rounded-xl border border-line px-6 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  )
}
