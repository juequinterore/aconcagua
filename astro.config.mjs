import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://aconcagua.co',
  redirects: {
    '/globalrescue': 'https://partner.globalrescue.com/juliankusi/index.html',
    '/pire': 'https://www.pireaconcagua.com.ar/es/',
    '/en/pire': 'https://www.pireaconcagua.com.ar/en/',
  },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en', 'zh'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: { es: 'es-AR', en: 'en-US', zh: 'zh-CN' },
      },
      filter: (page) => !page.includes('/404'),
    }),
  ],
  vite: {
    build: {
      rollupOptions: {
        // Ensure proper static output
      },
    },
  },
});
