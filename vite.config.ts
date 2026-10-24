import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'API_PROXY_')
  return {
  server: {
    port: 4173,
    proxy: { '/api': env.API_PROXY_TARGET || 'http://127.0.0.1:8000' },
  },
  }
})
