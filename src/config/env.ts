const requiredEnv = ['VITE_API_URL'] as const

const missing = requiredEnv.filter((key) => !import.meta.env[key])

if (missing.length > 0) {
  // Vite exposes env vars at runtime; this guard keeps the app explicit.
  console.warn(`Missing environment variables: ${missing.join(', ')}`)
}

export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? '',
  // Mocks are the safe development default; set VITE_USE_MOCKS=false for the backend.
  useMocks: import.meta.env.VITE_USE_MOCKS !== 'false',
} as const
