import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import type { ReactNode } from 'react'

import { I18nProvider } from '../i18n/I18nProvider'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
})

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster richColors closeButton position="top-right" />
        {children}
      </QueryClientProvider>
    </I18nProvider>
  )
}
