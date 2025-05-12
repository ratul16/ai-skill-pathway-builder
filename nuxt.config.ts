import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  components: true,
  modules: ['@nuxt/eslint', '@pinia/nuxt'],

  css: ['~/assets/main.css',
    '@vue-flow/core/dist/style.css',
    '@vue-flow/core/dist/theme-default.css',
    '@vue-flow/minimap/dist/style.css',
    '@vue-flow/controls/dist/style.css'
  ],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  runtimeConfig: {
    // Update to match your LLM server URL
    public: {
      llmBaseURL: process.env.LLM_BASE_URL || 'http://localhost:1234/v1'
    }
  },

  build: {
    transpile: ['vue-force-graph']
  },
})