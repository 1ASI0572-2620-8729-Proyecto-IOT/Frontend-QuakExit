import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Home, ShieldCheck, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import { ApiError } from '../types/api-error'

const draftKey = 'quakexit-registration-draft'

const phoneCodes = [
  ['+51', 'Perú'],
  ['+54', 'Argentina'],
  ['+55', 'Brasil'],
  ['+56', 'Chile'],
  ['+57', 'Colombia'],
  ['+58', 'Venezuela'],
  ['+591', 'Bolivia'],
  ['+593', 'Ecuador'],
  ['+595', 'Paraguay'],
  ['+598', 'Uruguay'],
  ['+1', 'Estados Unidos / Canadá'],
  ['+52', 'México'],
  ['+34', 'España'],
  ['+33', 'Francia'],
  ['+39', 'Italia'],
  ['+44', 'Reino Unido'],
  ['+49', 'Alemania'],
  ['+351', 'Portugal'],
  ['+7', 'Rusia / Kazajistán'],
  ['+81', 'Japón'],
  ['+82', 'Corea del Sur'],
  ['+86', 'China'],
  ['+91', 'India'],
  ['+61', 'Australia'],
  ['+64', 'Nueva Zelanda'],
] as const

const registrationSchema = z.object({
  propertyType: z.enum(['HOUSE', 'APARTMENT']),
  role: z.enum(['OWNER', 'RENTER', 'BUILDING_ADMIN']),
  fullName: z.string().trim().min(2, 'Ingresa tu nombre completo'),
  email: z.string().trim().email('Ingresa un correo válido'),
  phoneCode: z.string().min(1, 'Selecciona un código telefónico'),
  phoneNumber: z.string().trim().regex(/^\d{6,14}$/, 'Ingresa entre 6 y 14 dígitos'),
  password: z
    .string()
    .min(8, 'Usa al menos 8 caracteres')
    .regex(/[A-Z]/, 'Incluye al menos una mayúscula')
    .regex(/\d/, 'Incluye al menos un número'),
})

type RegistrationForm = z.infer<typeof registrationSchema>

const defaultValues: RegistrationForm = {
  propertyType: 'HOUSE',
  role: 'OWNER',
  fullName: '',
  email: '',
  phoneCode: '+51',
  phoneNumber: '',
  password: '',
}

const loadDraft = (): RegistrationForm => {
  try {
    const parsed: unknown = JSON.parse(sessionStorage.getItem(draftKey) ?? 'null')
    const result = registrationSchema.partial().safeParse(parsed)
    return result.success ? { ...defaultValues, ...result.data } : defaultValues
  } catch {
    return defaultValues
  }
}

const stepFields: Array<Array<keyof RegistrationForm>> = [
  ['propertyType'],
  ['role'],
  ['fullName', 'email', 'phoneCode', 'phoneNumber', 'password'],
]

const stepLabels = ['Propiedad', 'Rol', 'Cuenta']

export function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, trigger, watch, setError, formState: { errors, isSubmitting } } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: loadDraft(),
    mode: 'onTouched',
  })
  const values = watch()

  useEffect(() => {
    sessionStorage.setItem(draftKey, JSON.stringify(values))
  }, [values])

  const passwordStrength = useMemo(() => {
    const password = values.password
    return [password.length >= 8, /[A-Z]/.test(password), /\d/.test(password)].filter(Boolean).length
  }, [values.password])

  const goNext = async () => {
    const valid = await trigger(stepFields[step])
    if (valid) setStep((current) => Math.min(current + 1, stepLabels.length - 1))
  }

  const onSubmit = async (form: RegistrationForm) => {
    try {
      const { phoneCode, ...registrationData } = form
      const response = await authService.register({
        ...registrationData,
        phoneNumber: `${phoneCode}${form.phoneNumber}`,
      })
      useAuthStore.getState().setSession(response.token, response.user, true, response.refreshToken)
      sessionStorage.removeItem(draftKey)
      toast.success('Cuenta creada correctamente')
      navigate('/dashboard')
    } catch (error) {
      if (error instanceof ApiError) {
        error.fieldErrors?.forEach(({ field, message }) => {
          if (field in defaultValues) setError(field as keyof RegistrationForm, { message })
        })
        toast.error(error.message)
        return
      }
      toast.error('La cuenta no pudo crearse. Intenta nuevamente.')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10 text-ink">
      <section className="w-full max-w-2xl rounded-3xl border border-line bg-panel p-6 shadow-2xl md:p-10" aria-labelledby="register-title">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-amber">Registro seguro</p>
            <h1 id="register-title" className="mt-2 text-3xl font-semibold text-white">Crea tu cuenta QuakExit</h1>
            <p className="mt-2 text-sm text-slate-400">Configura tu experiencia de evacuación en pocos pasos.</p>
          </div>
          <ShieldCheck className="h-7 w-7 shrink-0 text-success" aria-label="Registro protegido" />
        </div>

        <ol className="mb-10 grid grid-cols-3 gap-2" aria-label="Progreso del registro">
          {stepLabels.map((label, index) => (
            <li key={label} className="flex items-center gap-2 text-xs text-slate-400">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full border ${index <= step ? 'border-amber bg-amber text-slate-950' : 'border-line'}`}>
                {index < step ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </li>
          ))}
        </ol>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              {step === 0 && (
                <fieldset className="space-y-5">
              <legend className="text-xl font-semibold text-white">¿Qué vas a registrar?</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                {([
                  ['HOUSE', 'Casa', 'Controla puertas y dispositivos de tu casa.'],
                  ['APARTMENT', 'Departamento', 'Configura tu espacio dentro de un edificio.'],
                ] as const).map(([value, label, description]) => (
                  <label key={value} className={`cursor-pointer rounded-2xl border p-5 transition ${values.propertyType === value ? 'border-amber bg-amber/10' : 'border-line bg-canvas hover:border-slate-500'}`}>
                    <input type="radio" value={value} {...register('propertyType')} className="sr-only" />
                    <Home className="mb-5 h-7 w-7 text-amber" aria-hidden="true" />
                    <span className="block font-semibold text-white">{label}</span>
                    <span className="mt-2 block text-sm text-slate-400">{description}</span>
                  </label>
                ))}
              </div>
                </fieldset>
              )}

              {step === 1 && (
                <fieldset className="space-y-5">
              <legend className="text-xl font-semibold text-white">¿Cuál es tu rol?</legend>
              <div className="space-y-3">
                {([
                  ['OWNER', 'Propietario'],
                  ['RENTER', 'Inquilino'],
                  ['BUILDING_ADMIN', 'Administrador de Torre'],
                ] as const).map(([value, label]) => (
                  <label key={value} className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${values.role === value ? 'border-amber bg-amber/10' : 'border-line bg-canvas hover:border-slate-500'}`}>
                    <input type="radio" value={value} {...register('role')} className="accent-amber" />
                    <UserRound className="h-5 w-5 text-slate-300" aria-hidden="true" />
                    <span className="font-medium text-white">{label}</span>
                  </label>
                ))}
              </div>
                </fieldset>
              )}

              {step === 2 && (
                <fieldset className="space-y-5">
              <legend className="text-xl font-semibold text-white">Datos de tu cuenta</legend>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Nombre completo</span>
                <input {...register('fullName')} className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-white focus:border-amber focus:outline-none" aria-invalid={Boolean(errors.fullName)} />
                {errors.fullName && <span className="mt-1 block text-xs text-red-300">{errors.fullName.message}</span>}
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Correo</span>
                <input type="email" {...register('email')} className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-white focus:border-amber focus:outline-none" aria-invalid={Boolean(errors.email)} />
                {errors.email && <span className="mt-1 block text-xs text-red-300">{errors.email.message}</span>}
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Teléfono</span>
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-2">
                  <select {...register('phoneCode')} className="rounded-xl border border-line bg-canvas px-3 py-3 text-white focus:border-amber focus:outline-none" aria-label="Código telefónico">
                    {phoneCodes.map(([code, country]) => <option key={code} value={code}>{code} ({country})</option>)}
                  </select>
                  <input type="tel" inputMode="numeric" placeholder="987654321" {...register('phoneNumber', { setValueAs: (value: string) => value.replace(/\D/g, '') })} className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-white focus:border-amber focus:outline-none" aria-invalid={Boolean(errors.phoneNumber)} />
                </div>
                {errors.phoneNumber && <span className="mt-1 block text-xs text-red-300">{errors.phoneNumber.message}</span>}
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Contraseña</span>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} {...register('password')} className="w-full rounded-xl border border-line bg-canvas px-3 py-3 pr-12 text-white focus:border-amber focus:outline-none" aria-invalid={Boolean(errors.password)} />
                  <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute inset-y-0 right-3 text-slate-400" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                    {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
                  </button>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-canvas" aria-label={`Fortaleza de contraseña: ${passwordStrength} de 3`}>
                  <div className={`h-full transition-all ${passwordStrength === 3 ? 'bg-success' : passwordStrength === 2 ? 'bg-warning' : 'bg-danger'}`} style={{ width: `${(passwordStrength / 3) * 100}%` }} />
                </div>
                {errors.password && <span className="mt-1 block text-xs text-red-300">{errors.password.message}</span>}
              </label>
                </fieldset>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between gap-3">
            {step > 0 ? <button type="button" onClick={() => setStep((current) => current - 1)} className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-3 text-sm text-slate-300 hover:bg-panelMuted"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Atrás</button> : <span />}
            {step < 2 ? <button type="button" onClick={goNext} className="inline-flex items-center gap-2 rounded-xl bg-amber px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-amber/90">Continuar<ArrowRight className="h-4 w-4" aria-hidden="true" /></button> : <button type="submit" disabled={isSubmitting} className="rounded-xl bg-amber px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-amber/90 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}</button>}
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">¿Ya tienes cuenta? <Link to="/login" className="font-semibold text-amber hover:underline">Inicia sesión</Link></p>
      </section>
    </main>
  )
}
