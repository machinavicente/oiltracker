import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Plugin de Tailwind v4 para Vite
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  // CSS global (aquí va el @import de Tailwind)
  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'OilTracker',
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css'
        }
      ]
    }
  },

  imports: {
    dirs: ['composables', 'types']
  }
})