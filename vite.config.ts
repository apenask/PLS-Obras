import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Adicione este bloco para o servidor de desenvolvimento
  server: {
    watch: {
      // Ignora a pasta de build do Rust
      ignored: ["**/src-tauri/target/**"],
    },
  },
})