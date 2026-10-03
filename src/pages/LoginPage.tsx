import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useAuthStore } from '../store/authStore'
import { authService } from '../services/authService'
import type { AuthResponse } from '../types/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const response: AuthResponse = await authService.login({ email, password })
      useAuthStore.getState().setSession(response.token, response.user, true, response.refreshToken)
      toast.success('Sesión iniciada')
      navigate('/dashboard')
    } catch (error) {
      console.error(error)
      toast.error('No fue posible iniciar sesión. Verifica tus credenciales o el backend.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-900">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-2xl md:grid-cols-2">
        <div className="flex flex-col justify-center bg-slate-900 px-8 py-10 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-bold text-slate-900">
              QX
            </div>
            <div>
              <p className="text-lg font-semibold">QuakExit</p>
              <p className="text-xs text-slate-300">TerraGuard</p>
            </div>
          </div>

          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
              <ShieldCheck className="h-4 w-4 text-success" />
              Evacuación sísmica con acción local y segura
            </div>
            <h1 className="text-4xl font-semibold">Monitorea la seguridad de tu hogar.</h1>
            <p className="max-w-sm text-slate-300">
              Cierra puertas, enciende luces de emergencia y supervisa cada nodo del ecosistema IoT en tiempo real.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Acceso</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Iniciar sesión</h2>
            </div>
            <Link to="/register" className="text-sm font-medium text-info hover:underline">
              Crear cuenta
            </Link>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Correo</span>
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus:border-info focus:outline-none"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Contraseña</span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-11 focus:border-info focus:outline-none"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-500"
                  aria-label="Mostrar u ocultar contraseña"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              className="w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Iniciando...' : 'Entrar al panel'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
