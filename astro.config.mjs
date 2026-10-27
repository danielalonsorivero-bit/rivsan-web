// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import admin from './admin/integration.mjs';
import baseLinks from './integrations/base-links.mjs';

// SITE_URL y BASE_PATH permiten publicar la versión de muestra en GitHub Pages
// (https://danielalonsorivero-bit.github.io/rivsan-web/). Sin ellas: dominio propio en la raíz.
export default defineConfig({
  site: process.env.SITE_URL || 'https://rivsan.es',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'always',
  // admin(): panel en /admin/ solo con `npm run dev`; demo pública en /panel-demo/ (fuera del sitemap)
  integrations: [sitemap({ filter: (page) => !page.includes('/panel-demo/') }), admin(), baseLinks()],
});
