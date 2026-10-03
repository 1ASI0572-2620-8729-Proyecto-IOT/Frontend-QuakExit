const localApiUrl = 'http://localhost:8080'

export const env = {
  apiUrl: import.meta.env.VITE_API_URL || localApiUrl,
  // Mocks are the safe development default; set VITE_USE_MOCKS=false for the backend.
  useMocks: import.meta.env.VITE_USE_MOCKS !== 'false',
} as const
