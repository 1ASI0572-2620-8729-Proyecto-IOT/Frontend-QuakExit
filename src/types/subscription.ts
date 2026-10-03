export type SubscriptionPlanCode = 'CLOUD_ESSENTIAL' | 'CLOUD_PLUS' | 'CLOUD_BUILDING' | 'CLOUD_ENTERPRISE'
export type BillingPeriod = 'MONTHLY' | 'ANNUAL'
export type CustomerType = 'PERSON' | 'COMPANY'
export type PaymentSimulationResult = 'APPROVED' | 'REJECTED' | 'PENDING'
export type SubscriptionStatus = 'ACTIVE' | 'TRIAL' | 'PENDING_PAYMENT' | 'EXPIRED' | 'CANCELLED' | 'PAST_DUE'

export type SubscriptionPlan = {
  code: SubscriptionPlanCode
  name: string
  description: string
  monthlyPrice: number
  annualPrice: number
  hardwareAmount?: number
  annualDiscount?: number
  firstYearIncluded: boolean
  features: string[]
}

export type CurrentSubscription = {
  planCode: SubscriptionPlanCode
  status: SubscriptionStatus
  billingPeriod?: BillingPeriod
  startsAt?: string
  expiresAt?: string
  orderId?: string
}

export type SubscriptionFeatures = {
  planCode?: SubscriptionPlanCode
  status?: SubscriptionStatus
  features: Record<string, boolean>
}

export type CheckoutRequest = {
  planCode: SubscriptionPlanCode
  billingPeriod: BillingPeriod
  customerType: CustomerType
  fullName: string
  documentType: string
  documentNumber: string
  email: string
  phoneNumber: string
  address: string
  city: string
  country: string
  acceptTerms: boolean
  companyName?: string
  taxId?: string
  buildingId?: number
  departmentCount?: number
}

export type CheckoutResponse = {
  orderId: string
  subscriptionId?: string
  status: SubscriptionStatus | 'PENDING_PAYMENT'
  amount: number
  currency: string
  billingPeriod: BillingPeriod
  planCode: SubscriptionPlanCode
}

export type SimulatePaymentResponse = CheckoutResponse & {
  startsAt?: string
  expiresAt?: string
}
