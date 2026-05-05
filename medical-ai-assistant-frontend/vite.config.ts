import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Εδώ είναι το κλειδί!

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Πρέπει να προστεθεί εδώ
  ],
})