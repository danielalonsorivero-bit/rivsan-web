// API del panel. Rutas bajo /admin/api:
//   GET    /sesion              comprueba el acceso; dice si se guarda en GitHub (remoto)
//   POST   /login               body { clave }; deja la cookie de sesión
//   POST   /logout              la borra
//   GET    /cursos              lista de cursos (sin el texto)
//   GET    /cursos/:slug        un curso con su texto
//   PUT    /cursos/:slug        guarda (crea si no existe); body { data, body, nuevoSlug? }
//   DELETE /cursos/:slug        borra el .md
//   GET    /imagenes            imágenes de src/assets/img
//   GET    /imagen?f=nombre     la imagen en sí (miniatura del editor). Va en la consulta porque
//                               en Vercel una ruta acabada en «.jpg/» se redirige sin la barra
//   POST   /imagenes            sube una imagen; body { nombre, base64 }
//   GET    /empresa             datos de src/data/empresa.json
//   PUT    /empresa             los guarda
// Responde igual con dos almacenes (ver github.mjs): los archivos del proyecto en `npm run dev`,
// o la rama de GitHub en Vercel, donde cada guardado es un commit que vuelve a publicar la web.
import { createHmac, createHash, timingSafeEqual } from 'node:crypto';
import { almacenDisco, almacenGitHub } from './github.mjs';
import yaml from 'js-yaml';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IMG_EXT = /\.(jpe?g|png|webp|avif)$/i;
const IMG_PREFIX = '../../assets/img/';

// Orden de los campos al escribir el frontmatter, para que los .md sigan legibles.
const CAMPOS = [
  'titulo', 'categoria', 'resumen', 'imagen', 'imagenAlt', 'duracion', 'asistentes',
  'modalidad', 'acreditacion', 'dirigidoA', 'fechas', 'aDemanda', 'orden', 'ejemplo',
];

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const isoDay = (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v);

export function parseCurso(texto) {
  const m = texto.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new HttpError(500, 'El archivo no tiene cabecera (frontmatter)');
  const data = yaml.load(m[1]) ?? {};
  data.fechas = (data.fechas ?? []).map((f) => ({ ...f, inicio: isoDay(f.inicio), fin: isoDay(f.fin) }));
  if (typeof data.imagen === 'string') data.imagen = data.imagen.replace(IMG_PREFIX, '');
  return { data, body: m[2].replace(/^\n+/, '') };
}

function serializeCurso({ data, body }) {
  const limpio = {};
  for (const k of CAMPOS) {
    let v = data[k];
    if (v === undefined || v === null || v === '') continue;
    if (k === 'imagen') v = IMG_PREFIX + v;
    if (k === 'fechas') {
      v = v
        .filter((f) => f.inicio && f.lugar)
        .map((f) => {
          const out = { inicio: f.inicio };
          if (f.fin) out.fin = f.fin;
          out.lugar = f.lugar;
          if (f.plazasLibres !== undefined && f.plazasLibres !== null && f.plazasLibres !== '') out.plazasLibres = Number(f.plazasLibres);
          return out;
        });
      if (!v.length) continue;
    }
    limpio[k] = v;
  }
  // Las fechas van como texto AAAA-MM-DD sin comillas, igual que en los .md escritos a mano.
  const front = yaml
    .dump(limpio, { lineWidth: -1, quotingType: "'" })
    .replace(/^(\s*-?\s*(?:inicio|fin): )'(\d{4}-\d{2}-\d{2})'$/gm, '$1$2');
  return `---\n${front}---\n\n${(body ?? '').trim()}\n`;
}

function validar(data) {
  const faltan = ['titulo', 'categoria', 'resumen', 'imagen', 'imagenAlt', 'duracion', 'asistentes', 'modalidad', 'acreditacion', 'dirigidoA']
    .filter((k) => data[k] === undefined || data[k] === '');
  if (faltan.length) throw new HttpError(400, `Faltan campos: ${faltan.join(', ')}`);
  if (!['simulador', 'auxilios', 'fuerza'].includes(data.categoria)) throw new HttpError(400, 'Categoría no válida');
  if (!IMG_EXT.test(data.imagen) || data.imagen.includes('/')) throw new HttpError(400, 'Imagen no válida');
}

// ---------- Sesión ----------
// Cookie «caducidad.firma», firmada con la contraseña: cambiarla cierra todas las sesiones.
const COOKIE = 'rivsan_panel';
const DURACION = 12 * 3600; // segundos

const firmar = (clave, exp) => createHmac('sha256', clave).update(`panel:${exp}`).digest('hex');
const iguales = (a, b) => timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());

function sesionValida(clave, cookies) {
  const valor = cookies.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`))?.[1];
  const [exp, firma] = (valor ?? '').split('.');
  return !!firma && Number(exp) > Date.now() / 1000 && iguales(firma, firmar(clave, exp));
}

function cookieSesion(clave, seguro) {
  const exp = Math.floor(Date.now() / 1000) + DURACION;
  return `${COOKIE}=${exp}.${firmar(clave, exp)}; Path=/admin/; Max-Age=${DURACION}; HttpOnly; SameSite=Strict${seguro ? '; Secure' : ''}`;
}

// ---------- Rutas ----------
const RUTA_CURSOS = 'src/content/cursos';
const RUTA_IMG = 'src/assets/img';
const RUTA_EMPRESA = 'src/data/empresa.json';
const TIPOS = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif' };

async function rutas({ metodo: m, recurso, id, consulta, leerJson }, almacen) {
  const fileCurso = (slug) => {
    if (!SLUG.test(slug)) throw new HttpError(400, 'Identificador no válido (solo minúsculas, números y guiones)');
    return `${RUTA_CURSOS}/${slug}.md`;
  };
  const texto = async (ruta) => (await almacen.leer(ruta))?.toString('utf8') ?? null;

  if (recurso === 'cursos' && !id && m === 'GET') {
    const files = (await almacen.listar(RUTA_CURSOS)).filter((f) => f.endsWith('.md'));
    const cursos = await Promise.all(
      files.map(async (f) => ({ slug: f.slice(0, -3), ...parseCurso(await texto(`${RUTA_CURSOS}/${f}`)).data })),
    );
    return cursos.sort((a, b) => (a.orden ?? 100) - (b.orden ?? 100) || a.titulo.localeCompare(b.titulo));
  }
  if (recurso === 'cursos' && id && m === 'GET') {
    const md = await texto(fileCurso(id));
    if (md === null) throw new HttpError(404, 'Curso no encontrado');
    return { slug: id, ...parseCurso(md) };
  }
  if (recurso === 'cursos' && id && m === 'PUT') {
    const { data, body, nuevoSlug, crear } = await leerJson();
    validar(data);
    const destino = nuevoSlug || id;
    const file = fileCurso(destino);
    if ((crear || destino !== id) && (await almacen.existe(file))) throw new HttpError(409, `Ya existe un curso con la URL «${destino}»`);
    const cambios = [{ ruta: file, contenido: serializeCurso({ data, body }) }];
    if (destino !== id && !crear) cambios.push({ ruta: fileCurso(id), contenido: null });
    await almacen.escribir(cambios, `Panel: ${crear ? 'crea' : 'actualiza'} el curso «${data.titulo}»`);
    return { slug: destino };
  }
  if (recurso === 'cursos' && id && m === 'DELETE') {
    const file = fileCurso(id);
    if (!(await almacen.existe(file))) throw new HttpError(404, 'Curso no encontrado');
    await almacen.escribir([{ ruta: file, contenido: null }], `Panel: borra el curso «${id}»`);
    return { ok: true };
  }

  if (recurso === 'imagenes' && !id && m === 'GET') {
    return (await almacen.listar(RUTA_IMG)).filter((f) => IMG_EXT.test(f)).sort();
  }
  if (recurso === 'imagen' && m === 'GET') {
    const f = consulta.get('f') ?? '';
    if (!IMG_EXT.test(f) || f.includes('/')) throw new HttpError(400, 'Imagen no válida');
    const bytes = await almacen.leer(`${RUTA_IMG}/${f}`);
    if (!bytes) throw new HttpError(404, 'Imagen no encontrada');
    return { bytes, tipo: TIPOS[f.match(IMG_EXT)[0].toLowerCase()] };
  }
  if (recurso === 'imagenes' && !id && m === 'POST') {
    const { nombre, base64 } = await leerJson();
    const ext = (nombre?.match(IMG_EXT)?.[0] ?? '').toLowerCase().replace('.jpeg', '.jpg');
    if (!ext || !base64) throw new HttpError(400, 'Sube una imagen JPG, PNG, WebP o AVIF');
    const base = nombre.slice(0, -ext.length).normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'imagen';
    let final = base + ext;
    for (let i = 2; await almacen.existe(`${RUTA_IMG}/${final}`); i++) final = `${base}-${i}${ext}`;
    await almacen.escribir([{ ruta: `${RUTA_IMG}/${final}`, contenido: Buffer.from(base64, 'base64') }], `Panel: sube la imagen «${final}»`);
    return { nombre: final };
  }

  if (recurso === 'empresa' && m === 'GET') return JSON.parse(await texto(RUTA_EMPRESA));
  if (recurso === 'empresa' && m === 'PUT') {
    const actual = JSON.parse(await texto(RUTA_EMPRESA));
    const nuevo = await leerJson();
    // Solo se aceptan las claves que ya existen, todas como texto.
    for (const k of Object.keys(actual)) if (typeof nuevo[k] === 'string') actual[k] = nuevo[k].trim();
    await almacen.escribir([{ ruta: RUTA_EMPRESA, contenido: JSON.stringify(actual, null, 2) + '\n' }], 'Panel: actualiza los datos de empresa');
    return actual;
  }

  throw new HttpError(404, 'Ruta no encontrada');
}

/**
 * Configuración a partir de las variables de entorno:
 *   GITHUB_TOKEN    token con permiso de escritura en el contenido del repositorio
 *   GITHUB_REPO     «usuario/repositorio» (en Vercel se deduce del repositorio conectado)
 *   GITHUB_BRANCH   rama donde se guarda (por defecto main)
 *   ADMIN_PASSWORD  contraseña del panel
 * En Vercel las tres primeras y la contraseña son obligatorias. En local, sin GITHUB_TOKEN se
 * escribe en los archivos del proyecto y sin ADMIN_PASSWORD no se pide contraseña.
 */
export function configPanel(env, root) {
  const repo = env.GITHUB_REPO || (env.VERCEL_GIT_REPO_OWNER && env.VERCEL_GIT_REPO_SLUG ? `${env.VERCEL_GIT_REPO_OWNER}/${env.VERCEL_GIT_REPO_SLUG}` : '');
  const clave = env.ADMIN_PASSWORD ?? '';
  const enVercel = !!env.VERCEL;
  let error = '';
  if (enVercel && !clave) error = 'Falta configurar ADMIN_PASSWORD en Vercel';
  else if (env.GITHUB_TOKEN && !repo) error = 'Falta configurar GITHUB_REPO';
  else if (enVercel && !env.GITHUB_TOKEN) error = 'Falta configurar GITHUB_TOKEN en Vercel';
  const almacen = env.GITHUB_TOKEN
    ? almacenGitHub({ token: env.GITHUB_TOKEN, repo, rama: env.GITHUB_BRANCH || 'main', api: env.GITHUB_API_URL })
    : almacenDisco(root);
  return { almacen, clave, error, seguro: enVercel };
}

/**
 * Atiende una petición a /admin/api. Sin dependencias del servidor: lo usan el middleware de
 * `npm run dev` (integration.mjs) y la función de Vercel (endpoint.mjs).
 *   peticion: { metodo, ruta, cabecera(nombre), leerTexto() }
 *   config:   lo que devuelve configPanel()
 * Devuelve { status, headers, body }.
 */
export async function responder(peticion, { almacen, clave, error, seguro }) {
  const json = (status, datos, extra = {}) => ({
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra },
    body: JSON.stringify(datos),
  });
  const [camino, query] = peticion.ruta.split('?');
  const [recurso, id] = camino.split('/').filter(Boolean).map(decodeURIComponent);
  const consulta = new URLSearchParams(query ?? '');
  const leerJson = async () => {
    try {
      return JSON.parse((await peticion.leerTexto()) || '{}');
    } catch {
      throw new HttpError(400, 'JSON no válido');
    }
  };
  try {
    // La cabecera propia obliga a una comprobación CORS previa que aquí nunca se responde,
    // así que otra web abierta en el navegador no puede llamar a esta API. Las imágenes se
    // cargan con <img> (sin cabeceras) y solo se leen.
    const esImagen = recurso === 'imagen' && peticion.metodo === 'GET';
    if (!esImagen && peticion.cabecera('x-rivsan-admin') !== '1') throw new HttpError(403, 'Acceso no permitido');
    if (error) throw new HttpError(500, error);

    if (recurso === 'login' && peticion.metodo === 'POST') {
      if (!clave) return json(200, { ok: true });
      const { clave: intento } = await leerJson();
      if (typeof intento !== 'string' || !iguales(intento, clave)) {
        await new Promise((r) => setTimeout(r, 800)); // frena los intentos a ciegas
        throw new HttpError(401, 'Contraseña incorrecta');
      }
      return json(200, { ok: true }, { 'Set-Cookie': cookieSesion(clave, seguro) });
    }
    if (recurso === 'logout' && peticion.metodo === 'POST') {
      return json(200, { ok: true }, { 'Set-Cookie': `${COOKIE}=; Path=/admin/; Max-Age=0; HttpOnly; SameSite=Strict${seguro ? '; Secure' : ''}` });
    }
    if (clave && !sesionValida(clave, peticion.cabecera('cookie') ?? '')) throw new HttpError(401, 'Inicia sesión');
    if (recurso === 'sesion' && peticion.metodo === 'GET') return json(200, { remoto: almacen.remoto, login: !!clave });

    const r = await rutas({ metodo: peticion.metodo, recurso, id, consulta, leerJson }, almacen);
    if (r?.bytes) return { status: 200, headers: { 'Content-Type': r.tipo, 'Cache-Control': 'private, max-age=300' }, body: r.bytes };
    return json(200, r);
  } catch (e) {
    if (!e.status || e.status >= 500) console.error('[panel]', e);
    return json(e.status ?? 500, { error: e.github ? 'No se pudo conectar con GitHub. Revisa GITHUB_TOKEN y GITHUB_REPO.' : e.message });
  }
}
