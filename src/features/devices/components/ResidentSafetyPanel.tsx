import { Battery, Phone, Plus, ShieldAlert } from 'lucide-react'
import { useState } from 'react'

import { useCreateEmergencyContact, useEmergencyContacts } from '../../auth/hooks/useEmergencyContacts'
import { useBatteryStatus } from '../hooks/useBatteryStatus'

const phonePattern = /^\+[1-9]\d{7,14}$/

export function ResidentSafetyPanel() {
  const { data: batteries = [], isLoading } = useBatteryStatus()
  const { data: contactData } = useEmergencyContacts()
  const createContact = useCreateEmergencyContact()
  const contacts = contactData?.contacts ?? []
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [contactError, setContactError] = useState('')
  const hasAlert = batteries.some((battery) => battery.status !== 'OK')

  const addContact = async () => {
    if (contacts.length >= 5) return setContactError('Puedes guardar hasta 5 contactos.')
    if (!name.trim() || !phonePattern.test(phone)) return setContactError('Ingresa nombre y un teléfono E.164 válido.')
    try {
      await createContact.mutateAsync({ fullName: name.trim(), phoneNumber: phone, relationship: 'Contacto', notifyBySms: true, priority: contacts.length + 1 })
      setName('')
      setPhone('')
      setContactError('')
    } catch {
      setContactError('No se pudo guardar el contacto.')
    }
  }

  return <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]" aria-label="Seguridad del residente">
    <div className="rounded-2xl border border-line bg-panel p-5">
      <div className="flex items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.2em] text-amber">Estado del hogar</p><h2 className="mt-1 text-lg font-semibold text-white">Baterías de QuakExit Hub</h2></div><Battery className={`h-6 w-6 ${hasAlert ? 'text-warning' : 'text-success'}`} aria-hidden="true" /></div>
      {hasAlert && <div className="mt-4 flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-amber"><ShieldAlert className="h-4 w-4" />Hay dispositivos que requieren atención.</div>}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">{isLoading ? [1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-xl bg-panelMuted" />) : batteries.map((battery) => <div key={battery.deviceId} className="rounded-xl border border-line bg-canvas p-3"><div className="flex items-center justify-between text-sm"><span className="text-slate-300">{battery.alias ?? battery.deviceCode ?? `Dispositivo ${battery.deviceId}`}</span><span className={battery.status === 'CRITICAL' ? 'text-danger' : battery.status === 'LOW' ? 'text-warning' : 'text-success'}>{battery.level}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-panelMuted"><div className={`h-full ${battery.status === 'CRITICAL' ? 'bg-danger' : battery.status === 'LOW' ? 'bg-warning' : 'bg-success'}`} style={{ width: `${battery.level}%` }} /></div><p className="mt-2 text-xs text-slate-500">{battery.status}</p></div>)}</div>
    </div>
    <div className="rounded-2xl border border-line bg-panel p-5"><div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.2em] text-amber">Red de apoyo</p><h2 className="mt-1 text-lg font-semibold text-white">Contactos de emergencia</h2></div><Phone className="h-5 w-5 text-success" aria-hidden="true" /></div><div className="mt-4 space-y-2">{contacts.map((contact) => <div key={contact.id} className="rounded-xl bg-canvas p-3 text-sm"><span className="text-slate-200">{contact.fullName}<span className="ml-2 text-slate-500">{contact.phoneNumber}</span></span></div>)}</div><div className="mt-4 grid gap-2"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre" className="rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-white focus:border-amber focus:outline-none" /><input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+51987654321" type="tel" className="rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-white focus:border-amber focus:outline-none" /><button type="button" onClick={() => void addContact()} disabled={createContact.isPending} className="inline-flex items-center justify-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-slate-300 hover:border-amber hover:text-amber disabled:opacity-50"><Plus className="h-4 w-4" />{createContact.isPending ? 'Guardando...' : 'Añadir contacto'}</button>{contactError && <p className="text-xs text-red-300" role="alert">{contactError}</p>}</div></div>
  </section>
}
