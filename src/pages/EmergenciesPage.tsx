import { AlertTriangle, CheckCircle2, Radio, Siren } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { deviceService } from "../services/deviceService";
import { emergencyService } from "../services/emergencyService";
import { ApiError } from "../types/api-error";
import type { DeviceRecord } from "../types/device";
import type {
  EarthquakeEvent,
  SimulateReadingRequest,
} from "../types/emergency";

type EmergencyRow = {
  id: string;
  status: EarthquakeEvent["status"];
  severity: EarthquakeEvent["severity"];
  peakAcceleration: string;
  sms: number;
  reason?: string;
};

const initialEvents: EmergencyRow[] = [
  {
    id: "evt-1",
    status: "ACTIVE",
    severity: "CRITICAL",
    peakAcceleration: "0.88g",
    sms: 3,
  },
  {
    id: "evt-2",
    status: "DETECTED",
    severity: "HIGH",
    peakAcceleration: "0.56g",
    sms: 2,
  },
  {
    id: "evt-3",
    status: "RESOLVED",
    severity: "LOW",
    peakAcceleration: "0.12g",
    sms: 1,
  },
];

const initialReading: SimulateReadingRequest = {
  deviceCode: "",
  timestamp: new Date().toISOString().slice(0, 16),
  ax: 0.2,
  ay: 0.2,
  az: 0.2,
  freqHz: 5,
  battery: 80,
};

export function EmergenciesPage() {
  const [events, setEvents] = useState(initialEvents);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [falseAlarmReason, setFalseAlarmReason] = useState("");
  const [reading, setReading] = useState(initialReading);
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const activeEvent = events.find(
    (event) => event.status === "ACTIVE" || event.status === "DETECTED",
  );

  useEffect(() => {
    let isMounted = true;

    const loadDevices = async () => {
      try {
        const userDevices = await deviceService.list();
        if (!isMounted) return;
        setDevices(userDevices);
        setReading((current) => ({
          ...current,
          deviceCode: current.deviceCode || userDevices[0]?.deviceCode || "",
        }));
      } catch (error) {
        console.error(error);
        if (isMounted) {
          toast.error(
            error instanceof ApiError
              ? error.message
              : "No se pudieron cargar tus dispositivos.",
          );
        }
      } finally {
        if (isMounted) setIsLoadingDevices(false);
      }
    };

    void loadDevices();
    return () => {
      isMounted = false;
    };
  }, []);

  const simulateReading = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSimulating(true);
    try {
      const response = await emergencyService.simulateReading({
        ...reading,
        timestamp: new Date(reading.timestamp).toISOString(),
      });
      if (response)
        setEvents((current) => [
          {
            id: response.id,
            status: response.status,
            severity: response.severity,
            peakAcceleration: `${response.peakAcceleration}g`,
            sms: response.smsNotificationsSent,
          },
          ...current,
        ]);
      toast.success("Lectura sísmica enviada.");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof ApiError
          ? error.message
          : "No se pudo enviar la lectura sísmica.",
      );
    } finally {
      setIsSimulating(false);
    }
  };

  const markFalseAlarm = async () => {
    if (!activeEvent || !falseAlarmReason.trim()) return;
    setIsSubmitting(true);
    try {
      await emergencyService.markFalseAlarm(activeEvent.id, {
        reason: falseAlarmReason.trim(),
      });
      setEvents((current) =>
        current.map((event) =>
          event.id === activeEvent.id
            ? {
                ...event,
                status: "FALSE_ALARM",
                reason: falseAlarmReason.trim(),
              }
            : event,
        ),
      );
      setFalseAlarmReason("");
      setIsAlertOpen(false);
      toast.success("Evento marcado como falsa alarma.");
    } catch {
      toast.error("No se pudo marcar la falsa alarma.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 rounded-[28px] border border-line bg-panel p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-amber">
            Emergencias
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white">
            Eventos sísmicos recientes
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setIsAlertOpen(true)}
          disabled={!activeEvent}
          className="inline-flex items-center gap-2 rounded-xl bg-danger px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          <Siren className="h-4 w-4" /> Ver alerta
        </button>
      </div>

      <form
        onSubmit={simulateReading}
        className="rounded-2xl border border-line bg-canvas p-4"
      >
        <div className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-amber" />
          <h2 className="font-semibold text-white">Simular lectura sísmica</h2>
        </div>
        <p className="mt-2 text-sm text-slate-400">
          Selecciona uno de los dispositivos vinculados a tu cuenta.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs text-slate-400">
            Dispositivo
            <select
              required
              value={reading.deviceCode}
              onChange={(event) =>
                setReading({ ...reading, deviceCode: event.target.value })
              }
              disabled={isLoadingDevices || devices.length === 0}
              className="mt-1 w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {isLoadingDevices
                  ? "Cargando dispositivos..."
                  : devices.length === 0
                    ? "No tienes dispositivos vinculados"
                    : "Selecciona un dispositivo"}
              </option>
              {devices.map((device) => (
                <option key={device.id} value={device.deviceCode}>
                  {device.alias} ({device.deviceCode})
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-slate-400">
            Fecha y hora
            <input
              required
              type="datetime-local"
              value={reading.timestamp}
              onChange={(event) =>
                setReading({ ...reading, timestamp: event.target.value })
              }
              className="mt-1 w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm text-white"
            />
          </label>
          {(
            [
              ["ax", "Aceleración X (g)"],
              ["ay", "Aceleración Y (g)"],
              ["az", "Aceleración Z (g)"],
              ["freqHz", "Frecuencia (Hz)"],
              ["battery", "Batería (%)"],
            ] as const
          ).map(([field, label]) => (
            <label key={field} className="text-xs text-slate-400">
              {label}
              <input
                required
                type="number"
                step="any"
                min={field === "battery" ? 0 : undefined}
                max={field === "battery" ? 100 : undefined}
                value={reading[field]}
                onChange={(event) =>
                  setReading({
                    ...reading,
                    [field]: Number(event.target.value),
                  })
                }
                className="mt-1 w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm text-white"
              />
            </label>
          ))}
        </div>
        <button
          type="submit"
          disabled={isSimulating || isLoadingDevices || devices.length === 0}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-50"
        >
          {isSimulating ? "Enviando..." : "Enviar lectura"}
        </button>
      </form>

      {isAlertOpen && activeEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="active-alert-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-danger/40 bg-panel p-6 text-white">
            <div className="flex items-center gap-3 text-danger">
              <AlertTriangle className="h-6 w-6" aria-hidden="true" />
              <h2 id="active-alert-title" className="text-lg font-semibold">
                Alerta activa
              </h2>
            </div>
            <p className="mt-4 text-sm text-slate-300">
              Se detectó un evento de severidad {activeEvent.severity} con una
              aceleración máxima de {activeEvent.peakAcceleration}.
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Se enviaron {activeEvent.sms} notificaciones SMS. Revisa el estado
              de las rutas de evacuación.
            </p>
            <textarea
              value={falseAlarmReason}
              onChange={(event) => setFalseAlarmReason(event.target.value)}
              placeholder="Motivo si fue una falsa alarma"
              className="mt-5 min-h-20 w-full rounded-xl border border-line bg-canvas px-3 py-2 text-sm text-white"
            />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsAlertOpen(false)}
                className="rounded-xl border border-line px-4 py-3 text-sm text-slate-300"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => void markFalseAlarm()}
                disabled={isSubmitting || !falseAlarmReason.trim()}
                className="rounded-xl bg-danger px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                Falsa alarma
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr className="border-b border-line">
              <th className="py-3 pr-4 font-medium">Estado</th>
              <th className="py-3 pr-4 font-medium">Severidad</th>
              <th className="py-3 pr-4 font-medium">Máx. aceleración</th>
              <th className="py-3 pr-4 font-medium">SMS</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b border-slate-100">
                <td className="py-3 pr-4">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium ${event.status === "ACTIVE" ? "bg-danger/10 text-danger" : event.status === "DETECTED" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}
                  >
                    {event.status === "ACTIVE" ? (
                      <AlertTriangle className="h-3 w-3" />
                    ) : (
                      <CheckCircle2 className="h-3 w-3" />
                    )}
                    {event.status}
                  </span>
                </td>
                <td className="py-3 pr-4 font-medium text-slate-300">
                  {event.severity}
                </td>
                <td className="py-3 pr-4 text-slate-400">
                  {event.peakAcceleration}
                </td>
                <td className="py-3 pr-4 text-slate-400">{event.sms}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
