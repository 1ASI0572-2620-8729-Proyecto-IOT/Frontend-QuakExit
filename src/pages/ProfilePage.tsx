import { Mail, ShieldCheck, UserRound } from 'lucide-react'

import { useAuthStore } from '../store/authStore'

export function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-amber">Cuenta</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Perfil de usuario</h1>
        <p className="mt-2 text-sm text-slate-400">Información de la sesión autenticada.</p>
      </div>
      <section className="rounded-2xl border border-line bg-panel p-6" aria-labelledby="profile-title">
        <div className="flex items-center gap-4 border-b border-line pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber text-2xl font-bold text-slate-950">{user?.fullName?.slice(0, 1).toUpperCase() ?? 'U'}</div>
          <div><h2 id="profile-title" className="text-xl font-semibold text-white">{user?.fullName ?? 'Usuario'}</h2><p className="text-sm text-slate-400">{user?.role ?? 'Sin rol'}</p></div>
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-canvas p-4"><dt className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500"><Mail className="h-4 w-4" />Correo</dt><dd className="mt-2 text-sm text-slate-200">{user?.email ?? 'No disponible'}</dd></div>
          <div className="rounded-xl bg-canvas p-4"><dt className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500"><UserRound className="h-4 w-4" />Identificador</dt><dd className="mt-2 text-sm text-slate-200">{user?.id ?? 'No disponible'}</dd></div>
          <div className="rounded-xl bg-canvas p-4 sm:col-span-2"><dt className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500"><ShieldCheck className="h-4 w-4" />Estado de seguridad</dt><dd className="mt-2 text-sm text-green-200">Sesión autenticada con JWT</dd></div>
        </dl>
        <button type="button" onClick={() => { logout(); window.location.assign('/login') }} className="mt-6 rounded-xl border border-danger/40 px-4 py-3 text-sm font-semibold text-red-200 hover:bg-danger/10">Cerrar sesión</button>
      </section>
    </div>
  )
}