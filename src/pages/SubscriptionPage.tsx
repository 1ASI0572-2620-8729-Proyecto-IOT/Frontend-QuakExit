import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, CreditCard, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  subscriptionService,
  type BillingPeriod,
  type PlanCode,
  type SubscriptionPlan,
} from "../services/subscriptionService";
import { useAuthStore } from "../store/authStore";

const planDescriptions: Record<PlanCode, string> = {
  CLOUD_ESSENTIAL: "Monitorea tu hogar y controla tus dispositivos esenciales.",
  CLOUD_PLUS:
    "Añade reportes, historial y herramientas avanzadas para tu hogar.",
  CLOUD_BUILDING: "Gestiona edificios, residentes y registros masivos.",
  CLOUD_ENTERPRISE:
    "Integra múltiples edificios, analítica y soporte prioritario.",
};

const formatPrice = (price: number | null, currency: string) =>
  price === null ? "Consultar" : `${currency} ${price.toFixed(2)}`;

export function SubscriptionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const {
    data: plans = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["subscription", "plans"],
    queryFn: subscriptionService.listPlans,
    staleTime: 300_000,
  });
  const [selectedPlan, setSelectedPlan] = useState<PlanCode>("CLOUD_ESSENTIAL");
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("MONTHLY");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subscribe = async (plan: SubscriptionPlan) => {
    if (!user) return;
    if (plan.code === "CLOUD_ENTERPRISE") {
      toast.info(
        "El plan Enterprise requiere contacto con nuestro equipo comercial.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const checkout = await subscriptionService.checkout({
        planCode: plan.code,
        billingPeriod,
        customerType: "PERSON",
        scopeType: "USER",
        fullName: user.fullName,
        email: user.email,
        country: "PE",
        includeHardware: false,
        acceptTerms: true,
        ...(plan.code === "CLOUD_BUILDING" ? { departmentCount: 1 } : {}),
      });

      await subscriptionService.simulatePayment(checkout.orderId);
      await queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Suscripción activada correctamente");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("No fue posible activar la suscripción. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div className="rounded-3xl border border-line bg-panel p-8 text-slate-300">
        Cargando planes...
      </div>
    );
  if (isError)
    return (
      <div className="rounded-3xl border border-danger/40 bg-danger/10 p-8 text-red-200">
        No se pudieron cargar los planes disponibles.
      </div>
    );

  const selected = plans.find((plan) => plan.code === selectedPlan) ?? plans[0];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-amber" />
        <p className="mt-4 text-xs uppercase tracking-[0.25em] text-amber">
          Protección QuakExit
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          Elige tu suscripción
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-400">
          Activa un plan para registrar dispositivos, configurar tu propiedad y
          utilizar todas las funciones de tu cuenta.
        </p>
      </div>

      <div className="mx-auto flex w-fit rounded-xl border border-line bg-panel p-1">
        {(["MONTHLY", "ANNUAL"] as const).map((period) => (
          <button
            key={period}
            type="button"
            onClick={() => setBillingPeriod(period)}
            className={`rounded-lg px-5 py-2 text-sm ${billingPeriod === period ? "bg-amber font-semibold text-slate-950" : "text-slate-300"}`}
          >
            {period === "MONTHLY" ? "Mensual" : "Anual"}
          </button>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const price =
            billingPeriod === "MONTHLY" ? plan.monthlyPrice : plan.annualPrice;
          const isSelected = selectedPlan === plan.code;
          return (
            <button
              key={plan.code}
              type="button"
              onClick={() => setSelectedPlan(plan.code)}
              className={`text-left rounded-2xl border p-5 transition ${isSelected ? "border-amber bg-amber/10 shadow-[0_0_24px_rgba(245,185,66,0.12)]" : "border-line bg-panel hover:border-slate-500"}`}
            >
              <p className="text-sm font-semibold text-white">{plan.name}</p>
              <p className="mt-3 text-2xl font-semibold text-amber">
                {formatPrice(price, plan.currency)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {price === null
                  ? "Precio personalizado"
                  : billingPeriod === "MONTHLY"
                    ? "por mes"
                    : "por año"}
              </p>
              <p className="mt-4 min-h-12 text-sm text-slate-300">
                {planDescriptions[plan.code]}
              </p>
              <ul className="mt-5 space-y-2 text-xs text-slate-400">
                {plan.features.slice(0, 5).map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check className="h-4 w-4 shrink-0 text-success" />
                    {feature.replaceAll("_", " ")}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {selected && (
        <section className="mx-auto max-w-xl rounded-2xl border border-line bg-panel p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Plan seleccionado
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                {selected.name}
              </h2>
            </div>
            <CreditCard className="h-6 w-6 text-amber" />
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => void subscribe(selected)}
            className="mt-6 w-full rounded-xl bg-amber px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Activando suscripción..."
              : selected.code === "CLOUD_ENTERPRISE"
                ? "Contactar ventas"
                : "Activar suscripción"}
          </button>
        </section>
      )}
    </div>
  );
}
