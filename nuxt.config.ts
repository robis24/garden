// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/styles/main.scss'],
  runtimeConfig: {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
    GITHUB_OWNER: process.env.GITHUB_OWNER || '',
    GITHUB_REPO: process.env.GITHUB_REPO || 'garden',
    GITHUB_BRANCH: process.env.GITHUB_BRANCH || 'main',
    GARDEN_API_KEY: process.env.GARDEN_API_KEY || ''
  },
  nitro: {
    storage: {
      data: {
        driver: 'fs',
        base: './content'
      }
    }
  }
})
