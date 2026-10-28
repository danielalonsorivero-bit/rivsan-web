// Panel de administración en /admin/ y su API en /admin/api/ (ver api.mjs).
//   - `npm run dev`: la API es un middleware del servidor de desarrollo y escribe en los
//     archivos del proyecto (o en GitHub, si se arranca con GITHUB_TOKEN).
//   - Con `servidor` (compilación en Vercel, adaptador activo): la API es una función de
//     servidor que guarda cada cambio como un commit en GitHub, protegida con contraseña.
//   - En cualquier otra compilación (GitHub Pages) el panel no existe.
// Aparte, /panel-demo/ (dev y build) es una demostración del mismo panel con datos simulados
// en el navegador: no escribe nada y sirve para enseñarlo en la versión de muestra.
import { configPanel, responder } from './api.mjs';

export default function admin({ servidor = false } = {}) {
  return {
    name: 'rivsan-admin',
    hooks: {
      'astro:config:setup': ({ command, config, injectRoute, updateConfig, logger }) => {
        injectRoute({ pattern: '/panel-demo', entrypoint: new URL('./pages/demo.astro', import.meta.url) });
        if (!servidor && command !== 'dev') return;
        injectRoute({ pattern: '/admin', entrypoint: new URL('./pages/index.astro', import.meta.url) });
        if (servidor) {
          injectRoute({ pattern: '/admin/api/[...ruta]', entrypoint: new URL('./endpoint.mjs', import.meta.url), prerender: false });
          logger.info('Panel de administración en /admin/ (guarda en GitHub)');
          return;
        }
        const root = new URL('.', config.root);
        updateConfig({
          vite: {
            plugins: [
              {
                name: 'rivsan-admin-api',
                configureServer(server) {
                  // Al principio de la cola, antes del enrutador de Astro. Las rutas de la API
                  // acaban en «/» (trailingSlash: 'always'), si no Astro responde 404 antes.
                  server.middlewares.stack.unshift({ route: '/admin/api', handle: middleware(root) });
                },
              },
            ],
          },
        });
        logger.info('Panel de administración en /admin/');
      },
    },
  };
}

// Adapta la petición de Node (servidor de desarrollo) a responder().
function middleware(root) {
  return async (req, res) => {
    const r = await responder(
      {
        metodo: req.method,
        ruta: req.url,
        cabecera: (n) => req.headers[n.toLowerCase()],
        leerTexto: async () => {
          const chunks = [];
          for await (const c of req) chunks.push(c);
          return Buffer.concat(chunks).toString('utf8');
        },
      },
      configPanel(process.env, root),
    );
    res.writeHead(r.status, r.headers);
    res.end(r.body);
  };
}
