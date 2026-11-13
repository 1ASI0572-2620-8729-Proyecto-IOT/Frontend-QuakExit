import { Mail, ShieldCheck, UserRound } from "lucide-react";

import { useI18n } from '../i18n/I18nProvider'
import { useCurrentSubscription } from "../hooks/useSubscription";
import { useAuthStore } from "../store/authStore";

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { locale } = useI18n()
  const isEnglish = locale === 'en'
  const { data: subscriptionData, isLoading: subscriptionLoading } =
    useCurrentSubscription();
  const subscription = subscriptionData?.subscription;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-amber">{isEnglish ? 'Account' : 'Cuenta'}</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">
          {isEnglish ? 'User profile' : 'Perfil de usuario'}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {isEnglish ? 'Information from the authenticated session.' : 'Información de la sesión autenticada.'}
        </p>
      </div>
      <section
        className="rounded-2xl border border-line bg-panel p-6"
        aria-labelledby="profile-title"
      >
        <div className="flex items-center gap-4 border-b border-line pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber text-2xl font-bold text-slate-950">
            {user?.fullName?.slice(0, 1).toUpperCase() ?? "U"}
          </div>
          <div>
            <h2 id="profile-title" className="text-xl font-semibold text-white">
              {user?.fullName ?? (isEnglish ? 'User' : 'Usuario')}
            </h2>
            <p className="text-sm text-slate-400">{user?.role ?? (isEnglish ? 'No role' : 'Sin rol')}</p>
          </div>
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-canvas p-4">
            <dt className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
              <Mail className="h-4 w-4" />
              {isEnglish ? 'Email' : 'Correo'}
            </dt>
            <dd className="mt-2 text-sm text-slate-200">
              {user?.email ?? (isEnglish ? 'Not available' : 'No disponible')}
            </dd>
          </div>
          <div className="rounded-xl bg-canvas p-4">
            <dt className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
              <UserRound className="h-4 w-4" />
              {isEnglish ? 'Identifier' : 'Identificador'}
            </dt>
            <dd className="mt-2 text-sm text-slate-200">
              {user?.id ?? (isEnglish ? 'Not available' : 'No disponible')}
            </dd>
          </div>
          <div className="rounded-xl bg-canvas p-4 sm:col-span-2">
            <dt className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
              <ShieldCheck className="h-4 w-4" />
              {isEnglish ? 'Security status' : 'Estado de seguridad'}
            </dt>
            <dd className="mt-2 text-sm text-green-200">
              {isEnglish ? 'Authenticated session with JWT' : 'Sesión autenticada con JWT'}
            </dd>
          </div>
        </dl>
        <section className="mt-6 rounded-xl border border-line bg-canvas p-4">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
            <ShieldCheck className="h-4 w-4" />
            {isEnglish ? 'Subscription' : 'Suscripción'}
          </p>
          {subscriptionLoading ? (
            <p className="mt-2 text-sm text-slate-400">
              {isEnglish ? 'Checking subscription...' : 'Consultando suscripción...'}
            </p>
          ) : subscription ? (
            <div className="mt-2 text-sm text-slate-200">
              <p className="font-semibold">
                {subscription.planCode.replaceAll("_", " ")}
              </p>
              <p className="mt-1 text-slate-400">
                {isEnglish ? 'Status' : 'Estado'}: {subscription.status} · {isEnglish ? 'Expires' : 'Vence'}:{" "}
                {new Date(subscription.expiresAt).toLocaleDateString(isEnglish ? 'en-US' : 'es-PE')}
              </p>
            </div>
          ) : user?.role === "SYSTEM_ADMIN" ? (
            <div className="mt-2 text-sm text-slate-200">
              <p className="font-semibold">{isEnglish ? 'System administrator' : 'Administrador del sistema'}</p>
              <p className="mt-1 text-slate-400">
                {isEnglish ? 'Status: ACTIVE · Expires: Never' : 'Estado: ACTIVE · Vence: Nunca'}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-400">
              {isEnglish ? 'You do not have an active subscription.' : 'No tienes una suscripción activa.'}
            </p>
          )}
        </section>
        <button
          type="button"
          onClick={() => {
            logout();
            window.location.assign("/login");
          }}
          className="mt-6 rounded-xl border border-danger/40 px-4 py-3 text-sm font-semibold text-red-200 hover:bg-danger/10"
        >
          {isEnglish ? 'Log out' : 'Cerrar sesión'}
        </button>
      </section>
    </div>
  );
}
