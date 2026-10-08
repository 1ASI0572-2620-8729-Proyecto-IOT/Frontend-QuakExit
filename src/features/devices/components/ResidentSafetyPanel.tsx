import { Battery, Phone, Plus, ShieldAlert } from 'lucide-react'
import { useState } from 'react'

import { useCreateEmergencyContact, useEmergencyContacts } from '../../auth/hooks/useEmergencyContacts'
import { useBatteryStatus } from '../hooks/useBatteryStatus'
import { ApiError } from '../../../types/api-error'

const phonePattern = /^\+[1-9]\d{7,14}$/
const phoneCodes = [
  ['+51', 'Perú'], ['+54', 'Argentina'], ['+55', 'Brasil'], ['+56', 'Chile'],
  ['+57', 'Colombia'], ['+58', 'Venezuela'], ['+591', 'Bolivia'], ['+593', 'Ecuador'],
  ['+595', 'Paraguay'], ['+598', 'Uruguay'], ['+1', 'Estados Unidos / Canadá'],
  ['+52', 'México'], ['+34', 'España'], ['+44', 'Reino Unido'],
] as const

export function ResidentSafetyPanel() {
  const { data: batteries = [], isLoading, isError: batteriesError } = useBatteryStatus()
  const { data: contactData, isLoading: contactsLoading, isError: contactsError } = useEmergencyContacts()
  const createContact = useCreateEmergencyContact()
  const contacts = contactData?.contacts ?? []
  const [name, setName] = useState('')
  const [phoneCode, setPhoneCode] = useState('+51')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [relationship, setRelationship] = useState('')
  const [notifyBySms, setNotifyBySms] = useState(true)
  const [contactError, setContactError] = useState('')
  const hasAlert = batteries.some((battery) => battery.status !== 'OK')

  const addContact = async () => {
    if (contacts.length >= 5) return setContactError('Puedes guardar hasta 5 contactos.')
    const phone = `${phoneCode}${phoneNumber.replace(/\D/g, '')}`
    if (!name.trim() || !phonePattern.test(phone)) return setContactError('Ingresa nombre y un teléfono válido de entre 8 y 15 dígitos.')
    try {
      await createContact.mutateAsync({ fullName: name.trim(), phoneNumber: phone, relationship: relationship.trim(), notifyBySms, priority: contacts.length + 1 })
      setName('')
      setPhoneNumber('')
      setRelationship('')
      setNotifyBySms(true)
      setContactError('')
    } catch (error) {
      setContactError(error instanceof ApiError ? error.message : 'No se pudo guardar el contacto.')
    }
  }

  return <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]" aria-label="Seguridad del residente">
    <div className="rounded-2xl border border-line bg-panel p-5">
      <div className="flex items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.2em] text-amber">Estado del hogar</p><h2 className="mt-1 text-lg font-semibold text-white">Baterías de QuakExit Hub</h2></div><Battery className={`h-6 w-6 ${hasAlert ? 'text-warning' : 'text-success'}`} aria-hidden="true" /></div>
      {hasAlert && <div className="mt-4 flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-amber"><ShieldAlert className="h-4 w-4" />Hay dispositivos que requieren atención.</div>}
      {batteriesError ? <p className="mt-4 text-sm text-slate-400">No se pudo consultar el estado de las baterías todavía.</p> : <div className="mt-4 grid gap-3 sm:grid-cols-3">{isLoading ? [1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-xl bg-panelMuted" />) : batteries.map((battery) => <div key={battery.deviceId} className="rounded-xl border border-line bg-canvas p-3"><div className="flex items-center justify-between text-sm"><span className="text-slate-300">{battery.alias ?? battery.deviceCode ?? `Dispositivo ${battery.deviceId}`}</span><span className={battery.status === 'CRITICAL' ? 'text-danger' : battery.status === 'LOW' ? 'text-warning' : 'text-success'}>{battery.level}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-panelMuted"><div className={`h-full ${battery.status === 'CRITICAL' ? 'bg-danger' : battery.status === 'LOW' ? 'bg-warning' : 'bg-success'}`} style={{ width: `${battery.level}%` }} /></div><p className="mt-2 text-xs text-slate-500">{battery.status}</p></div>)}</div>}
    </div>
    <div className="rounded-2xl border border-line bg-panel p-5">
      <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.2em] text-amber">Red de apoyo</p><h2 className="mt-1 text-lg font-semibold text-white">Contactos de emergencia</h2></div><Phone className="h-5 w-5 text-success" aria-hidden="true" /></div>
      {contactsError ? <p className="mt-4 text-sm text-slate-400">No se pudieron cargar los contactos de emergencia.</p> : <>
        <p className="mt-3 text-xs text-slate-500">Se guardan hasta 5 contactos. El teléfono se envía en formato internacional.</p>
        <div className="mt-4 space-y-2">{contactsLoading ? <p className="text-sm text-slate-400">Cargando contactos...</p> : contacts.length === 0 ? <p className="text-sm text-slate-400">Todavía no tienes contactos registrados.</p> : contacts.map((contact) => <div key={contact.id} className="rounded-xl bg-canvas p-3 text-sm"><div className="flex items-center justify-between gap-2"><span className="text-slate-200">{contact.fullName}<span className="ml-2 text-slate-500">{contact.phoneNumber}</span></span><span className="text-xs text-slate-500">{contact.notifyBySms ? 'SMS activo' : 'SMS inactivo'}</span></div>{contact.relationship && <p className="mt-1 text-xs text-slate-500">{contact.relationship}</p>}</div>)}</div>
        <div className="mt-4 grid gap-2">
          <label className="text-xs text-slate-400">Nombre<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. María Pérez" className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-white focus:border-amber focus:outline-none" /></label>
          <label className="text-xs text-slate-400">Teléfono<div className="mt-1 flex"><select value={phoneCode} onChange={(event) => setPhoneCode(event.target.value)} className="rounded-l-lg border border-line bg-canvas px-2 py-2 text-sm text-white focus:border-amber focus:outline-none" aria-label="Código telefónico">{phoneCodes.map(([code, country]) => <option key={code} value={code}>{code} ({country})</option>)}</select><input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value.replace(/\D/g, ''))} placeholder="987654321" type="tel" inputMode="numeric" className="min-w-0 flex-1 rounded-r-lg border border-l-0 border-line bg-canvas px-3 py-2 text-sm text-white focus:border-amber focus:outline-none" /></div></label>
          <label className="text-xs text-slate-400">Relación (opcional)<input value={relationship} onChange={(event) => setRelationship(event.target.value)} placeholder="Ej. Madre, vecino" className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-white focus:border-amber focus:outline-none" /></label>
          <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={notifyBySms} onChange={(event) => setNotifyBySms(event.target.checked)} className="accent-amber" />Recibir notificaciones por SMS</label>
          <button type="button" onClick={() => void addContact()} disabled={createContact.isPending || contacts.length >= 5} className="inline-flex items-center justify-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-slate-300 hover:border-amber hover:text-amber disabled:opacity-50"><Plus className="h-4 w-4" />{createContact.isPending ? 'Guardando...' : 'Añadir contacto'}</button>
          {contactError && <p className="text-xs text-red-300" role="alert">{contactError}</p>}
        </div>
      </>}
    </div>
  </section>
}
