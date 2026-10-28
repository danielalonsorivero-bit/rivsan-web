// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import admin from './admin/integration.mjs';
import solicitudes from './solicitudes/integration.mjs';
import baseLinks from './integrations/base-links.mjs';

// En Vercel (o con ADMIN_SERVIDOR=1) se activa el adaptador: la web sigue siendo estática,
// pero el panel /admin/ se publica con su API como función de servidor (ver admin/integration.mjs).
const servidor = !!process.env.VERCEL || process.env.ADMIN_SERVIDOR === '1';

// SITE_URL y BASE_PATH permiten publicar la versión de muestra en GitHub Pages
// (https://danielalonsorivero-bit.github.io/rivsan-web/). Sin ellas: dominio propio en la raíz.
export default defineConfig({
  site: process.env.SITE_URL || 'https://rivsan.es',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'always',
  adapter: servidor ? vercel() : undefined,
  // admin(): panel en /admin/ con `npm run dev` o en Vercel; demo pública en /panel-demo/ (ambos fuera del sitemap)
  integrations: [
    sitemap({ filter: (page) => !page.includes('/panel-demo/') && !page.includes('/admin/') }),
    admin({ servidor }),
    // solicitudes(): envío del formulario de solicitud con Resend en /api/solicitud/ (dev y Vercel)
    solicitudes({ servidor }),
    baseLinks(),
  ],
});
