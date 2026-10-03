/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => {
  const variables = loadEnv(mode, process.cwd(), '')
  const apiUrl = variables.VITE_API_URL || 'http://localhost:8080'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/setupTests.ts',
    },
  }
})
