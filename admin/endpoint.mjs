// /admin/api/* como función de servidor (Vercel). Ver admin/integration.mjs.
import { pathToFileURL } from 'node:url';
import { configPanel, responder } from './api.mjs';

export const prerender = false;

export async function ALL({ request, url }) {
  const r = await responder(
    {
      metodo: request.method,
      ruta: url.pathname.replace(/^\/admin\/api/, '') + url.search,
      cabecera: (n) => request.headers.get(n),
      leerTexto: () => request.text(),
    },
    configPanel(process.env, pathToFileURL(process.cwd() + '/')),
  );
  return new Response(r.body, { status: r.status, headers: r.headers });
}
