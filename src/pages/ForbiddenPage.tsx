import { ArrowLeft, ShieldOff } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

export function ForbiddenPage() {
  const [params] = useSearchParams()
  const reason = params.get('reason')

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-danger/25 bg-danger/10 shadow-[0_0_40px_rgba(239,68,68,0.08)]">
          <ShieldOff className="h-9 w-9 text-danger" />
        </div>

        <p className="text-xs uppercase tracking-[0.28em] text-danger">Error 403</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Acceso restringido</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {reason === 'FEATURE_NOT_INCLUDED'
            ? 'Tu plan actual no incluye esta función. Mejora tu suscripción para acceder.'
            : 'No tienes los permisos necesarios para ver este contenido.'}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {reason === 'FEATURE_NOT_INCLUDED' && (
            <Link
              to="/subscription"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber px-6 py-3 font-semibold text-slate-950 shadow-[0_0_20px_rgba(245,185,66,0.2)]"
            >
              Ver planes
            </Link>
          )}
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-6 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-xl border border-line px-6 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
