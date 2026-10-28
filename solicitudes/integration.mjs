// Envío del formulario de solicitud en /api/solicitud/ (ver enviar.mjs).
//   - Con `servidor` (Vercel): función de servidor.
//   - `npm run dev`: middleware del servidor de desarrollo. Sin RESEND_API_KEY no envía nada,
//     y en /api/solicitud/vista/?tipo=cliente (o interno) se ven los correos con datos de ejemplo.
//   - En cualquier otra compilación (GitHub Pages) no existe y el formulario queda en modo maqueta.
import { readFile } from 'node:fs/promises';
import { correoCliente, correoInterno } from './correo.mjs';
import { configSolicitudes, responderSolicitud } from './enviar.mjs';

export default function solicitudes({ servidor = false } = {}) {
  return {
    name: 'rivsan-solicitudes',
    hooks: {
      'astro:config:setup': ({ command, config, injectRoute, updateConfig, logger }) => {
        if (servidor) {
          injectRoute({ pattern: '/api/solicitud', entrypoint: new URL('./endpoint.mjs', import.meta.url), prerender: false });
          return;
        }
        if (command !== 'dev') return;
        const empresaUrl = new URL('src/data/empresa.json', config.root);
        updateConfig({
          vite: {
            plugins: [
              {
                name: 'rivsan-solicitudes-api',
                configureServer(server) {
                  server.middlewares.stack.unshift({ route: '/api/solicitud', handle: middleware(empresaUrl, logger) });
                },
              },
            ],
          },
        });
      },
    },
  };
}

const EJEMPLO = {
  nombre: 'Javier Morales Ruiz',
  cargo: 'Intendente, jefe de formación',
  unidad: 'Policía Local de Dos Hermanas',
  email: 'jmorales@ejemplo.es',
  telefono: '+34 600 000 000',
  interes: 'Demostración operativa del simulador',
  agentes: '40',
  fecha: '2026-11-18',
  mensaje: 'Disponemos de un gimnasio de unos 120 m².\nNos interesa ver escenarios de violencia de género y tirador activo.',
};

function middleware(empresaUrl, logger) {
  return async (req, res) => {
    const empresa = JSON.parse(await readFile(empresaUrl, 'utf8'));
    const url = new URL(req.url === '/' ? '/api/solicitud/' : `/api/solicitud${req.url}`, `http://${req.headers.host}`);
    if (url.pathname === '/api/solicitud/vista/') {
      const ctx = { empresa, origen: url.origin, ref: 'RS-261028-DEMO', demo: url.searchParams.get('demo') !== '0' };
      const c = (url.searchParams.get('tipo') === 'interno' ? correoInterno : correoCliente)(EJEMPLO, ctx);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(c.html);
    }
    const config = configSolicitudes(process.env);
    let r;
    if (!config.clave) {
      // Sin clave en local no se envía nada (para probar el envío real, arranca con RESEND_API_KEY y SOLICITUDES_PARA)
      logger.info('Solicitud recibida (sin RESEND_API_KEY: no se envía). Vista: /api/solicitud/vista/');
      r = { status: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true, local: true }) };
    } else {
      r = await responderSolicitud(
        {
          metodo: req.method,
          url,
          cabecera: (n) => req.headers[n.toLowerCase()],
          ip: req.socket.remoteAddress,
          leerTexto: async () => {
            const chunks = [];
            for await (const ch of req) chunks.push(ch);
            return Buffer.concat(chunks).toString('utf8');
          },
        },
        { config, empresa },
      );
    }
    res.writeHead(r.status, r.headers);
    res.end(r.body);
  };
}
