/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'voke-dark': '#0F172A',   // El azul noche de la barra de Voke
        'voke-cyan': '#06B6D4',   // El cian eléctrico de los estados
        'voke-light': '#F8FAFC',  // El fondo gris claro de las tarjetas
        'voke-text': '#334155'    // Gris pizarra para descripciones
      }
    },
  },
  plugins: [],
}