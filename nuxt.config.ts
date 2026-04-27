// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/styles/main.scss'],
  runtimeConfig: {
    GITHUB_TOKEN: '',
    GITHUB_OWNER: '',
    GITHUB_REPO: 'garden',
    GITHUB_BRANCH: 'main',
    GARDEN_API_KEY: ''
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
