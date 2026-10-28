// Plantillas de los correos de una solicitud: confirmación al cliente y aviso interno.
// HTML de correo: tablas, estilos en línea y nada de SVG (Gmail no lo muestra). Bebas Neue solo
// carga en algunos clientes (Apple Mail, iOS); el resto cae en Impact / Arial Narrow.
// `demo`: el remitente es el de pruebas de Resend y todo llega al buzón propio; la confirmación
// lleva una franja que dice a quién le llegaría.

const C = {
  fondo: '#0b0b0b',
  tarjeta: '#151515',
  caja: '#1d1d1d',
  linea: '#2c2c2c',
  texto: '#f2f2f0',
  suave: '#a3a39c',
  amarillo: '#f7c400',
  negro: '#231f20',
};
const DISPLAY = "'Bebas Neue', Impact, 'Arial Narrow', sans-serif";
const CUERPO = "'Barlow', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = "'IBM Plex Mono', 'SF Mono', Menlo, Consolas, monospace";

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const fechaLarga = (iso) => {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d)).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
};

// Filas del resumen, en el orden del formulario y solo las que tienen valor
export function filas(d) {
  return [
    ['Nombre', d.nombre],
    ['Cargo', d.cargo],
    ['Jefatura / Unidad', d.unidad],
    ['Email', d.email],
    ['Teléfono', d.telefono],
    [d.curso ? 'Curso' : 'Interés', d.curso || d.interes],
    ['Convocatoria', d.convocatoria],
    [d.curso ? 'Plazas' : 'Agentes a formar', d.agentes],
    ['Fecha preferente', d.fecha && fechaLarga(d.fecha)],
    ['Mensaje', d.mensaje],
  ].filter(([, v]) => v);
}

function marco({ preheader, demo, contenido, pie }) {
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;600&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet">
<title>RIVSAN</title></head>
<body style="margin:0;padding:0;background:${C.fondo};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.fondo};">
<tr><td align="center" style="padding:32px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">
${demo ? `<tr><td style="padding:10px 16px;border:1px dashed ${C.amarillo};font:500 11px/1.5 ${MONO};letter-spacing:1.5px;color:${C.amarillo};text-transform:uppercase;">${demo}</td></tr><tr><td height="12"></td></tr>` : ''}
<tr><td style="background:${C.tarjeta};border-top:4px solid ${C.amarillo};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:28px 36px 0;">
<span style="font:400 34px/1 ${DISPLAY};letter-spacing:2px;color:${C.texto};">RIV<span style="color:${C.amarillo};">SAN</span></span><br>
<span style="font:600 10px/1.8 ${CUERPO};letter-spacing:3px;color:${C.suave};text-transform:uppercase;">Formación táctica inmersiva</span>
</td></tr>
${contenido}
</table>
</td></tr>
<tr><td style="padding:24px 8px 0;font:400 12px/1.6 ${CUERPO};color:#77776f;">${pie}</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

const eyebrow = (t) =>
  `<p style="margin:0 0 14px;font:500 11px/1.4 ${MONO};letter-spacing:2px;color:${C.amarillo};text-transform:uppercase;">&#8212;&#8212; ${t}</p>`;

const tablaResumen = (d) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.caja};border:1px solid ${C.linea};">
${filas(d)
  .map(
    ([k, v], i) => `<tr><td style="padding:12px 18px;${i ? `border-top:1px solid ${C.linea};` : ''}">
<span style="font:500 10px/1.4 ${MONO};letter-spacing:1.5px;color:${C.suave};text-transform:uppercase;">${esc(k)}</span><br>
<span style="font:400 15px/1.5 ${CUERPO};color:${C.texto};">${esc(v).replace(/\n/g, '<br>')}</span></td></tr>`,
  )
  .join('')}
</table>`;

const boton = (href, texto) =>
  `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:${C.amarillo};">
<a href="${esc(href)}" style="display:inline-block;padding:15px 26px;font:600 13px/1 ${CUERPO};letter-spacing:2px;color:${C.negro};text-decoration:none;text-transform:uppercase;">${texto} &rarr;</a>
</td></tr></table>`;

export function correoCliente(d, { empresa, origen, ref, demo }) {
  const pasos = [
    ['Revisamos tu solicitud', 'Un responsable de formación de RIVSAN la estudia con los datos de tu unidad.'],
    ['Te llamamos', 'En menos de 48 horas laborables, para concretar objetivos, espacio disponible y fechas.'],
    ['Lo llevamos a tu jefatura', 'Desplegamos el sistema y tus agentes lo prueban. Sin obras y en menos de una hora.'],
  ];
  const sobre = d.curso ? `el curso <strong style="color:${C.texto};">${esc(d.curso)}</strong>` : `<strong style="color:${C.texto};">${esc((d.interes || 'nuestras soluciones').toLowerCase())}</strong>`;
  const contenido = `
<tr><td style="padding:36px 36px 8px;">
${eyebrow(`Solicitud recibida · ${ref}`)}
<h1 style="margin:0;font:400 46px/1 ${DISPLAY};letter-spacing:1px;color:${C.texto};text-transform:uppercase;">Hemos recibido<br><span style="color:${C.amarillo};">tu solicitud</span></h1>
<p style="margin:22px 0 0;font:400 16px/1.6 ${CUERPO};color:#d6d6d0;">Hola, ${esc(d.nombre.split(' ')[0])}:</p>
<p style="margin:12px 0 0;font:400 16px/1.6 ${CUERPO};color:#d6d6d0;">Gracias por tu interés en ${sobre}. Ya tenemos todos los datos y nos pondremos en contacto contigo en <strong style="color:${C.texto};">menos de 48 horas laborables</strong>.</p>
</td></tr>
<tr><td style="padding:28px 36px 0;">
<p style="margin:0 0 12px;font:500 11px/1.4 ${MONO};letter-spacing:2px;color:${C.suave};text-transform:uppercase;">Lo que nos has enviado</p>
${tablaResumen(d)}
</td></tr>
<tr><td style="padding:32px 36px 0;">
<p style="margin:0 0 6px;font:500 11px/1.4 ${MONO};letter-spacing:2px;color:${C.suave};text-transform:uppercase;">Qué pasa ahora</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${pasos
  .map(
    ([t, x], i) => `<tr><td width="56" valign="top" style="padding:14px 0;border-bottom:1px solid ${C.linea};font:400 32px/1 ${DISPLAY};color:${C.amarillo};">0${i + 1}</td>
<td valign="top" style="padding:14px 0;border-bottom:1px solid ${C.linea};"><span style="font:600 15px/1.4 ${CUERPO};color:${C.texto};">${t}</span><br><span style="font:400 14px/1.5 ${CUERPO};color:${C.suave};">${x}</span></td></tr>`,
  )
  .join('')}
</table>
</td></tr>
<tr><td style="padding:32px 36px 12px;">${boton(`${origen}/simulador/`, 'Conoce el simulador')}</td></tr>
<tr><td style="padding:16px 36px 36px;font:400 14px/1.6 ${CUERPO};color:${C.suave};">¿Algo urgente? Escríbenos a <a href="mailto:${esc(empresa.email)}" style="color:${C.amarillo};text-decoration:none;">${esc(empresa.email)}</a> o llama al <a href="tel:${esc(empresa.phone.replace(/[^\d+]/g, ''))}" style="color:${C.amarillo};text-decoration:none;">${esc(empresa.phone)}</a>.</td></tr>`;
  const pie = `${esc(empresa.legalName)} · ${esc(empresa.street)} · ${esc(empresa.postalCode)} ${esc(empresa.city)}<br>
Recibes este correo porque has enviado una solicitud en nuestra web. Usamos tus datos solo para atenderla.
<a href="${esc(origen)}/legal/privacidad/" style="color:#9a9a92;">Política de privacidad</a>`;
  return {
    asunto: `${demo ? '[DEMO] ' : ''}Hemos recibido tu solicitud · RIVSAN`,
    html: marco({
      preheader: 'Te contactaremos en menos de 48 horas laborables.',
      demo: demo && `Demo · Este correo le llegaría a <span style="text-transform:none;">${esc(d.email)}</span>`,
      contenido,
      pie,
    }),
    texto: [
      `Hola, ${d.nombre.split(' ')[0]}:`,
      '',
      `Hemos recibido tu solicitud (${ref}). Te contactaremos en menos de 48 horas laborables.`,
      '',
      ...filas(d).map(([k, v]) => `${k}: ${v}`),
      '',
      `${empresa.email} · ${empresa.phone}`,
      `${empresa.legalName}`,
    ].join('\n'),
  };
}

export function correoInterno(d, { origen, ref, demo }) {
  const tema = d.curso || d.interes || 'Solicitud';
  const contenido = `
<tr><td style="padding:36px 36px 8px;">
${eyebrow(`Nueva solicitud · ${ref}`)}
<h1 style="margin:0;font:400 40px/1 ${DISPLAY};letter-spacing:1px;color:${C.texto};text-transform:uppercase;">${esc(tema)}</h1>
<p style="margin:14px 0 0;font:400 16px/1.6 ${CUERPO};color:#d6d6d0;"><strong style="color:${C.texto};">${esc(d.nombre)}</strong> · ${esc(d.cargo)}<br>${esc(d.unidad)}</p>
</td></tr>
<tr><td style="padding:24px 36px 0;">${tablaResumen(d)}</td></tr>
<tr><td style="padding:28px 36px 8px;">${boton(`mailto:${d.email}?subject=${encodeURIComponent(`Tu solicitud a RIVSAN (${ref})`)}`, 'Responder')}</td></tr>
<tr><td style="padding:12px 36px 36px;font:500 11px/1.7 ${MONO};letter-spacing:1px;color:${C.suave};">
ENVIADA DESDE ${esc(d.pagina || origen)}<br>${esc(new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }))}${demo ? '<br>MODO DEMO: EL CLIENTE NO HA RECIBIDO NADA' : ''}</td></tr>`;
  return {
    asunto: `${demo ? '[DEMO] ' : ''}Nueva solicitud · ${tema} · ${d.unidad}`,
    html: marco({ preheader: `${d.nombre} · ${d.unidad}`, demo: '', contenido, pie: 'Aviso interno del formulario de la web de RIVSAN.' }),
    texto: [`Nueva solicitud ${ref}`, '', ...filas(d).map(([k, v]) => `${k}: ${v}`), '', `Página: ${d.pagina || origen}`].join('\n'),
  };
}
