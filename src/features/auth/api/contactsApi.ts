import http from '../../../services/http'
import { env } from '../../../config/env'

export type EmergencyContact = {
  id: number | string
  fullName: string
  phoneNumber: string
  relationship: string
  notifyBySms: boolean
  priority: number
}

export type CreateEmergencyContact = Omit<EmergencyContact, 'id'>

const mockContacts: EmergencyContact[] = []

export async function getEmergencyContacts() {
  if (env.useMocks) return { contacts: mockContacts }

  // API: GET /users/emergency-contacts
  const { data } = await http.get<{ contacts: EmergencyContact[] }>('/api/v1/users/emergency-contacts')
  return data
}

export async function createEmergencyContact(contact: CreateEmergencyContact) {
  if (env.useMocks) {
    const created = { ...contact, id: `mock-${Date.now()}` }
    mockContacts.push(created)
    return created
  }

  // API: POST /users/emergency-contacts
  const { data } = await http.post<EmergencyContact>('/api/v1/users/emergency-contacts', contact)
  return data
}