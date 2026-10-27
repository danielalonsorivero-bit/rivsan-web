// Panel de administración local. Solo existe con `npm run dev`: añade la página /admin/
// y una pequeña API que lee y escribe los ficheros de contenido del proyecto.
// Nunca entra en `npm run build`, así que no se publica.
// Aparte, /panel-demo/ (dev y build) es una demostración del mismo panel con datos simulados
// en el navegador: no escribe nada y sirve para enseñarlo en la versión de muestra.
import { createApi } from './api.mjs';

export default function admin() {
  return {
    name: 'rivsan-admin',
    hooks: {
      'astro:config:setup': ({ command, config, injectRoute, updateConfig, logger }) => {
        injectRoute({ pattern: '/panel-demo', entrypoint: new URL('./pages/demo.astro', import.meta.url) });
        if (command !== 'dev') return;
        const root = new URL('.', config.root);
        injectRoute({ pattern: '/admin', entrypoint: new URL('./pages/index.astro', import.meta.url) });
        updateConfig({
          vite: {
            plugins: [
              {
                name: 'rivsan-admin-api',
                configureServer(server) {
                  // Al principio de la cola, antes del enrutador de Astro. Las rutas de la API
                  // acaban en «/» (trailingSlash: 'always'), si no Astro responde 404 antes.
                  server.middlewares.stack.unshift({ route: '/admin/api', handle: createApi(root) });
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
