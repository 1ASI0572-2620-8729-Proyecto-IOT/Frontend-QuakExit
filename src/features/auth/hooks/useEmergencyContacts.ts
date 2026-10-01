import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createEmergencyContact, getEmergencyContacts, type CreateEmergencyContact } from '../api/contactsApi'

export function useEmergencyContacts() {
  return useQuery({ queryKey: ['users', 'emergency-contacts'], queryFn: getEmergencyContacts })
}

export function useCreateEmergencyContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (contact: CreateEmergencyContact) => createEmergencyContact(contact),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users', 'emergency-contacts'] }),
  })
}