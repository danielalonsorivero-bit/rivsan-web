// Publicación en una subcarpeta (p. ej. GitHub Pages en /rivsan-web/).
// Las plantillas enlazan desde la raíz («/simulador/»); al compilar con `base`,
// este paso antepone la subcarpeta a esos enlaces en el HTML generado.
// Sin `base` (dominio propio o `npm run dev`) no hace nada.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(path);
    else if (entry.name.endsWith('.html')) yield path;
  }
}

export default function baseLinks() {
  let base = '/';
  return {
    name: 'rivsan-base-links',
    hooks: {
      'astro:config:done': ({ config }) => {
        base = config.base.endsWith('/') ? config.base : `${config.base}/`;
      },
      'astro:build:done': async ({ dir, logger }) => {
        if (base === '/') return;
        // href="/x", src="/x" o action="/x", pero no «//cdn…» ni lo que ya lleva la subcarpeta
        const attr = new RegExp(`\\b(href|src|action)="/(?!/|${base.slice(1)})`, 'g');
        let count = 0;
        for await (const file of htmlFiles(fileURLToPath(dir))) {
          const html = await readFile(file, 'utf8');
          const out = html.replace(attr, (_, name) => `${name}="${base}`);
          if (out !== html) {
            count++;
            await writeFile(file, out);
          }
        }
        logger.info(`Enlaces adaptados a ${base} en ${count} páginas`);
      },
    },
  };
}
