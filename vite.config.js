import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        mission: resolve(__dirname, 'mission.html'),
        districts: resolve(__dirname, 'districts.html'),
        bounty: resolve(__dirname, 'bounty.html'),
        timeline: resolve(__dirname, 'timeline.html'),
        command: resolve(__dirname, 'command.html'),
        faq: resolve(__dirname, 'faq.html'),
        register: resolve(__dirname, 'register.html'),
        'neo-tokyo-shadow-control': resolve(__dirname, 'neo-tokyo-shadow-control.html'),
      },
    },
  },
})
