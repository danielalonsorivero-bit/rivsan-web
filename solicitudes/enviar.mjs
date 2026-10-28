// POST /api/solicitud/: recibe el formulario de solicitud y envía con Resend la confirmación
// al cliente y el aviso interno. No guarda nada: el buzón de SOLICITUDES_PARA hace de registro.
//
// Variables de entorno:
//   RESEND_API_KEY    clave de Resend (solo permiso de envío)
//   SOLICITUDES_PARA  buzón que recibe los avisos internos
//   SOLICITUDES_DE    remitente; sin él, el de pruebas de Resend (onboarding@resend.dev)
// Modo demo: con el remitente de pruebas, Resend solo entrega al email de la propia cuenta,
// así que la confirmación al cliente también va a SOLICITUDES_PARA (con una franja «DEMO»).
// Con un dominio verificado en SOLICITUDES_DE, la confirmación va al email del cliente.
import { correoCliente, correoInterno } from './correo.mjs';

const REMITENTE_PRUEBAS = 'RIVSAN <onboarding@resend.dev>';
const LARGO = { nombre: 120, cargo: 120, unidad: 160, email: 160, telefono: 40, interes: 120, curso: 160, convocatoria: 120, agentes: 6, fecha: 10, mensaje: 3000, pagina: 300 };

const ES_EMAIL = /^[^\s@<>",;']+@[^\s@<>",;']+\.[^\s@<>",;']+$/;
// Al pegar valores en Vercel es fácil que se cuelen espacios, comillas o «Nombre <email>»: se queda solo la dirección
const extraerEmail = (v) => String(v ?? '').match(new RegExp(ES_EMAIL.source.slice(1, -1)))?.[0] ?? '';

export function configSolicitudes(env) {
  const de = String(env.SOLICITUDES_DE ?? '').trim() || REMITENTE_PRUEBAS;
  const para = extraerEmail(env.SOLICITUDES_PARA);
  return {
    clave: String(env.RESEND_API_KEY ?? '').trim(),
    para,
    paraMal: !para && !!String(env.SOLICITUDES_PARA ?? '').trim(),
    de,
    demo: de.includes('@resend.dev'),
    api: env.RESEND_API_URL || 'https://api.resend.com',
  };
}

// Límite por IP (en memoria: aguanta mientras viva la instancia de la función, suficiente contra un bot torpe)
const recientes = new Map();
function demasiadas(ip) {
  const ahora = Date.now();
  const lista = (recientes.get(ip) || []).filter((t) => ahora - t < 10 * 60_000);
  lista.push(ahora);
  recientes.set(ip, lista);
  return lista.length > 5;
}

const json = (status, obj) => ({ status, headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(obj) });

export function validar(datos) {
  const d = {};
  for (const [k, max] of Object.entries(LARGO)) d[k] = String(datos?.[k] ?? '').trim().slice(0, max);
  d.email = d.email.toLowerCase();
  if (d.fecha && !/^\d{4}-\d{2}-\d{2}$/.test(d.fecha)) d.fecha = '';
  if (d.agentes && !/^\d+$/.test(d.agentes)) d.agentes = '';
  const errores = [];
  for (const k of ['nombre', 'cargo', 'unidad']) if (!d[k]) errores.push(k);
  if (!ES_EMAIL.test(d.email)) errores.push('email');
  if (datos?.privacidad !== true) errores.push('privacidad');
  return { d, errores };
}

const referencia = () => {
  const f = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  return `RS-${f}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
};

// peticion: { metodo, url (URL), cabecera(n), ip, leerTexto() }; contexto: { config, empresa }
export async function responderSolicitud(peticion, { config, empresa }) {
  if (peticion.metodo !== 'POST') return json(405, { error: 'Método no permitido' });
  // Solo desde la propia web (el navegador manda Origin en los POST)
  const origen = peticion.cabecera('origin');
  if (origen && URL.parse(origen)?.host !== peticion.url.host) return json(403, { error: 'Origen no permitido' });
  if (config.paraMal) console.error('SOLICITUDES_PARA no es un email válido: revisa el valor en Vercel (solo la dirección, sin comillas ni nombre)');
  if (!config.clave || !config.para) return json(503, { error: 'El envío no está configurado' });

  let datos;
  try {
    datos = JSON.parse(await peticion.leerTexto());
  } catch {
    return json(400, { error: 'Datos no válidos' });
  }
  // Trampas para bots: campo oculto relleno o envío en menos de 3 s. Se responde «ok» sin enviar.
  if (datos.web || (typeof datos.t === 'number' && datos.t < 3000)) return json(200, { ok: true });
  if (demasiadas(peticion.ip || 'sin-ip')) return json(429, { error: 'Demasiadas solicitudes. Inténtalo en unos minutos.' });

  const { d, errores } = validar(datos);
  if (errores.length) return json(422, { error: 'Revisa los campos marcados.', campos: errores });

  const ctx = { empresa, origen: peticion.url.origin, ref: referencia(), demo: config.demo };
  const cliente = correoCliente(d, ctx);
  const interno = correoInterno(d, ctx);
  const res = await fetch(`${config.api}/emails/batch`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.clave}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([
      { from: config.de, to: [config.demo ? config.para : d.email], reply_to: config.para, subject: cliente.asunto, html: cliente.html, text: cliente.texto },
      { from: config.de, to: [config.para], reply_to: d.email, subject: interno.asunto, html: interno.html, text: interno.texto },
    ]),
  }).catch((e) => ({ ok: false, status: 0, text: async () => String(e) }));
  if (!res.ok) {
    console.error(`Resend respondió ${res.status}: ${await res.text()}`);
    return json(502, { error: 'No se ha podido enviar' });
  }
  return json(200, { ok: true, ref: ctx.ref });
}
