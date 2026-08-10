export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  typescript: { strict: true, typeCheck: true },
  runtimeConfig: {
    mssqlServer: process.env.MSSQL_SERVER,
    mssqlDatabase: process.env.MSSQL_DATABASE || 'arvl',
    mssqlUser: process.env.MSSQL_USER,
    mssqlPassword: process.env.MSSQL_PASSWORD,
    mssqlPort: process.env.MSSQL_PORT || '1433',
    mssqlEncrypt: process.env.MSSQL_ENCRYPT || 'false',
    authSecret: process.env.NUXT_AUTH_SECRET || 'replace-this-secret-in-production',
    public: { appName: 'AR CreditInvoice Dashboard' }
  },
  app: {
    head: {
      title: 'AR CreditInvoice Dashboard',
      meta: [{ name: 'description', content: 'ระบบภาพรวมและรายละเอียด CreditInvoice' }],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap' }
      ]
    }
  }
})
