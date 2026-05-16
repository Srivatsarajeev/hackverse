import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
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
      },
    },
  },
})
