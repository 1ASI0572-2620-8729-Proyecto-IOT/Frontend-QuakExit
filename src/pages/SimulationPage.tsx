import { PlanGate } from '../features/subscriptions/components/PlanGate'
import { PropertySimulation } from '../features/property/components/PropertySimulation'

export function SimulationPage() {
  return (
    <PlanGate feature="MANUAL_SIMULATIONS">
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-amber">Operación segura</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Simulacro de evacuación</h1>
          <p className="mt-2 text-sm text-slate-400">Prueba puertas, luces y rutas de evacuación de tu vivienda.</p>
        </div>
        <PropertySimulation />
      </div>
    </PlanGate>
  )
}