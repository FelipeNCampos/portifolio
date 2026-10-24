import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_BASE_PATH')
  return {
    base: env.VITE_BASE_PATH || (mode === 'production' ? '/portifolio/' : '/'),
    server: { port: 4173 },
  }
})
