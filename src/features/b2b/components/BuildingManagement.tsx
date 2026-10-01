import { AlertTriangle, BellRing, ChevronLeft, ChevronRight, FileJson, Filter, Search, Upload } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { useBuildingUnits, useBulkRegisterDevices, useBulkRegisterDevicesCsv, useTriggerAllAlarms } from '../hooks/useBuildingManagement'
import type { BulkRow } from '../types'

const pageSize = 3

export function BuildingManagement() {
  const { data: units = [], isLoading } = useBuildingUnits()
  const alarmMutation = useTriggerAllAlarms()
  const csvMutation = useBulkRegisterDevicesCsv()
  const jsonMutation = useBulkRegisterDevices()
  const [buildingId, setBuildingId] = useState('1')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [page, setPage] = useState(0)
  const [preview, setPreview] = useState<BulkRow[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [confirmStep, setConfirmStep] = useState(0)
  const filtered = useMemo(() => units.filter((unit) => (filter === 'ALL' || unit.status === filter) && `${unit.unit} ${unit.resident}`.toLowerCase().includes(search.toLowerCase())), [filter, search, units])
  const visible = filtered.slice(page * pageSize, (page + 1) * pageSize)

  const parseFile = async (file: File) => {
    setSelectedFile(file)
    const text = await file.text()
    try {
      const parsed: unknown = file.name.endsWith('.json') ? JSON.parse(text) : text.split(/\r?\n/).filter(Boolean).slice(1).map((line, index) => { const [unit, resident, status, devices] = line.split(','); return { id: `upload-${index}`, unit, resident, status, devices: Number(devices) } })
      const rows = Array.isArray(parsed) ? parsed : []
      setPreview(rows.map((row, index) => { const item = row as Partial<BulkRow>; const valid = Boolean(item.unit && item.resident && ['SAFE', 'ALERT', 'OFFLINE'].includes(item.status ?? '') && Number.isFinite(item.devices)); return { id: item.id ?? `upload-${index}`, unit: item.unit ?? '', resident: item.resident ?? '', status: item.status as BulkRow['status'] ?? 'OFFLINE', devices: item.devices ?? 0, error: valid ? undefined : 'Fila incompleta o estado inválido' } }))
    } catch {
      setPreview([{ id: 'parse-error', unit: '', resident: '', status: 'OFFLINE', devices: 0, error: 'No se pudo leer el archivo' }])
    }
  }

  const submitCsv = async () => {
    const parsedBuildingId = Number(buildingId)
    if (!selectedFile || !Number.isInteger(parsedBuildingId) || parsedBuildingId <= 0) {
      toast.error('Selecciona un archivo y un buildingId válido.')
      return
    }
    try {
      const result = selectedFile.name.toLowerCase().endsWith('.json')
        ? await jsonMutation.mutateAsync({ buildingId: parsedBuildingId, devices: JSON.parse(await selectedFile.text()) })
        : await csvMutation.mutateAsync({ buildingId: parsedBuildingId, file: selectedFile })
      toast.success(result.message ?? 'Dispositivos registrados correctamente.')
    } catch {
      toast.error('No se pudo registrar el archivo CSV.')
    }
  }

  return <div className="space-y-6"><section className="rounded-2xl border border-line bg-panel p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.22em] text-amber">Administrador de torre</p><h1 className="mt-1 text-2xl font-semibold text-white">Gestión masiva</h1></div><button type="button" onClick={() => setConfirmStep(1)} className="inline-flex items-center gap-2 rounded-xl bg-danger px-4 py-3 text-sm font-semibold text-white"><BellRing className="h-4 w-4" />Activar alarmas comunes</button></div><div className="mt-5 flex flex-col gap-3 md:flex-row"><label className="flex flex-1 items-center gap-2 rounded-xl border border-line bg-canvas px-3 py-2 text-sm text-slate-400"><Search className="h-4 w-4" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(0) }} placeholder="Buscar departamento o residente" className="w-full bg-transparent text-white outline-none" /></label><label className="flex items-center gap-2 rounded-xl border border-line bg-canvas px-3 py-2 text-sm text-slate-300"><Filter className="h-4 w-4" /><select value={filter} onChange={(event) => { setFilter(event.target.value); setPage(0) }} className="bg-transparent outline-none"><option value="ALL">Todos</option><option value="SAFE">Seguros</option><option value="ALERT">En alerta</option><option value="OFFLINE">Desconectados</option></select></label></div><div className="mt-4 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="text-slate-500"><tr className="border-b border-line"><th className="py-3 pr-4">Departamento</th><th className="py-3 pr-4">Residente</th><th className="py-3 pr-4">Estado</th><th className="py-3 pr-4">Dispositivos</th></tr></thead><tbody>{isLoading ? <tr><td colSpan={4} className="py-8 text-center text-slate-400">Cargando unidades...</td></tr> : visible.map((unit) => <tr key={unit.id} className="border-b border-line"><td className="py-3 pr-4 font-medium text-white">{unit.unit}</td><td className="py-3 pr-4 text-slate-300">{unit.resident}</td><td className="py-3 pr-4"><span className={`rounded-full px-2 py-1 text-xs ${unit.status === 'ALERT' ? 'bg-danger/15 text-red-200' : unit.status === 'OFFLINE' ? 'bg-warning/15 text-amber' : 'bg-success/15 text-green-200'}`}>{unit.status}</span></td><td className="py-3 pr-4 text-slate-300">{unit.devices}</td></tr>)}</tbody></table></div><div className="mt-4 flex items-center justify-between text-sm text-slate-400"><span>{filtered.length} departamentos</span><div className="flex items-center gap-2"><button type="button" disabled={page === 0} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-line p-2 disabled:opacity-40" aria-label="Página anterior"><ChevronLeft className="h-4 w-4" /></button><span>{page + 1}</span><button type="button" disabled={(page + 1) * pageSize >= filtered.length} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-line p-2 disabled:opacity-40" aria-label="Página siguiente"><ChevronRight className="h-4 w-4" /></button></div></div></section><section className="rounded-2xl border border-line bg-panel p-5"><div className="flex items-center justify-between"><div><h2 className="font-semibold text-white">Carga masiva de dispositivos</h2><p className="mt-1 text-sm text-slate-400">Previsualiza y envía el archivo al edificio seleccionado.</p></div><FileJson className="h-6 w-6 text-amber" /></div><div className="mt-4 grid gap-3 sm:grid-cols-[160px_1fr]"><label className="text-sm text-slate-300">Building ID<input type="number" min="1" value={buildingId} onChange={(event) => setBuildingId(event.target.value)} className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-white" /></label><label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line p-6 text-sm text-slate-300 hover:border-amber hover:text-amber"><Upload className="h-5 w-5" />{selectedFile?.name ?? 'Seleccionar CSV o JSON'}<input type="file" accept=".csv,.json,application/json,text/csv" onChange={(event) => { const file = event.target.files?.[0]; if (file) void parseFile(file) }} className="sr-only" /></label></div>{preview.length > 0 && <div className="mt-4 space-y-2">{preview.map((row) => <div key={row.id} className="flex items-center justify-between rounded-lg bg-canvas p-3 text-sm"><span className="text-slate-300">{row.unit || 'Fila sin departamento'} · {row.resident || 'Sin residente'}</span>{row.error ? <span className="flex items-center gap-1 text-red-300"><AlertTriangle className="h-4 w-4" />{row.error}</span> : <span className="text-success">Lista</span>}</div>)}</div>}<button type="button" onClick={() => void submitCsv()} disabled={!selectedFile || csvMutation.isPending} className="mt-4 rounded-xl bg-amber px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-50">{csvMutation.isPending ? 'Registrando...' : 'Registrar dispositivos del archivo'}</button></section>{confirmStep > 0 && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4" role="dialog" aria-modal="true" aria-labelledby="alarm-title"><div className="w-full max-w-md rounded-2xl border border-line bg-panel p-6"><AlertTriangle className="h-7 w-7 text-danger" /><h2 id="alarm-title" className="mt-4 text-lg font-semibold text-white">{confirmStep === 1 ? 'Activar alarmas comunes' : 'Confirmación final'}</h2><p className="mt-2 text-sm text-slate-300">{confirmStep === 1 ? 'Se notificará a todos los departamentos y se activarán las alarmas del edificio.' : 'Esta acción afectará a todo el edificio. ¿Deseas continuar?'}</p><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setConfirmStep(0)} className="rounded-xl border border-line px-4 py-2 text-sm text-slate-300">Cancelar</button><button type="button" onClick={() => { if (confirmStep === 1) setConfirmStep(2); else { setConfirmStep(0); void alarmMutation.mutateAsync(Number(buildingId)) } }} disabled={alarmMutation.isPending} className="rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{confirmStep === 1 ? 'Continuar' : alarmMutation.isPending ? 'Activando...' : 'Activar ahora'}</button></div></div></div>}</div>
}