// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://rivsan.es',
  trailingSlash: 'always',
  integrations: [sitemap()],
});
