import { Home, ShieldAlert, Wifi, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export function HomeTwin() {
  return (
    <div className="space-y-4">
      <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 shadow-soft">
        <div
          className="relative mx-auto h-[300px] w-full max-w-[540px] overflow-hidden rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200"
          role="img"
          aria-label="Casa"
        >
          <motion.div
            className="absolute left-1/2 top-10 h-28 w-28 -translate-x-1/2 rounded-full bg-amber-200/70 blur-2xl"
            animate={{ opacity: [0.45, 0.85, 0.45], scale: [1, 1.06, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="absolute inset-x-10 bottom-8 h-32 rounded-[20px] bg-slate-200/80" />

          <div className="absolute left-1/2 top-16 h-32 w-56 -translate-x-1/2 rounded-t-[30px] rounded-b-[12px] border-4 border-slate-300 bg-slate-100 shadow-inner" />
          <div className="absolute left-1/2 top-28 h-20 w-28 -translate-x-1/2 rounded-xl border-4 border-slate-300 bg-slate-50" />

          <motion.div
            className="absolute left-[21%] top-[52%] h-20 w-12 rounded-lg border-4 border-slate-300 bg-white shadow-sm"
            animate={{ rotate: [-8, 0, -8] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="mx-auto mt-6 h-3 w-3 rounded-full bg-emerald-500" />
          </motion.div>

          <motion.div
            className="absolute left-[42%] top-[46%] h-24 w-14 rounded-lg border-4 border-slate-300 bg-white shadow-sm"
            animate={{ rotate: [12, 0, 12] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="mx-auto mt-6 h-3 w-3 rounded-full bg-red-500" />
          </motion.div>

          <motion.div
            className="absolute right-[19%] top-[52%] h-20 w-12 rounded-lg border-4 border-slate-300 bg-white shadow-sm"
            animate={{ rotate: [0, 8, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="mx-auto mt-6 h-3 w-3 rounded-full bg-amber-500" />
          </motion.div>

          <div className="absolute left-[18%] top-[35%] h-4 w-4 rounded-full bg-yellow-300 shadow-[0_0_20px_rgba(253,224,71,0.9)]" />
          <div className="absolute left-[43%] top-[28%] h-4 w-4 rounded-full bg-slate-300" />
          <div className="absolute right-[17%] top-[32%] h-4 w-4 rounded-full bg-amber-300" />

          <div className="absolute bottom-4 left-1/2 h-12 w-28 -translate-x-1/2 rounded-t-2xl border border-slate-300 bg-slate-100/90" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1">
          <Wifi className="h-4 w-4 text-emerald-500" /> Conectado
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1">
          <Home className="h-4 w-4 text-sky-500" /> 8 zonas monitoreadas
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1">
          <ShieldAlert className="h-4 w-4 text-amber-500" /> Evacuaci?n preparada
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1">
          <Zap className="h-4 w-4 text-red-500" /> 2 luces activas
        </span>
      </div>
    </div>
  )
}
