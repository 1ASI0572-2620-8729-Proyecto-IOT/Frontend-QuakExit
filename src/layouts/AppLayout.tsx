import { Activity, BellRing, CircleUserRound, LayoutDashboard, Menu, ShieldAlert, Smartphone, X } from 'lucide-react'
import { ClipboardList } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import { useAuthStore } from '../store/authStore'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/devices', label: 'Dispositivos', icon: Smartphone },
  { to: '/simulation', label: 'Simulacro', icon: Activity },
  { to: '/profile', label: 'Mi perfil', icon: CircleUserRound },
  { to: '/emergencies', label: 'Emergencias', icon: ShieldAlert },
  { to: '/operations', label: 'Operaciones', icon: ClipboardList },
]

export function AppLayout() {
  const user = useAuthStore((state) => state.user)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)

  const navigation = (
    <nav className="space-y-2" aria-label="Navegación principal">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={closeMenu}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? 'bg-amber text-slate-950 shadow-[0_0_20px_rgba(245,185,66,0.18)]'
                : 'text-slate-300 hover:bg-panelMuted hover:text-white'
            }`
          }
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          {label}
        </NavLink>
      ))}
      {(user?.role === 'BUILDING_ADMIN' || user?.role === 'B2B_ADMIN' || user?.role === 'SYSTEM_ADMIN') && (
        <NavLink
          to="/building-admin"
          onClick={closeMenu}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isActive ? 'bg-amber text-slate-950' : 'text-slate-300 hover:bg-panelMuted hover:text-white'
            }`
          }
        >
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          Gestión de edificio
        </NavLink>
      )}
    </nav>
  )

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 border-r border-line bg-panel/70 p-5 md:flex md:flex-col">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber text-sm font-bold text-slate-950">
              QX
            </div>
            <div>
              <p className="text-lg font-semibold text-white">QuakExit</p>
              <p className="text-xs text-slate-400">TerraGuard</p>
            </div>
          </div>

          {navigation}

          <div className="mt-auto rounded-2xl border border-dashed border-line p-3 text-sm text-slate-400">
            <p className="font-medium text-slate-200">Sistema protegido</p>
            <p className="mt-1">Simulacros, edificios y zonas seguras</p>
          </div>
        </aside>

        {isMenuOpen && (
          <div className="fixed inset-0 z-40 bg-slate-950/70 md:hidden" onClick={closeMenu} aria-hidden="true" />
        )}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-line bg-panel p-5 transition-transform md:hidden ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          aria-label="Menú móvil"
        >
          <div className="mb-8 flex items-center justify-between">
            <span className="font-semibold text-white">QuakExit</span>
            <button type="button" onClick={closeMenu} className="rounded-lg p-2 text-slate-300" aria-label="Cerrar menú">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          {navigation}
        </aside>

        <main className="min-w-0 flex-1 p-3 md:p-6">
          <header className="mb-6 flex items-center justify-between rounded-2xl border border-line bg-panel px-4 py-3 shadow-soft">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setIsMenuOpen(true)} className="rounded-lg p-2 text-slate-300 md:hidden" aria-label="Abrir menú">
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Panel operativo</p>
                <h1 className="text-xl font-semibold text-white">Dashboard QuakExit</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative rounded-full bg-panelMuted p-2 text-slate-300" aria-label="2 alertas pendientes">
                <BellRing className="h-4 w-4" aria-hidden="true" />
                <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-danger text-[8px] font-bold text-white">
                  2
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{user?.fullName ?? 'Usuario'}</p>
                <p className="text-xs text-slate-400">{user?.role ?? 'HOMEOWNER'}</p>
              </div>
            </div>
          </header>

          <Outlet />
        </main>
      </div>
    </div>
  )
}
