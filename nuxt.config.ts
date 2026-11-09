// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  app: {
    baseURL: '/YOUMANS/'
  },
  nitro: {
    preset: 'github-pages',
    prerender: {
		routes: [
      '/',
      '/store',
      '/store/catalog',
      '/store/product',
      '/store/cart',
      '/store/favorites',
      '/store/login',
      '/store/account',
      '/store/admin'
		]}
  },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
		public: {
			supabaseUrl: '',
			supabaseKey: ''
		}
  },
})
