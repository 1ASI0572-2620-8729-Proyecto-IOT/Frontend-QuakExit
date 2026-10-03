import http from './http'

import type {
  CheckoutRequest,
  CheckoutResponse,
  CurrentSubscription,
  PaymentSimulationResult,
  SimulatePaymentResponse,
  SubscriptionFeatures,
  SubscriptionPlan,
  SubscriptionPlanCode,
} from '../types/subscription'

const fallbackPlans: SubscriptionPlan[] = [
  {
    code: 'CLOUD_ESSENTIAL',
    name: 'Cloud Esencial',
    description: 'La base para proteger y monitorear una vivienda.',
    monthlyPrice: 12.9,
    annualPrice: 129,
    hardwareAmount: 499,
    firstYearIncluded: true,
    features: ['Dashboard del hogar', 'Gemelo digital', 'Simulacros manuales', 'Push y SMS', 'Hasta 5 contactos', 'Alertas de mantenimiento'],
  },
  {
    code: 'CLOUD_PLUS',
    name: 'Cloud Plus',
    description: 'Más historial, reportes y control para hogares conectados.',
    monthlyPrice: 24.9,
    annualPrice: 249,
    hardwareAmount: 849,
    firstYearIncluded: true,
    features: ['Todo Cloud Esencial', 'Historial de notificaciones', 'Reportes operativos', 'Falsas alarmas', 'Auditoría'],
  },
  {
    code: 'CLOUD_BUILDING',
    name: 'Cloud Edificio',
    description: 'Operación centralizada para torres e inmobiliarias.',
    monthlyPrice: 8.9,
    annualPrice: 90.78,
    firstYearIncluded: true,
    annualDiscount: 15,
    features: ['Todo Cloud Plus', 'Gestión de residentes', 'Carga masiva CSV y JSON', 'Áreas comunes', 'Mantenimiento por edificio'],
  },
  {
    code: 'CLOUD_ENTERPRISE',
    name: 'Cloud Enterprise',
    description: 'Una plataforma a medida para operaciones de mayor escala.',
    monthlyPrice: 0,
    annualPrice: 0,
    firstYearIncluded: true,
    features: ['Todo Cloud Edificio', 'Varios edificios', 'Administradores ilimitados', 'API externa', 'Analítica avanzada'],
  },
]

const asRecord = (value: unknown): Record<string, unknown> => value && typeof value === 'object' ? value as Record<string, unknown> : {}
const asArray = (value: unknown) => Array.isArray(value) ? value : []
const asNumber = (value: unknown, fallback = 0) => typeof value === 'number' ? value : Number(value ?? fallback)
const asString = (value: unknown, fallback = '') => typeof value === 'string' ? value : fallback
const asBoolean = (value: unknown, fallback = false) => typeof value === 'boolean' ? value : fallback

const featureNames = (value: unknown) => asArray(value).map((feature) => String(feature))

const normalizePlan = (value: unknown): SubscriptionPlan => {
  const plan = asRecord(value)
  const code = asString(plan.code ?? plan.planCode, 'CLOUD_ESSENTIAL') as SubscriptionPlanCode
  const fallback = fallbackPlans.find((item) => item.code === code) ?? fallbackPlans[0]
  return {
    code,
    name: asString(plan.name, fallback.name),
    description: asString(plan.description, fallback.description),
    monthlyPrice: asNumber(plan.monthlyPrice ?? plan.monthlyAmount, fallback.monthlyPrice),
    annualPrice: asNumber(plan.annualPrice ?? plan.annualAmount, fallback.annualPrice),
    hardwareAmount: plan.hardwareAmount === undefined ? fallback.hardwareAmount : asNumber(plan.hardwareAmount),
    annualDiscount: plan.annualDiscount === undefined ? fallback.annualDiscount : asNumber(plan.annualDiscount),
    firstYearIncluded: asBoolean(plan.firstYearIncluded, fallback.firstYearIncluded),
    features: featureNames(plan.features).length > 0 ? featureNames(plan.features) : fallback.features,
  }
}

const normalizeCurrent = (value: unknown): CurrentSubscription => {
  const subscription = asRecord(value)
  const plan = asRecord(subscription.plan)
  return {
    planCode: asString(subscription.planCode ?? plan.code, 'CLOUD_ESSENTIAL') as SubscriptionPlanCode,
    status: asString(subscription.status, 'ACTIVE') as CurrentSubscription['status'],
    billingPeriod: asString(subscription.billingPeriod, '') as CurrentSubscription['billingPeriod'],
    startsAt: asString(subscription.startsAt || subscription.startDate),
    expiresAt: asString(subscription.expiresAt || subscription.endDate),
    orderId: asString(subscription.orderId),
  }
}

const normalizeFeatures = (value: unknown): SubscriptionFeatures => {
  const response = asRecord(value)
  const rawFeatures = response.features
  const features: Record<string, boolean> = {}
  if (Array.isArray(rawFeatures)) rawFeatures.forEach((feature) => { features[String(feature)] = true })
  else Object.entries(asRecord(rawFeatures ?? response)).forEach(([key, enabled]) => { if (typeof enabled === 'boolean') features[key] = enabled })
  return {
    planCode: asString(response.planCode) as SubscriptionPlanCode || undefined,
    status: asString(response.status) as SubscriptionFeatures['status'] || undefined,
    features,
  }
}

const normalizeCheckout = (value: unknown): CheckoutResponse => {
  const response = asRecord(value)
  return {
    orderId: asString(response.orderId ?? response.id),
    subscriptionId: asString(response.subscriptionId),
    status: asString(response.status, 'PENDING_PAYMENT') as CheckoutResponse['status'],
    amount: asNumber(response.amount ?? response.cloudAmount),
    currency: asString(response.currency, 'PEN'),
    billingPeriod: asString(response.billingPeriod, 'MONTHLY') as CheckoutResponse['billingPeriod'],
    planCode: asString(response.planCode, 'CLOUD_ESSENTIAL') as SubscriptionPlanCode,
  }
}

export const subscriptionService = {
  fallbackPlans,
  async getPlans() {
    const { data } = await http.get<unknown>('/api/v1/subscriptions/plans')
    const payload = asRecord(data)
    const source = Array.isArray(data) ? data : payload.plans ?? payload.content ?? []
    return asArray(source).map(normalizePlan)
  },
  async getCurrent() {
    try {
      const { data } = await http.get<unknown>('/api/v1/subscriptions/current')
      return normalizeCurrent(data)
    } catch (error: any) {
      if (error?.status === 404 || error?.status === 403) {
        return normalizeCurrent({ status: 'EXPIRED' }) // Treat as no active subscription
      }
      throw error
    }
  },
  async getFeatures() {
    try {
      const { data } = await http.get<unknown>('/api/v1/subscriptions/features')
      return normalizeFeatures(data)
    } catch (error: any) {
      if (error?.status === 404 || error?.status === 403) {
        return normalizeFeatures({}) // Treat as no features enabled
      }
      throw error
    }
  },
  async checkout(payload: CheckoutRequest) {
    const { data } = await http.post<unknown>('/api/v1/subscriptions/checkout', payload)
    return normalizeCheckout(data)
  },
  async simulatePayment(orderId: string, result: PaymentSimulationResult) {
    const { data } = await http.post<unknown>('/api/v1/subscriptions/simulate-payment', { orderId, result })
    return { ...normalizeCheckout(data), ...asRecord(data) } as SimulatePaymentResponse
  },
  async cancel() {
    await http.post('/api/v1/subscriptions/cancel')
  },
  async renew() {
    const { data } = await http.post<unknown>('/api/v1/subscriptions/renew')
    return normalizeCheckout(data)
  },
}
