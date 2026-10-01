import { DoorOpen, Edit3, Lightbulb, LockKeyhole, Minus, Plus, Save, ShieldAlert, Sparkles, SquareArrowUp, TimerReset, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

import { LottiePlaceholder } from '../../../shared/ui/LottiePlaceholder'
import { usePropertyLayout, useSavePropertyLayout, useTriggerSimulation } from '../hooks/usePropertyLayout'
import type { PropertyCard, PropertyLayout } from '../types'

const cloneLayout = (layout: PropertyLayout): PropertyLayout => ({ levels: layout.levels.map((level) => ({ ...level, cards: level.cards.map((card) => ({ ...card })) })) })

function DeviceCard({ card, evacuating }: { card: PropertyCard; evacuating: boolean }) {
  const isDoor = card.type === 'DOOR'
  return <motion.article animate={evacuating ? { borderColor: ['#263650', '#F5B942', '#263650'] } : {}} transition={{ duration: 1.2, repeat: evacuating ? Infinity : 0 }} className="rounded-xl border border-line bg-canvas p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className={`rounded-lg p-2 ${evacuating ? 'bg-success/15 text-success' : 'bg-panelMuted text-slate-300'}`}>
          {evacuating ? <LottiePlaceholder name="lock-open" /> : isDoor ? <LockKeyhole className="h-5 w-5" aria-hidden="true" /> : <Lightbulb className="h-5 w-5" aria-hidden="true" />}
        </span>
        <div><h4 className="font-medium text-white">{card.name}</h4><p className="mt-1 text-xs text-slate-400">{evacuating ? 'Evacuación' : card.state}</p></div>
      </div>
      {evacuating && <DoorOpen className="h-5 w-5 text-success" aria-label="Desbloqueada" />}
    </div>
    {card.battery !== undefined && <div className="mt-4 flex items-center justify-between text-xs text-slate-400"><span>Batería</span><span className={card.battery < 30 ? 'text-danger' : card.battery < 60 ? 'text-warning' : 'text-success'}>{card.battery}%</span></div>}
  </motion.article>
}

export function PropertySimulation() {
  const { data, isLoading, isError, refetch } = usePropertyLayout()
  const saveLayout = useSavePropertyLayout()
  const simulation = useTriggerSimulation()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<PropertyLayout | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [simulationRunning, setSimulationRunning] = useState(false)
  const [showSummary, setShowSummary] = useState(false)

  useEffect(() => {
    if (!simulationRunning) return
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          setSimulationRunning(false)
          setShowSummary(true)
          return 0
        }
        return current - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [simulationRunning])

  const layout = editing ? draft : data
  const startEditing = () => {
    if (data) {
      setDraft(cloneLayout(data))
      setEditing(true)
    }
  }
  const updateLevel = (levelId: string, name: string) => setDraft((current) => current ? { levels: current.levels.map((level) => level.id === levelId ? { ...level, name } : level) } : current)
  const addLevel = () => setDraft((current) => current ? { levels: [...current.levels, { id: `level-${Date.now()}`, name: `Piso ${current.levels.length + 1}`, cards: [] }] } : current)
  const moveLevel = (index: number, direction: -1 | 1) => setDraft((current) => {
    if (!current) return current
    const target = index + direction
    if (target < 0 || target >= current.levels.length) return current
    const levels = [...current.levels]
    const [moved] = levels.splice(index, 1)
    levels.splice(target, 0, moved)
    return { levels }
  })
  const save = async () => {
    if (draft) {
      await saveLayout.mutateAsync(draft)
      setEditing(false)
    }
  }
  const startSimulation = async () => {
    const response = await simulation.mutateAsync({ target: 'PRIVATE_HOME', type: 'MANUAL' })
    if (response.simulation_active) {
      setShowSummary(false)
      setSimulationRunning(true)
      setSecondsLeft(response.duration_seconds)
    }
  }

  if (isLoading) return <section className="h-64 animate-pulse rounded-2xl bg-panelMuted" aria-label="Cargando configuración del hogar" />
  if (isError || !layout) return <section className="rounded-2xl border border-danger/40 bg-danger/10 p-6"><p className="text-sm text-red-200">No pudimos cargar la configuración del hogar.</p><button type="button" onClick={() => refetch()} className="mt-3 rounded-lg bg-danger px-3 py-2 text-sm text-white">Reintentar</button></section>

  const evacuating = simulationRunning && secondsLeft > 0
  return <section id="simulation" className="space-y-4 rounded-[28px] border border-line bg-panel p-5" aria-labelledby="property-title">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="text-xs uppercase tracking-[0.22em] text-amber">Configuración del hogar</p><h2 id="property-title" className="mt-1 text-xl font-semibold text-white">Niveles y dispositivos</h2></div>
      <div className="flex items-center gap-2">
        {evacuating && <span className="inline-flex items-center gap-2 rounded-full bg-danger/15 px-3 py-2 text-sm font-semibold text-red-200"><TimerReset className="h-4 w-4" />{secondsLeft}s</span>}
        {editing ? <><button type="button" onClick={() => setEditing(false)} className="rounded-xl border border-line p-2 text-slate-300" aria-label="Cancelar edición"><X className="h-4 w-4" /></button><button type="button" onClick={save} disabled={saveLayout.isPending} className="inline-flex items-center gap-2 rounded-xl bg-success px-3 py-2 text-sm font-semibold text-slate-950"><Save className="h-4 w-4" />Guardar</button></> : <button type="button" onClick={startEditing} className="inline-flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm text-slate-300 hover:bg-panelMuted"><Edit3 className="h-4 w-4" />Editar</button>}
      </div>
    </div>

    <div className="space-y-4">
      {layout.levels.map((level, index) => <div key={level.id} className="rounded-2xl border border-line bg-canvas p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          {editing ? <input value={level.name} onChange={(event) => updateLevel(level.id, event.target.value)} className="rounded-lg border border-line bg-panel px-3 py-2 font-semibold text-white focus:border-amber focus:outline-none" aria-label={`Nombre de ${level.name}`} /> : <h3 className="font-semibold text-white">{level.name}</h3>}
          {editing && <div className="flex items-center gap-1"><button type="button" onClick={() => moveLevel(index, -1)} className="rounded p-2 text-slate-400 hover:bg-panelMuted" aria-label="Subir nivel"><SquareArrowUp className="h-4 w-4" /></button><button type="button" onClick={() => moveLevel(index, 1)} className="rounded p-2 text-slate-400 hover:bg-panelMuted" aria-label="Bajar nivel"><Minus className="h-4 w-4" /></button></div>}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{level.cards.map((card) => <DeviceCard key={card.id} card={card} evacuating={evacuating} />)}{editing && <button type="button" onClick={() => setDraft((current) => current ? { levels: current.levels.map((item) => item.id === level.id ? { ...item, cards: [...item.cards, { id: `card-${Date.now()}`, type: 'SPACE', name: 'Nuevo espacio', state: 'ONLINE' }] } : item) } : current)} className="flex min-h-24 items-center justify-center gap-2 rounded-xl border border-dashed border-line text-sm text-slate-400 hover:border-amber hover:text-amber"><Plus className="h-4 w-4" />Añadir tarjeta</button>}</div>
      </div>)}
    </div>

    {editing && <button type="button" onClick={addLevel} className="inline-flex items-center gap-2 rounded-xl border border-dashed border-line px-3 py-2 text-sm text-slate-300 hover:border-amber hover:text-amber"><Plus className="h-4 w-4" />Añadir nivel</button>}
    {showSummary && !evacuating && <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-green-100"><Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-success" /><div><p className="font-semibold">Simulacro completado</p><p className="mt-1 text-green-100/80">Las tarjetas volvieron a su estado normal después de 30 segundos.</p></div></div>}
    {!editing && <button type="button" onClick={() => setConfirming(true)} disabled={evacuating || simulation.isPending} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-danger px-4 py-3 font-semibold text-white hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-50"><ShieldAlert className="h-5 w-5" />{evacuating ? 'Simulacro en curso' : 'Iniciar simulacro'}</button>}

    {confirming && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4" role="dialog" aria-modal="true" aria-labelledby="simulation-dialog-title"><div className="w-full max-w-md rounded-2xl border border-line bg-panel p-6"><Sparkles className="h-7 w-7 text-amber" /><h3 id="simulation-dialog-title" className="mt-4 text-lg font-semibold text-white">¿Iniciar simulacro?</h3><p className="mt-2 text-sm text-slate-300">Las puertas se desbloquearán y las luces indicarán la ruta durante 30 segundos.</p><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setConfirming(false)} className="rounded-xl border border-line px-4 py-2 text-sm text-slate-300">Cancelar</button><button type="button" onClick={() => { setConfirming(false); void startSimulation() }} className="rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white">Confirmar simulacro</button></div></div></div>}
  </section>
}
