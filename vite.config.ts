import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  base: '/',
  plugins: [react(), tsconfigPaths()],
  server: {
    host: '10.90.25.125',
    port: 3002,
    proxy: {
      "/api": {
        target: "http://10.90.25.125:5000",
        changeOrigin: true,
      },
    },
  },
})
