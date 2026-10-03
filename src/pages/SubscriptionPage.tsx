import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CreditCard,
  Crown,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { subscriptionService } from '../services/subscriptionService'
import type { BillingPeriod, CheckoutRequest, CurrentSubscription, CustomerType, SubscriptionPlan, SubscriptionPlanCode } from '../types/subscription'
import { useSubscription } from '../features/subscriptions/hooks/useSubscription'
import { useAuthStore } from '../store/authStore'

const money = (value: number) => value > 0 ? `S/ ${value.toFixed(2)}` : 'A medida'

const statusConfig: Record<CurrentSubscription['status'], { label: string; color: string; bg: string }> = {
  ACTIVE:          { label: 'Activa',           color: 'text-green-300',  bg: 'bg-success/10 border-success/25' },
  TRIAL:           { label: 'Prueba',            color: 'text-blue-300',   bg: 'bg-info/10 border-info/25' },
  PENDING_PAYMENT: { label: 'Pago pendiente',    color: 'text-yellow-300', bg: 'bg-amber/10 border-amber/25' },
  EXPIRED:         { label: 'Vencida',           color: 'text-red-300',    bg: 'bg-danger/10 border-danger/25' },
  CANCELLED:       { label: 'Cancelada',         color: 'text-slate-400',  bg: 'bg-panelMuted border-line' },
  PAST_DUE:        { label: 'Pago atrasado',     color: 'text-red-300',    bg: 'bg-danger/10 border-danger/25' },
}

const planIcon = (code: SubscriptionPlanCode) => {
  if (code === 'CLOUD_BUILDING')   return Building2
  if (code === 'CLOUD_ENTERPRISE') return Crown
  if (code === 'CLOUD_PLUS')       return Sparkles
  return Star
}

const initialForm: CheckoutRequest = {
  planCode: 'CLOUD_PLUS',
  billingPeriod: 'MONTHLY',
  customerType: 'PERSON',
  fullName: '',
  documentType: 'DNI',
  documentNumber: '',
  email: '',
  phoneNumber: '',
  address: '',
  city: 'Lima',
  country: 'PE',
  acceptTerms: false,
}

export function SubscriptionPage() {
  const queryClient = useQueryClient()
  const { current } = useSubscription()
  const user = useAuthStore((state) => state.user)
  const isB2B = user?.role === 'BUILDING_ADMIN' || user?.role === 'B2B_ADMIN' || user?.role === 'SYSTEM_ADMIN'

  const plansQuery = useQuery({
    queryKey: ['subscription', 'plans'],
    queryFn: async () => {
      try {
        const plans = await subscriptionService.getPlans()
        return plans.length > 0 ? plans : subscriptionService.fallbackPlans
      } catch {
        return subscriptionService.fallbackPlans
      }
    },
  })

  const [form, setForm] = useState<CheckoutRequest>(() => ({
    ...initialForm,
    planCode: isB2B ? 'CLOUD_BUILDING' : 'CLOUD_PLUS',
    customerType: isB2B ? 'COMPANY' : 'PERSON',
  }))
  const [order, setOrder] = useState<{ orderId: string; amount: number; currency: string } | null>(null)
  const [step, setStep] = useState<'plans' | 'checkout'>('plans')

  const allPlans = plansQuery.data ?? subscriptionService.fallbackPlans
  const plans = allPlans.filter((plan) => {
    if (isB2B) return plan.code === 'CLOUD_BUILDING' || plan.code === 'CLOUD_ENTERPRISE'
    return plan.code === 'CLOUD_ESSENTIAL' || plan.code === 'CLOUD_PLUS'
  })

  const selectedPlan = plans.find((plan) => plan.code === form.planCode) ?? plans[0]

  const checkoutMutation = useMutation({
    mutationFn: () => subscriptionService.checkout(form),
    onSuccess: (result) => {
      setOrder({ orderId: result.orderId, amount: result.amount, currency: result.currency })
      toast.success('Orden creada. Simula el resultado del pago a continuación.')
    },
    onError: () => toast.error('No se pudo crear la orden de suscripción.'),
  })

  const paymentMutation = useMutation({
    mutationFn: (result: 'APPROVED' | 'REJECTED') =>
      subscriptionService.simulatePayment(order?.orderId ?? '', result),
    onSuccess: (result) => {
      if (result.status === 'ACTIVE') {
        void queryClient.invalidateQueries({ queryKey: ['subscription'] })
        toast.success('✅ Pago aprobado. Tu plan ya está activo.')
        setOrder(null)
        setStep('plans')
      } else {
        toast.error('El pago fue rechazado en la simulación.')
      }
    },
    onError: () => toast.error('No se pudo simular el pago.'),
  })

  const cancelMutation = useMutation({
    mutationFn: subscriptionService.cancel,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['subscription'] })
      toast.success('Suscripción cancelada.')
    },
    onError: () => toast.error('No se pudo cancelar la suscripción.'),
  })

  const renewMutation = useMutation({
    mutationFn: subscriptionService.renew,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['subscription'] })
      toast.success('Solicitud de renovación enviada.')
    },
    onError: () => toast.error('No se pudo renovar la suscripción.'),
  })

  const updateForm = <K extends keyof CheckoutRequest>(key: K, value: CheckoutRequest[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const isCompany   = form.customerType === 'COMPANY'
  const isSubmitting = checkoutMutation.isPending || paymentMutation.isPending

  const handleSelectPlan = (code: SubscriptionPlanCode) => {
    updateForm('planCode', code)
    setStep('checkout')
  }

  return (
    <div className="space-y-8 pb-12">
      {/* ─── Hero ─── */}
      <header className="relative overflow-hidden rounded-[28px] border border-amber/20 bg-[linear-gradient(135deg,#0f1d33_0%,#1a2e44_55%,#1f3220_100%)] px-6 py-10 shadow-soft md:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(245,185,66,0.07),transparent_60%)]" />
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber">
              <Zap className="h-3 w-3" /> QuakExit Cloud
            </span>
            <h1 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight text-white md:text-4xl">
              Protección inteligente,<br className="hidden md:block" /> a tu ritmo
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
              El hardware se paga una sola vez. El primer año de nube está incluido.
              Las acciones físicas de emergencia funcionan sin conexión y sin suscripción.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <ShieldCheck className="h-4 w-4 text-success" />
              <span>Emergencias offline</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <BadgeCheck className="h-4 w-4 text-amber" />
              <span>Primer año incluido</span>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Current subscription banner ─── */}
      {current.data && (() => {
        const cfg = statusConfig[current.data.status]
        return (
          <section className={`rounded-2xl border p-5 ${cfg.bg}`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className={`text-xs uppercase tracking-[0.2em] font-semibold ${cfg.color}`}>Tu suscripción activa</p>
                <h2 className="mt-1 text-xl font-semibold text-white">
                  {current.data.planCode.replace('CLOUD_', 'Cloud ')}
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  <span className={`font-semibold ${cfg.color}`}>{cfg.label}</span>
                  {current.data.expiresAt && ` · vence ${new Date(current.data.expiresAt).toLocaleDateString('es-PE')}`}
                  {current.data.billingPeriod && ` · ${current.data.billingPeriod === 'MONTHLY' ? 'mensual' : 'anual'}`}
                </p>
              </div>
              <div className="flex gap-2">
                {current.data.status === 'ACTIVE' && (
                  <button
                    type="button"
                    onClick={() => cancelMutation.mutate()}
                    disabled={cancelMutation.isPending}
                    className="rounded-xl border border-danger/40 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-danger/10 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                )}
                {current.data.status !== 'ACTIVE' && (
                  <button
                    type="button"
                    onClick={() => renewMutation.mutate()}
                    disabled={renewMutation.isPending}
                    className="rounded-xl bg-success px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
                  >
                    Renovar
                  </button>
                )}
              </div>
            </div>
          </section>
        )
      })()}

      {/* ─── Step tabs ─── */}
      <div className="flex gap-1 rounded-2xl border border-line bg-panel p-1.5">
        {(['plans', 'checkout'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(s)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${step === s ? 'bg-amber text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
          >
            {s === 'plans' ? '1. Elige tu plan' : '2. Solicitar suscripción'}
          </button>
        ))}
      </div>

      {step === 'plans' && (
        <PlanGrid
          plans={plans}
          selectedCode={form.planCode}
          billingPeriod={form.billingPeriod}
          onBillingChange={(bp) => updateForm('billingPeriod', bp)}
          onSelect={handleSelectPlan}
        />
      )}

      {step === 'checkout' && (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <CheckoutForm
            form={form}
            isCompany={isCompany}
            isSubmitting={isSubmitting}
            updateForm={updateForm}
            onSubmit={() => checkoutMutation.mutate()}
            onBack={() => setStep('plans')}
          />
          <OrderSummary
            plan={selectedPlan}
            billingPeriod={form.billingPeriod}
            order={order}
            isSubmitting={isSubmitting}
            onApprove={() => paymentMutation.mutate('APPROVED')}
            onReject={() => paymentMutation.mutate('REJECTED')}
          />
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────

function PlanGrid({
  plans,
  selectedCode,
  billingPeriod,
  onBillingChange,
  onSelect,
}: {
  plans: SubscriptionPlan[]
  selectedCode: SubscriptionPlanCode
  billingPeriod: BillingPeriod
  onBillingChange: (bp: BillingPeriod) => void
  onSelect: (code: SubscriptionPlanCode) => void
}) {
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber">Planes claros, control real</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">Selecciona tu nivel de protección</h2>
        </div>
        {/* Billing toggle */}
        <div className="flex items-center gap-1 rounded-xl border border-line bg-panel p-1">
          {(['MONTHLY', 'ANNUAL'] as const).map((bp) => (
            <button
              key={bp}
              type="button"
              onClick={() => onBillingChange(bp)}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${billingPeriod === bp ? 'bg-amber text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              {bp === 'MONTHLY' ? 'Mensual' : 'Anual'}
              {bp === 'ANNUAL' && <span className="ml-1.5 rounded-full bg-success/20 px-1.5 py-0.5 text-[9px] text-green-300">-15%</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const isSelected = plan.code === selectedCode
          const isPopular  = plan.code === 'CLOUD_PLUS'
          const Icon       = planIcon(plan.code)
          const price      = billingPeriod === 'MONTHLY' ? plan.monthlyPrice : plan.annualPrice

          return (
            <div
              key={plan.code}
              className={`relative flex flex-col rounded-[24px] border p-5 transition-all duration-200 ${
                isSelected
                  ? 'border-amber bg-[linear-gradient(160deg,rgba(245,185,66,0.1),rgba(245,185,66,0.03))] shadow-[0_0_32px_rgba(245,185,66,0.1)]'
                  : 'border-line bg-panel hover:border-slate-500'
              }`}
            >
              {isPopular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-amber px-4 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-950 shadow">
                  Más popular
                </span>
              )}

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{plan.code.replace('CLOUD_', '')}</p>
                  <h3 className="mt-1.5 text-lg font-semibold text-white">{plan.name}</h3>
                </div>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isSelected ? 'bg-amber/20' : 'bg-panelMuted'}`}>
                  <Icon className={`h-4 w-4 ${isSelected ? 'text-amber' : 'text-slate-400'}`} />
                </span>
              </div>

              <p className="mt-3 min-h-10 text-sm leading-relaxed text-slate-400">{plan.description}</p>

              <div className="mt-5">
                <p className="text-3xl font-bold text-white">
                  {money(price)}
                  <span className="text-sm font-normal text-slate-400">{price > 0 ? (billingPeriod === 'MONTHLY' ? ' /mes' : ' /año') : ''}</span>
                </p>
                {plan.hardwareAmount !== undefined && (
                  <p className="mt-1 text-xs text-amber">+ Hardware desde {money(plan.hardwareAmount)}</p>
                )}
                {billingPeriod === 'ANNUAL' && plan.annualDiscount && (
                  <p className="mt-1 text-xs text-success">Ahorra {plan.annualDiscount}% vs mensual</p>
                )}
              </div>

              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs text-slate-300">
                    <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-amber' : 'text-success'}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => onSelect(plan.code)}
                className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isSelected
                    ? 'bg-amber text-slate-950 shadow-[0_0_20px_rgba(245,185,66,0.25)]'
                    : 'border border-line text-slate-300 hover:border-amber/40 hover:text-white'
                }`}
              >
                {isSelected ? 'Seleccionado' : 'Elegir plan'}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function CheckoutForm({
  form,
  isCompany,
  isSubmitting,
  updateForm,
  onSubmit,
  onBack,
}: {
  form: CheckoutRequest
  isCompany: boolean
  isSubmitting: boolean
  updateForm: <K extends keyof CheckoutRequest>(key: K, value: CheckoutRequest[K]) => void
  onSubmit: () => void
  onBack: () => void
}) {
  const field = 'mt-2 w-full rounded-xl border border-line bg-canvas px-3 py-3 text-white placeholder:text-slate-500 outline-none focus:border-amber transition'

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (form.acceptTerms) onSubmit()
        else toast.error('Acepta los términos para continuar.')
      }}
      className="rounded-[28px] border border-line bg-panel p-6 shadow-soft md:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber">Checkout seguro</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Solicita tu suscripción</h2>
          <p className="mt-2 text-sm text-slate-400">No solicitamos datos de tarjeta. El pago es una simulación.</p>
        </div>
        <CreditCard className="h-6 w-6 text-amber" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-slate-300">
          Tipo de cliente
          <select value={form.customerType} onChange={(e) => updateForm('customerType', e.target.value as CustomerType)} className={field}>
            <option value="PERSON">Persona</option>
            <option value="COMPANY">Empresa</option>
          </select>
        </label>
        <label className="text-sm text-slate-300">
          Periodicidad
          <select value={form.billingPeriod} onChange={(e) => updateForm('billingPeriod', e.target.value as BillingPeriod)} className={field}>
            <option value="MONTHLY">Mensual</option>
            <option value="ANNUAL">Anual (-15%)</option>
          </select>
        </label>

        <label className="text-sm text-slate-300 sm:col-span-2">
          Nombre completo o contacto
          <input required value={form.fullName} onChange={(e) => updateForm('fullName', e.target.value)} className={field} placeholder="Juan Pérez" />
        </label>

        {isCompany && (
          <>
            <label className="text-sm text-slate-300">
              Razón social
              <input required value={form.companyName ?? ''} onChange={(e) => updateForm('companyName', e.target.value)} className={field} placeholder="Inmobiliaria QuakExit SAC" />
            </label>
            <label className="text-sm text-slate-300">
              RUC
              <input required value={form.taxId ?? ''} onChange={(e) => updateForm('taxId', e.target.value)} className={field} placeholder="20123456789" />
            </label>
          </>
        )}

        <label className="text-sm text-slate-300">
          Tipo de documento
          <select value={form.documentType} onChange={(e) => updateForm('documentType', e.target.value)} className={field}>
            <option value="DNI">DNI</option>
            <option value="CE">Carné de extranjería</option>
            <option value="RUC">RUC</option>
          </select>
        </label>
        <label className="text-sm text-slate-300">
          Número de documento
          <input required value={form.documentNumber} onChange={(e) => updateForm('documentNumber', e.target.value)} className={field} placeholder="12345678" />
        </label>

        <label className="text-sm text-slate-300">
          Correo electrónico
          <input required type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} className={field} placeholder="correo@ejemplo.com" />
        </label>
        <label className="text-sm text-slate-300">
          Teléfono
          <input required value={form.phoneNumber} onChange={(e) => updateForm('phoneNumber', e.target.value)} className={field} placeholder="+51987654321" />
        </label>

        <label className="text-sm text-slate-300 sm:col-span-2">
          Dirección
          <input required value={form.address} onChange={(e) => updateForm('address', e.target.value)} className={field} placeholder="Av. Principal 123, Lima" />
        </label>

        {isCompany && (
          <>
            <label className="text-sm text-slate-300">
              ID de edificio
              <input required type="number" min="1" value={form.buildingId ?? ''} onChange={(e) => updateForm('buildingId', Number(e.target.value))} className={field} placeholder="1" />
            </label>
            <label className="text-sm text-slate-300">
              N° de departamentos
              <input required type="number" min="1" value={form.departmentCount ?? ''} onChange={(e) => updateForm('departmentCount', Number(e.target.value))} className={field} placeholder="20" />
            </label>
          </>
        )}
      </div>

      <label className="mt-6 flex items-start gap-3 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={form.acceptTerms}
          onChange={(e) => updateForm('acceptTerms', e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-amber"
        />
        Acepto los términos de suscripción y entiendo que este entorno usa una simulación de pago.
      </label>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-line px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
        >
          ← Planes
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber px-4 py-3 font-semibold text-slate-950 shadow-[0_0_20px_rgba(245,185,66,0.2)] transition disabled:opacity-50"
        >
          <CreditCard className="h-4 w-4" />
          {isSubmitting ? 'Creando orden...' : 'Continuar al pago'}
        </button>
      </div>
    </form>
  )
}


function OrderSummary({
  plan,
  billingPeriod,
  order,
  isSubmitting,
  onApprove,
  onReject,
}: {
  plan: SubscriptionPlan
  billingPeriod: BillingPeriod
  order: { orderId: string; amount: number; currency: string } | null
  isSubmitting: boolean
  onApprove: () => void
  onReject: () => void
}) {
  const price = billingPeriod === 'MONTHLY' ? plan.monthlyPrice : plan.annualPrice

  return (
    <aside className="h-fit rounded-[28px] border border-line bg-panel p-6 shadow-soft md:p-8">
      <p className="text-xs uppercase tracking-[0.2em] text-amber">Resumen</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">{plan.name}</h2>

      <div className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between text-slate-400">
          <span>Nube cloud</span>
          <span className="font-semibold text-white">
            {money(price)}
            {price > 0 && <span className="font-normal text-slate-500"> / {billingPeriod === 'MONTHLY' ? 'mes' : 'año'}</span>}
          </span>
        </div>
        {plan.hardwareAmount !== undefined && (
          <div className="flex justify-between text-slate-400">
            <span>Hardware</span>
            <span className="font-semibold text-white">{money(plan.hardwareAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-slate-400">
          <span>Primer año cloud</span>
          <span className="text-success font-semibold">Incluido</span>
        </div>
      </div>

      <div className="my-5 border-t border-line" />

      {/* Features quick-list */}
      <ul className="space-y-2">
        {plan.features.slice(0, 4).map((f) => (
          <li key={f} className="flex items-center gap-2 text-xs text-slate-400">
            <Check className="h-3.5 w-3.5 shrink-0 text-amber" />
            {f}
          </li>
        ))}
      </ul>

      <div className="my-5 border-t border-line" />

      {order ? (
        <div className="space-y-3">
          <div className="rounded-2xl border border-amber/25 bg-amber/8 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber">Orden generada</p>
            <p className="mt-1 font-mono text-sm text-slate-300">{order.orderId}</p>
            <p className="mt-1 text-sm text-white font-semibold">
              Total: {order.currency} {order.amount.toFixed(2)}
            </p>
          </div>
          <p className="text-xs text-slate-500">Simula el resultado del procesador de pagos:</p>
          <button
            type="button"
            onClick={onApprove}
            disabled={isSubmitting}
            className="w-full rounded-xl bg-success px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-success/90 disabled:opacity-50"
          >
            ✅ Simular pago aprobado
          </button>
          <button
            type="button"
            onClick={onReject}
            disabled={isSubmitting}
            className="w-full rounded-xl border border-danger/40 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-danger/10 disabled:opacity-50"
          >
            ❌ Simular pago rechazado
          </button>
        </div>
      ) : (
        <p className="rounded-2xl bg-canvas px-4 py-4 text-sm leading-6 text-slate-500">
          Completa tus datos en el formulario y crea una orden para habilitar la simulación de pago.
        </p>
      )}
    </aside>
  )
}
