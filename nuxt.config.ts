import tailwindcss from '@tailwindcss/vite'
import pkg from './package.json'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/css/index.css'],
  modules: ['@nuxt/eslint', '@vueuse/nuxt'],
  runtimeConfig: {
    public: {
      repo: pkg.repository.url
    }
  },
  typescript: {
    typeCheck: 'build'
  },
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://rsms.me' },
        { rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css' }
      ]
    }
  },
  vite: {
    plugins: [tailwindcss()]
  },
  imports: {
    presets: [
      {
        from: 'vue-sonner',
        imports: ['toast']
      }
    ]
  }
})
