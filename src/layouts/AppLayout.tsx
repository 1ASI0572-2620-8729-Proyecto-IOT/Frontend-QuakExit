import {
  Activity,
  BellRing,
  CircleUserRound,
  ClipboardList,
  CreditCard,
  Crown,
  LayoutDashboard,
  Menu,
  ShieldAlert,
  Smartphone,
  Sparkles,
  Star,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import { useAuthStore } from '../store/authStore'
import { useSubscription } from '../features/subscriptions/hooks/useSubscription'

const navItems = [
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/devices',      label: 'Dispositivos', icon: Smartphone },
  { to: '/simulation',   label: 'Simulacro',    icon: Activity },
  { to: '/emergencies',  label: 'Emergencias',  icon: ShieldAlert },
  { to: '/operations',   label: 'Operaciones',  icon: ClipboardList },
  { to: '/profile',      label: 'Mi perfil',    icon: CircleUserRound },
]

const planIcons = {
  CLOUD_ESSENTIAL: Star,
  CLOUD_PLUS: Sparkles,
  CLOUD_BUILDING: Crown,
  CLOUD_ENTERPRISE: Crown,
} as const

const planColors = {
  ACTIVE:          'bg-success/15 text-green-300',
  TRIAL:           'bg-info/15 text-blue-300',
  PENDING_PAYMENT: 'bg-amber/15 text-amber',
  EXPIRED:         'bg-danger/15 text-red-300',
  CANCELLED:       'bg-panelMuted text-slate-500',
  PAST_DUE:        'bg-danger/15 text-red-300',
} as const

export function AppLayout() {
  const user = useAuthStore((state) => state.user)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { current: currentSub } = useSubscription()

  const closeMenu = () => setIsMenuOpen(false)

  const PlanBadge = () => {
    if (!currentSub.data) {
      return (
        <NavLink
          to="/subscription"
          onClick={closeMenu}
          className="mt-auto flex items-center gap-2 rounded-xl border border-dashed border-amber/30 bg-amber/5 p-3 text-sm text-amber transition hover:bg-amber/10"
        >
          <CreditCard className="h-4 w-4 shrink-0" />
          <span className="font-medium">Ver planes Cloud</span>
        </NavLink>
      )
    }
    const planCode = currentSub.data.planCode
    const status   = currentSub.data.status
    const PlanIcon = planIcons[planCode] ?? Star
    const colorCls = planColors[status] ?? 'bg-panelMuted text-slate-400'

    return (
      <NavLink
        to="/subscription"
        onClick={closeMenu}
        className="mt-auto block rounded-xl border border-line bg-canvas p-3 transition hover:border-slate-500"
      >
        <div className="flex items-center gap-2">
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${colorCls}`}>
            <PlanIcon className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-200">
              {planCode.replace('CLOUD_', 'Cloud ')}
            </p>
            <p className={`text-[10px] font-medium ${planColors[status]?.split(' ')[1] ?? 'text-slate-500'}`}>
              {status === 'ACTIVE' ? 'Activa' : status === 'TRIAL' ? 'Prueba' : status === 'EXPIRED' ? 'Vencida' : status}
            </p>
          </div>
          <CreditCard className="ml-auto h-3.5 w-3.5 text-slate-500" />
        </div>
      </NavLink>
    )
  }

  const navigation = (
    <nav className="flex flex-1 flex-col gap-2" aria-label="Navegación principal">
      <div className="flex-1 space-y-1">
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
      </div>

      {/* Subscription badge at bottom of nav */}
      <PlanBadge />
    </nav>
  )

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        {/* Desktop sidebar */}
        <aside className="hidden w-72 flex-col border-r border-line bg-panel/70 p-5 md:flex">
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
        </aside>

        {/* Mobile overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 bg-slate-950/70 md:hidden" onClick={closeMenu} aria-hidden="true" />
        )}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-line bg-panel p-5 transition-transform md:hidden ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          aria-label="Menú móvil"
        >
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber text-xs font-bold text-slate-950">QX</div>
              <span className="font-semibold text-white">QuakExit</span>
            </div>
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

            <div className="flex items-center gap-3">
              {/* Plan pill in header */}
              {currentSub.data && (
                <NavLink
                  to="/subscription"
                  className="hidden items-center gap-1.5 rounded-full border border-amber/25 bg-amber/8 px-3 py-1.5 text-xs font-semibold text-amber sm:inline-flex"
                >
                  {(() => {
                    const PlanIcon = planIcons[currentSub.data.planCode] ?? Star
                    return <PlanIcon className="h-3 w-3" />
                  })()}
                  {currentSub.data.planCode.replace('CLOUD_', 'Cloud ')}
                </NavLink>
              )}
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
