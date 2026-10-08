import http from './http'

export type PlanCode = 'CLOUD_ESSENTIAL' | 'CLOUD_PLUS' | 'CLOUD_BUILDING' | 'CLOUD_ENTERPRISE'
export type BillingPeriod = 'MONTHLY' | 'ANNUAL'
export type SubscriptionStatus = 'ACTIVE' | 'TRIAL' | 'PENDING_PAYMENT' | 'EXPIRED' | 'CANCELLED' | 'PAST_DUE'

export type SubscriptionPlan = {
  code: PlanCode
  name: string
  hardwarePrice: number | null
  monthlyPrice: number | null
  annualPrice: number | null
  currency: string
  firstYearIncluded: boolean
  features: string[]
}

export type CurrentSubscription = {
  subscription: {
    subscriptionId: string
    planCode: PlanCode
    status: SubscriptionStatus
    billingPeriod: BillingPeriod
    scopeType: string
    scopeId: number | null
    firstYearIncluded: boolean
    startsAt: string
    expiresAt: string
  } | null
  features: string[]
}

export type CheckoutRequest = {
  planCode: PlanCode
  billingPeriod: BillingPeriod
  customerType: 'PERSON'
  scopeType: 'USER'
  fullName: string
  email: string
  phoneNumber?: string
  country: string
  includeHardware: boolean
  acceptTerms: boolean
  departmentCount?: number
}

export type CheckoutResponse = {
  orderId: string
  subscriptionId: string
  status: SubscriptionStatus
  amount: number | null
  hardwareAmount: number | null
  cloudAmount: number | null
  currency: string
  billingPeriod: BillingPeriod
  planCode: PlanCode
}

export type PaymentResponse = {
  orderId: string
  subscriptionId: string
  status: SubscriptionStatus
  planCode: PlanCode
  startsAt: string
  expiresAt: string
}

export const subscriptionService = {
  listPlans: async () => {
    const { data } = await http.get<SubscriptionPlan[]>('/api/v1/subscriptions/plans')
    return data
  },
  getCurrent: async () => {
    const { data } = await http.get<CurrentSubscription>('/api/v1/subscriptions/current')
    return data
  },
  checkout: async (request: CheckoutRequest) => {
    const { data } = await http.post<CheckoutResponse>('/api/v1/subscriptions/checkout', request)
    return data
  },
  simulatePayment: async (orderId: string) => {
    const { data } = await http.post<PaymentResponse>('/api/v1/subscriptions/simulate-payment', {
      orderId,
      result: 'APPROVED',
    })
    return data
  },
  cancel: async () => {
    const { data } = await http.post<{ subscriptionId: string; status: SubscriptionStatus; cancelledAt: string }>('/api/v1/subscriptions/cancel')
    return data
  },
  renew: async () => {
    const { data } = await http.post<CheckoutResponse>('/api/v1/subscriptions/renew')
    return data
  },
}
