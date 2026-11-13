import { useI18n } from '../i18n/I18nProvider'
import { PropertySimulation } from '../features/property/components/PropertySimulation'

export function SimulationPage() {
  const { locale } = useI18n()
  const isEnglish = locale === 'en'

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-amber">{isEnglish ? 'Safe operation' : 'Operación segura'}</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">{isEnglish ? 'Evacuation drill' : 'Simulacro de evacuación'}</h1>
        <p className="mt-2 text-sm text-slate-400">{isEnglish ? 'Test doors, lights and evacuation routes in your home.' : 'Prueba puertas, luces y rutas de evacuación de tu vivienda.'}</p>
      </div>
      <PropertySimulation />
    </div>
  )
}