import { useI18n } from '../i18n/I18nProvider'

export function ForbiddenPage() {
  const { locale } = useI18n()
  const isEnglish = locale === 'en'

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-soft">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">403</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900">{isEnglish ? 'Access restricted' : 'Acceso restringido'}</h1>
        <p className="mt-3 text-slate-600">{isEnglish ? 'You do not have permission to view this content.' : 'No tienes permisos para ver este contenido.'}</p>
      </div>
    </div>
  )
}
