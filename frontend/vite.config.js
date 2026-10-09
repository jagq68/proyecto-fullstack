import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev
export default defineConfig(({ command }) => {
  return {
    plugins: [react()],
    
    /* 🚀 ENTORNO INTELIGENTE AUTOMÁTICO:
       Si estás ejecutando localmente (command === 'serve'), la base queda vacía '/' para localhost:5173.
       Si estás ejecutando la subida (npm run deploy / command === 'build'), inyecta la ruta para GitHub Pages. */
    base: command === 'build' ? '/proyecto-fullstack/' : '/',
  }
})

// import react from '@vitejs/plugin-react'
// import { defineConfig } from 'vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   base: '/proyecto-fullstack/', 
// })
