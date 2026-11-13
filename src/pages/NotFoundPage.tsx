import { Link } from 'react-router-dom'

import { useI18n } from '../i18n/I18nProvider'

export function NotFoundPage() {
  const { locale } = useI18n()
  const isEnglish = locale === 'en'

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-soft">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">404</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900">{isEnglish ? 'Page not found' : 'Página no encontrada'}</h1>
        <p className="mt-3 text-slate-600">{isEnglish ? 'The route you are looking for does not exist or has moved.' : 'La ruta que buscas no existe o fue movida.'}</p>
        <Link to="/dashboard" className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">
          {isEnglish ? 'Back to dashboard' : 'Volver al dashboard'}
        </Link>
      </div>
    </div>
  )
}
