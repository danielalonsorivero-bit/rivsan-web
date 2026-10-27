// API del panel (solo en desarrollo). Rutas bajo /admin/api:
//   GET    /cursos              lista de cursos (sin el texto)
//   GET    /cursos/:slug        un curso con su texto
//   PUT    /cursos/:slug        guarda (crea si no existe); body { data, body, nuevoSlug? }
//   DELETE /cursos/:slug        borra el .md
//   GET    /imagenes            imágenes de src/assets/img
//   POST   /imagenes            sube una imagen; body { nombre, base64 }
//   GET    /empresa             datos de src/data/empresa.json
//   PUT    /empresa             los guarda
import fs from 'node:fs/promises';
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

function parseCurso(texto) {
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

async function readJson(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  } catch {
    throw new HttpError(400, 'JSON no válido');
  }
}

export function createApi(root) {
  const dirCursos = new URL('src/content/cursos/', root);
  const dirImg = new URL('src/assets/img/', root);
  const fileEmpresa = new URL('src/data/empresa.json', root);
  const fileCurso = (slug) => {
    if (!SLUG.test(slug)) throw new HttpError(400, 'Identificador no válido (solo minúsculas, números y guiones)');
    return new URL(`${slug}.md`, dirCursos);
  };
  const existe = (url) => fs.access(url).then(() => true, () => false);

  async function handle(req) {
    const [recurso, id] = req.url.split('?')[0].split('/').filter(Boolean).map(decodeURIComponent);
    const m = req.method;

    if (recurso === 'cursos' && !id && m === 'GET') {
      const files = (await fs.readdir(dirCursos)).filter((f) => f.endsWith('.md'));
      const cursos = await Promise.all(
        files.map(async (f) => {
          const { data } = parseCurso(await fs.readFile(new URL(f, dirCursos), 'utf8'));
          return { slug: f.slice(0, -3), ...data };
        }),
      );
      return cursos.sort((a, b) => (a.orden ?? 100) - (b.orden ?? 100) || a.titulo.localeCompare(b.titulo));
    }
    if (recurso === 'cursos' && id && m === 'GET') {
      const file = fileCurso(id);
      if (!(await existe(file))) throw new HttpError(404, 'Curso no encontrado');
      return { slug: id, ...parseCurso(await fs.readFile(file, 'utf8')) };
    }
    if (recurso === 'cursos' && id && m === 'PUT') {
      const { data, body, nuevoSlug, crear } = await readJson(req);
      validar(data);
      const destino = nuevoSlug || id;
      const file = fileCurso(destino);
      if ((crear || destino !== id) && (await existe(file))) throw new HttpError(409, `Ya existe un curso con la URL «${destino}»`);
      await fs.writeFile(file, serializeCurso({ data, body }));
      if (destino !== id && !crear) await fs.rm(fileCurso(id), { force: true });
      return { slug: destino };
    }
    if (recurso === 'cursos' && id && m === 'DELETE') {
      await fs.rm(fileCurso(id));
      return { ok: true };
    }

    if (recurso === 'imagenes' && m === 'GET') {
      return (await fs.readdir(dirImg)).filter((f) => IMG_EXT.test(f)).sort();
    }
    if (recurso === 'imagenes' && m === 'POST') {
      const { nombre, base64 } = await readJson(req);
      const ext = (nombre?.match(IMG_EXT)?.[0] ?? '').toLowerCase().replace('.jpeg', '.jpg');
      if (!ext || !base64) throw new HttpError(400, 'Sube una imagen JPG, PNG, WebP o AVIF');
      const base = nombre.slice(0, -ext.length).normalize('NFD').replace(/[̀-ͯ]/g, '')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'imagen';
      let final = base + ext;
      for (let i = 2; await existe(new URL(final, dirImg)); i++) final = `${base}-${i}${ext}`;
      await fs.writeFile(new URL(final, dirImg), Buffer.from(base64, 'base64'));
      return { nombre: final };
    }

    if (recurso === 'empresa' && m === 'GET') return JSON.parse(await fs.readFile(fileEmpresa, 'utf8'));
    if (recurso === 'empresa' && m === 'PUT') {
      const actual = JSON.parse(await fs.readFile(fileEmpresa, 'utf8'));
      const nuevo = await readJson(req);
      // Solo se aceptan las claves que ya existen, todas como texto.
      for (const k of Object.keys(actual)) if (typeof nuevo[k] === 'string') actual[k] = nuevo[k].trim();
      await fs.writeFile(fileEmpresa, JSON.stringify(actual, null, 2) + '\n');
      return actual;
    }

    throw new HttpError(404, 'Ruta no encontrada');
  }

  return async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    try {
      // La cabecera propia obliga a una comprobación CORS previa que aquí nunca se responde,
      // así que otra web abierta en el navegador no puede llamar a esta API.
      if (req.headers['x-rivsan-admin'] !== '1') throw new HttpError(403, 'Acceso no permitido');
      res.end(JSON.stringify(await handle(req)));
    } catch (e) {
      res.statusCode = e.status ?? 500;
      res.end(JSON.stringify({ error: e.message }));
    }
  };
}
