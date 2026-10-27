import type { APIRoute } from 'astro';
import { indexable } from '../data/seo';

export const GET: APIRoute = ({ site }) => {
  const body = indexable
    ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site)}\n`
    : // Mientras la web no esté publicada, que ningún buscador la rastree
      `User-agent: *\nDisallow: /\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
