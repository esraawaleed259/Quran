import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ⚠️ مهم: "Quran" لازم تكون هي نفس اسم الريبو بالضبط على GitHub
export default defineConfig({
  plugins: [react()],
  base: '/Quran/',
})
