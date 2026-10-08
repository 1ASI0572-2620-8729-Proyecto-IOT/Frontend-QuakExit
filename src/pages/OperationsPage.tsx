import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Check,
  ClipboardList,
  FileBarChart,
  Filter,
  KeyRound,
  Settings2,
  Wrench,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { getAuditRecords } from "../services/auditService";
import {
  acknowledgeMaintenanceAlert,
  getMaintenanceAlerts,
  resolveMaintenanceAlert,
} from "../services/maintenanceService";
import {
  deactivatePushToken,
  getNotificationPreferences,
  getNotifications,
  registerPushToken,
  updateNotificationPreferences,
} from "../services/notificationsService";
import {
  getDeviceReport,
  getEarthquakeReport,
  getFalseAlarmReport,
  getReportSummary,
  getSimulationReport,
} from "../services/reportsService";
import type {
  AuditFilters,
  MaintenanceFilters,
  NotificationFilters,
  NotificationPreferences,
  ReportFilters,
} from "../types/operations";

type Tab = "notifications" | "audit" | "reports" | "maintenance";
type ReportKind = "sismos" | "simulacros" | "dispositivos" | "falsas-alarmas";

const tabs: Array<{
  id: Tab;
  label: string;
  description: string;
  icon: typeof Bell;
}> = [
  {
    id: "notifications",
    label: "Notificaciones",
    description: "Configura avisos y consulta sus envíos",
    icon: Bell,
  },
  {
    id: "audit",
    label: "Auditoría",
    description: "Revisa quién hizo cada cambio",
    icon: ClipboardList,
  },
  {
    id: "reports",
    label: "Reportes",
    description: "Consulta el historial del sistema",
    icon: FileBarChart,
  },
  {
    id: "maintenance",
    label: "Mantenimiento",
    description: "Atiende dispositivos con problemas",
    icon: Wrench,
  },
];

const emptyPreferences: NotificationPreferences = {
  push: true,
  sms: true,
  whatsapp: false,
  earthquakes: true,
  emergencies: true,
  bulkAlarms: true,
  lowBattery: true,
  deviceOffline: true,
};

const normalizeRows = <T,>(
  response: { content?: T[]; items?: T[]; data?: T[] } | undefined,
) => response?.content ?? response?.items ?? response?.data ?? [];
const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleString("es-PE") : "Sin fecha";

export function OperationsPage() {
  const [tab, setTab] = useState<Tab>("notifications");
  const [, setPage] = useState(0);
  const [size] = useState(10);
  const [auditFilters, setAuditFilters] = useState<AuditFilters>({
    page: 0,
    size,
  });
  const [notificationFilters, setNotificationFilters] =
    useState<NotificationFilters>({ page: 0, size });
  const [maintenanceFilters, setMaintenanceFilters] =
    useState<MaintenanceFilters>({ page: 0, size });
  const [reportKind, setReportKind] = useState<ReportKind>("sismos");
  const [reportFilters, setReportFilters] = useState<ReportFilters>({
    page: 0,
    size,
  });
  const [token, setToken] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [resolutionNote, setResolutionNote] = useState<Record<string, string>>(
    {},
  );
  const queryClient = useQueryClient();

  const preferencesQuery = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: getNotificationPreferences,
  });
  const preferences = preferencesQuery.data ?? emptyPreferences;
  const auditQuery = useQuery({
    queryKey: ["audit", auditFilters],
    queryFn: () => getAuditRecords(auditFilters),
    enabled: tab === "audit",
  });
  const notificationsQuery = useQuery({
    queryKey: ["notifications", notificationFilters],
    queryFn: () => getNotifications(notificationFilters),
    enabled: tab === "notifications",
  });
  const maintenanceQuery = useQuery({
    queryKey: ["maintenance-alerts", maintenanceFilters],
    queryFn: () => getMaintenanceAlerts(maintenanceFilters),
    enabled: tab === "maintenance",
  });
  const reportQuery = useQuery({
    queryKey: ["report", reportKind, reportFilters],
    enabled: tab === "reports",
    queryFn: () =>
      reportKind === "sismos"
        ? getEarthquakeReport(reportFilters)
        : reportKind === "simulacros"
          ? getSimulationReport(reportFilters)
          : reportKind === "dispositivos"
            ? getDeviceReport(reportFilters)
            : getFalseAlarmReport(reportFilters),
  });
  const summaryQuery = useQuery({
    queryKey: [
      "report-summary",
      reportFilters.from,
      reportFilters.to,
      reportFilters.buildingId,
    ],
    queryFn: () => getReportSummary(reportFilters),
    enabled: tab === "reports",
  });

  const preferencesMutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: (data) => {
      queryClient.setQueryData(["notification-preferences"], data);
      toast.success("Preferencias actualizadas.");
    },
    onError: () => toast.error("No se pudieron actualizar las preferencias."),
  });
  const pushTokenMutation = useMutation({
    mutationFn: registerPushToken,
    onSuccess: (data) => {
      setToken("");
      setTokenId(String(data.id));
      toast.success("Token push registrado.");
    },
    onError: () => toast.error("No se pudo registrar el token push."),
  });
  const deactivateTokenMutation = useMutation({
    mutationFn: (id: string) => deactivatePushToken(id),
    onSuccess: () => {
      setTokenId("");
      toast.success("Token push desactivado.");
    },
    onError: () => toast.error("No se pudo desactivar el token push."),
  });
  const acknowledgeMutation = useMutation({
    mutationFn: acknowledgeMaintenanceAlert,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["maintenance-alerts"] });
      toast.success("Alerta reconocida.");
    },
    onError: () => toast.error("No se pudo reconocer la alerta."),
  });
  const resolveMutation = useMutation({
    mutationFn: ({ id, note }: { id: string | number; note: string }) =>
      resolveMaintenanceAlert(id, note),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["maintenance-alerts"] });
      toast.success("Alerta resuelta.");
    },
    onError: () => toast.error("No se pudo resolver la alerta."),
  });

  const updatePreference = (key: keyof NotificationPreferences) => {
    preferencesMutation.mutate({ ...preferences, [key]: !preferences[key] });
  };

  const applyFilters = (
    event: FormEvent<HTMLFormElement>,
    callback: () => void,
  ) => {
    event.preventDefault();
    setPage(0);
    callback();
  };

  const setTabAndReset = (nextTab: Tab) => {
    setTab(nextTab);
    setPage(0);
  };

  return (
    <div className="operations-page space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.22em] text-amber">
          Centro operativo
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-amber">
          Auditoría, avisos y reportes
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Este es el centro de seguimiento de QuakExit. Aquí no se inicia un
          simulacro: puedes configurar cómo recibir avisos, consultar el
          historial y atender alertas técnicas de tus dispositivos.
        </p>
      </header>

      <nav
        className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:grid-cols-4"
        aria-label="Módulos operativos"
      >
        {tabs.map(({ id, label, description, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTabAndReset(id)}
            title={description}
            className={`inline-flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-3 text-sm font-semibold transition ${tab === id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <span className="inline-flex items-center gap-2">
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </span>
            <span
              className={`text-[11px] font-normal ${tab === id ? "text-slate-300" : "text-slate-400"}`}
            >
              {description}
            </span>
          </button>
        ))}
      </nav>

      {tab === "notifications" && (
        <NotificationsPanel
          preferences={preferences}
          onToggle={updatePreference}
          preferencesLoading={preferencesQuery.isLoading}
          token={token}
          setToken={setToken}
          tokenId={tokenId}
          setTokenId={setTokenId}
          register={() => pushTokenMutation.mutate(token)}
          deactivate={() => deactivateTokenMutation.mutate(tokenId)}
          loading={
            pushTokenMutation.isPending || deactivateTokenMutation.isPending
          }
          filters={notificationFilters}
          setFilters={setNotificationFilters}
          applyFilters={applyFilters}
          rows={normalizeRows(notificationsQuery.data)}
          loadingRows={notificationsQuery.isLoading}
        />
      )}
      {tab === "audit" && (
        <AuditPanel
          filters={auditFilters}
          setFilters={setAuditFilters}
          applyFilters={applyFilters}
          rows={normalizeRows(auditQuery.data)}
          loading={auditQuery.isLoading}
        />
      )}
      {tab === "reports" && (
        <ReportsPanel
          kind={reportKind}
          setKind={setReportKind}
          filters={reportFilters}
          setFilters={setReportFilters}
          rows={normalizeRows(reportQuery.data)}
          summary={summaryQuery.data}
          loading={reportQuery.isLoading || summaryQuery.isLoading}
        />
      )}
      {tab === "maintenance" && (
        <MaintenancePanel
          filters={maintenanceFilters}
          setFilters={setMaintenanceFilters}
          applyFilters={applyFilters}
          rows={normalizeRows(maintenanceQuery.data)}
          loading={maintenanceQuery.isLoading}
          resolutionNote={resolutionNote}
          setResolutionNote={setResolutionNote}
          acknowledge={(id) => acknowledgeMutation.mutate(id)}
          resolve={(id, note) => resolveMutation.mutate({ id, note })}
          loadingAction={
            acknowledgeMutation.isPending || resolveMutation.isPending
          }
        />
      )}
    </div>
  );
}

function NotificationsPanel({
  preferences,
  onToggle,
  preferencesLoading,
  token,
  setToken,
  tokenId,
  setTokenId,
  register,
  deactivate,
  loading,
  filters,
  setFilters,
  applyFilters,
  rows,
  loadingRows,
}: {
  preferences: NotificationPreferences;
  onToggle: (key: keyof NotificationPreferences) => void;
  preferencesLoading: boolean;
  token: string;
  setToken: (value: string) => void;
  tokenId: string;
  setTokenId: (value: string) => void;
  register: () => void;
  deactivate: () => void;
  loading: boolean;
  filters: NotificationFilters;
  setFilters: (value: NotificationFilters) => void;
  applyFilters: (
    event: FormEvent<HTMLFormElement>,
    callback: () => void,
  ) => void;
  rows: Array<Record<string, unknown>>;
  loadingRows: boolean;
}) {
  const preferenceLabels: Array<[keyof NotificationPreferences, string]> = [
    ["push", "Push"],
    ["sms", "SMS"],
    ["whatsapp", "WhatsApp"],
    ["earthquakes", "Sismos"],
    ["emergencies", "Emergencias"],
    ["bulkAlarms", "Alarmas masivas"],
    ["lowBattery", "Batería baja"],
    ["deviceOffline", "Dispositivo desconectado"],
  ];
  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-line bg-panel p-5 text-white">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-amber" />
            <h2 className="font-semibold">Preferencias de aviso</h2>
          </div>
          <div className="mt-4 grid gap-2">
            {preferenceLabels.map(([key, label]) => (
              <label
                key={key}
                className="flex items-center justify-between rounded-xl bg-canvas p-3 text-sm text-slate-200"
              >
                <span>{label}</span>
                <input
                  type="checkbox"
                  checked={preferences[key]}
                  disabled={preferencesLoading || loading}
                  onChange={() => onToggle(key)}
                  className="h-4 w-4 accent-amber"
                />
              </label>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-slate-700" />
            <h2 className="font-semibold text-slate-900">
              Notificaciones push del móvil
            </h2>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Registra el token que entrega tu aplicación móvil para recibir
            avisos push. Después de registrarlo, conserva el ID devuelto si
            necesitas desactivarlo.
          </p>
          <label className="mt-4 block text-xs font-medium text-slate-600">
            Token del dispositivo móvil
            <input
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Pega aquí el token push"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={register}
            disabled={!token || loading}
            className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Registrar token
          </button>
          <div className="mt-4 flex gap-2">
            <label className="min-w-0 flex-1 text-xs font-medium text-slate-600">
              ID del token registrado
              <input
                value={tokenId}
                onChange={(event) => setTokenId(event.target.value)}
                placeholder="Ej. 12"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              />
            </label>
            <button
              type="button"
              onClick={deactivate}
              disabled={!tokenId || loading}
              className="self-end rounded-xl border border-danger/40 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-50"
            >
              Desactivar
            </button>
          </div>
        </section>
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-900">
              Historial de notificaciones
            </h2>
            <p className="text-sm text-slate-500">
              Filtra envíos, reintentos y simulaciones.
            </p>
          </div>
          <Bell className="h-5 w-5 text-amber" />
        </div>
        <form
          onSubmit={(event) => applyFilters(event, () => undefined)}
          className="mt-4 grid gap-2 sm:grid-cols-4"
        >
          <select
            value={filters.channel ?? ""}
            onChange={(event) =>
              setFilters({
                ...filters,
                channel:
                  (event.target.value as NotificationFilters["channel"]) ||
                  undefined,
                page: 0,
              })
            }
            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-sm"
          >
            <option value="">Canal</option>
            <option value="PUSH">Push</option>
            <option value="SMS">SMS</option>
            <option value="WHATSAPP">WhatsApp</option>
          </select>
          <select
            value={filters.status ?? ""}
            onChange={(event) =>
              setFilters({
                ...filters,
                status:
                  (event.target.value as NotificationFilters["status"]) ||
                  undefined,
                page: 0,
              })
            }
            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-sm"
          >
            <option value="">Estado</option>
            <option value="SENT">Enviada</option>
            <option value="FAILED">Fallida</option>
            <option value="RETRIED">Reintentada</option>
            <option value="SIMULATION">Simulación</option>
          </select>
          <input
            type="date"
            value={filters.from ?? ""}
            onChange={(event) =>
              setFilters({
                ...filters,
                from: event.target.value || undefined,
                page: 0,
              })
            }
            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-sm"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
          >
            <Filter className="h-4 w-4" />
            Aplicar
          </button>
        </form>
        <DataTable
          rows={rows}
          loading={loadingRows}
          columns={["channel", "type", "status", "message", "createdAt"]}
        />
      </section>
    </div>
  );
}

function AuditPanel({
  filters,
  setFilters,
  applyFilters,
  rows,
  loading,
}: {
  filters: AuditFilters;
  setFilters: (value: AuditFilters) => void;
  applyFilters: (
    event: FormEvent<HTMLFormElement>,
    callback: () => void,
  ) => void;
  rows: Array<Record<string, unknown>>;
  loading: boolean;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <PanelTitle
        icon={ClipboardList}
        title="Auditoría del sistema"
        description="Consulta qué usuario o proceso realizó una acción y cuándo ocurrió."
      />
      <form
        onSubmit={(event) => applyFilters(event, () => undefined)}
        className="mt-5 grid gap-2 sm:grid-cols-3 lg:grid-cols-6"
      >
        <input
          aria-label="ID de usuario"
          placeholder="ID de usuario"
          value={filters.userId ?? ""}
          onChange={(event) =>
            setFilters({
              ...filters,
              userId: event.target.value || undefined,
              page: 0,
            })
          }
          className="field"
        />
        <input
          aria-label="Acción"
          placeholder="Acción (opcional)"
          value={filters.action ?? ""}
          onChange={(event) =>
            setFilters({
              ...filters,
              action: event.target.value || undefined,
              page: 0,
            })
          }
          className="field"
        />
        <input
          aria-label="Tipo de entidad"
          placeholder="Tipo de entidad"
          value={filters.entityType ?? ""}
          onChange={(event) =>
            setFilters({
              ...filters,
              entityType: event.target.value || undefined,
              page: 0,
            })
          }
          className="field"
        />
        <input
          aria-label="Desde"
          type="date"
          value={filters.from ?? ""}
          onChange={(event) =>
            setFilters({
              ...filters,
              from: event.target.value || undefined,
              page: 0,
            })
          }
          className="field"
        />
        <input
          aria-label="Hasta"
          type="date"
          value={filters.to ?? ""}
          onChange={(event) =>
            setFilters({
              ...filters,
              to: event.target.value || undefined,
              page: 0,
            })
          }
          className="field"
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
        >
          Filtrar
        </button>
      </form>
      <DataTable
        rows={rows}
        loading={loading}
        columns={["action", "entityType", "userName", "entityId", "createdAt"]}
      />
    </section>
  );
}

function ReportsPanel({
  kind,
  setKind,
  filters,
  setFilters,
  rows,
  summary,
  loading,
}: {
  kind: ReportKind;
  setKind: (value: ReportKind) => void;
  filters: ReportFilters;
  setFilters: (value: ReportFilters) => void;
  rows: Array<Record<string, unknown>>;
  summary?: {
    activeDevices?: number;
    activeAlerts?: number;
    totalEvents?: number;
  };
  loading: boolean;
}) {
  return (
    <section className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi label="Dispositivos activos" value={summary?.activeDevices} />
        <Kpi label="Alertas activas" value={summary?.activeAlerts} />
        <Kpi label="Total de eventos" value={summary?.totalEvents} />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <PanelTitle
          icon={FileBarChart}
          title="Reportes operativos"
          description="Historial filtrable de sismos, simulacros, dispositivos y falsas alarmas."
        />
        <div className="mt-5 flex flex-wrap gap-2">
          <select
            value={kind}
            onChange={(event) => setKind(event.target.value as ReportKind)}
            className="field"
          >
            <option value="sismos">Sismos</option>
            <option value="simulacros">Simulacros</option>
            <option value="dispositivos">Dispositivos</option>
            <option value="falsas-alarmas">Falsas alarmas</option>
          </select>
          <input
            type="date"
            value={filters.from ?? ""}
            onChange={(event) =>
              setFilters({
                ...filters,
                from: event.target.value || undefined,
                page: 0,
              })
            }
            className="field"
          />
          <input
            type="date"
            value={filters.to ?? ""}
            onChange={(event) =>
              setFilters({
                ...filters,
                to: event.target.value || undefined,
                page: 0,
              })
            }
            className="field"
          />
          <input
            placeholder="buildingId"
            value={filters.buildingId ?? ""}
            onChange={(event) =>
              setFilters({
                ...filters,
                buildingId: event.target.value || undefined,
                page: 0,
              })
            }
            className="field"
          />
        </div>
        <DataTable
          rows={rows}
          loading={loading}
          columns={[
            "status",
            "deviceId",
            "buildingId",
            "magnitude",
            "severity",
            "createdAt",
          ]}
        />
      </div>
    </section>
  );
}

function MaintenancePanel({
  filters,
  setFilters,
  applyFilters,
  rows,
  loading,
  resolutionNote,
  setResolutionNote,
  acknowledge,
  resolve,
  loadingAction,
}: {
  filters: MaintenanceFilters;
  setFilters: (value: MaintenanceFilters) => void;
  applyFilters: (
    event: FormEvent<HTMLFormElement>,
    callback: () => void,
  ) => void;
  rows: Array<Record<string, unknown>>;
  loading: boolean;
  resolutionNote: Record<string, string>;
  setResolutionNote: (value: Record<string, string>) => void;
  acknowledge: (id: string | number) => void;
  resolve: (id: string | number, note: string) => void;
  loadingAction: boolean;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <PanelTitle
        icon={Wrench}
        title="Alertas de mantenimiento"
        description="Atiende batería baja y dispositivos desconectados."
      />
      <form
        onSubmit={(event) => applyFilters(event, () => undefined)}
        className="mt-5 flex flex-wrap gap-2"
      >
        <select
          value={filters.status ?? ""}
          onChange={(event) =>
            setFilters({
              ...filters,
              status:
                (event.target.value as MaintenanceFilters["status"]) ||
                undefined,
              page: 0,
            })
          }
          className="field"
        >
          <option value="">Estado</option>
          <option value="OPEN">Abierta</option>
          <option value="ACKNOWLEDGED">Reconocida</option>
          <option value="RESOLVED">Resuelta</option>
        </select>
        <select
          value={filters.type ?? ""}
          onChange={(event) =>
            setFilters({
              ...filters,
              type:
                (event.target.value as MaintenanceFilters["type"]) || undefined,
              page: 0,
            })
          }
          className="field"
        >
          <option value="">Tipo</option>
          <option value="LOW_BATTERY">Batería baja</option>
          <option value="DEVICE_OFFLINE">Desconectado</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
        >
          Filtrar
        </button>
      </form>
      <div className="mt-5 space-y-3">
        {loading ? (
          <p className="text-sm text-slate-500">Cargando alertas...</p>
        ) : rows.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
            No hay alertas con estos filtros.
          </p>
        ) : (
          rows.map((row) => {
            const id = String(row.id ?? "");
            const status = String(row.status ?? "OPEN");
            return (
              <article
                key={id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {String(row.type ?? "Mantenimiento")}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {String(
                        row.message ??
                          row.deviceName ??
                          `Dispositivo ${row.deviceId ?? ""}`,
                      )}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber/15 px-2 py-1 text-xs font-semibold text-amber-700">
                    {status}
                  </span>
                </div>
                {status !== "RESOLVED" && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => acknowledge(row.id as string | number)}
                      disabled={loadingAction || status !== "OPEN"}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-40"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Reconocer
                    </button>
                    <input
                      value={resolutionNote[id] ?? ""}
                      onChange={(event) =>
                        setResolutionNote({
                          ...resolutionNote,
                          [id]: event.target.value,
                        })
                      }
                      placeholder="Nota de resolución"
                      className="field min-w-48"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        resolve(
                          row.id as string | number,
                          resolutionNote[id] ?? "",
                        )
                      }
                      disabled={loadingAction}
                      className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                    >
                      Resolver
                    </button>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

function PanelTitle({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof ClipboardList;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 text-amber-600" />
      <div>
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}
function Kpi({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-slate-900">
        {value ?? "--"}
      </p>
    </div>
  );
}
function DataTable({
  rows,
  loading,
  columns,
}: {
  rows: Array<Record<string, unknown>>;
  loading: boolean;
  columns: string[];
}) {
  return (
    <div className="mt-5 overflow-x-auto">
      {loading ? (
        <p className="p-4 text-sm text-slate-500">Cargando datos...</p>
      ) : rows.length === 0 ? (
        <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
          No hay registros para estos filtros.
        </p>
      ) : (
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-3 py-3 font-semibold text-slate-500"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={String(row.id ?? index)}
                className="border-b border-slate-100"
              >
                {columns.map((column) => (
                  <td
                    key={column}
                    className="max-w-64 px-3 py-3 text-slate-700"
                  >
                    {column === "createdAt"
                      ? formatDate(String(row[column] ?? ""))
                      : typeof row[column] === "object"
                        ? JSON.stringify(row[column])
                        : String(row[column] ?? "--")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
