// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import admin from './admin/integration.mjs';

export default defineConfig({
  site: 'https://rivsan.es',
  trailingSlash: 'always',
  // admin() solo actúa con `npm run dev` (panel en /admin/)
  integrations: [sitemap(), admin()],
});
