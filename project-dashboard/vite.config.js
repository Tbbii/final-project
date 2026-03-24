import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/air4thai': {
        target: 'http://air4thai.pcd.go.th',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/air4thai/, '')
      }
      // ตัด openaq ออก
    }
  }
})