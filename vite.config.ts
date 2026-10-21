import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    plugins: [react(), tailwindcss()],
    base: env.VITE_BASE_PATH || '/',
  }
})
