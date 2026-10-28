// /api/solicitud/ como función de servidor (Vercel). Ver solicitudes/integration.mjs.
import empresa from '../src/data/empresa.json';
import { configSolicitudes, responderSolicitud } from './enviar.mjs';

export const prerender = false;

export async function ALL({ request, url, clientAddress }) {
  // Dentro de la función, `url` no siempre lleva el dominio público: se reconstruye con el que reenvía Vercel
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const publica = host ? new URL(url.pathname, `${request.headers.get('x-forwarded-proto') || 'https'}://${host}`) : url;
  const r = await responderSolicitud(
    {
      metodo: request.method,
      url: publica,
      cabecera: (n) => request.headers.get(n),
      ip: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || clientAddress,
      leerTexto: () => request.text(),
    },
    { config: configSolicitudes(process.env), empresa },
  );
  return new Response(r.body, { status: r.status, headers: r.headers });
}
