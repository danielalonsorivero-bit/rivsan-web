// Secciones de contenido editables desde el panel. Cada una es un JSON en src/data/contenido/
// descrito por su esquema: el panel pinta el formulario a partir de él y el servidor lo usa
// para validar y limpiar lo que se guarda (ver normalizar()).
//
// Tipos de campo: texto, area (varias líneas), numero, fecha (AAAA-MM-DD), check, opcion
// (con `opciones`), imagen (archivo de src/assets/img) y lista. Una lista lleva `campos`
// (lista de fichas) o `de: 'texto'` (lista de frases). Opciones comunes:
//   requerido   no puede quedar vacío
//   fijo        se muestra pero no se edita (lo conserva el servidor)
//   fija        (listas) no se añaden, quitan ni reordenan elementos
//   resumen     (listas) campo que da título a cada ficha
//   max         longitud máxima del texto
import { intereses } from '../src/data/intereses.mjs';

const INTERESES = intereses.map((i) => ({ valor: i.value, texto: i.label }));
const MODULOS = [
  { valor: 'identificacion', texto: 'Identificación positiva de amenazas' },
  { valor: 'tiro', texto: 'Campo de tiro' },
  { valor: 'cqb', texto: 'Agilidad cognitiva (CQB)' },
  { valor: 'counter-drone', texto: 'Counter-drone' },
  { valor: 'pilotaje', texto: 'Pilotaje de drones' },
  { valor: 'planificacion', texto: 'Planificación inmersiva' },
];

export const SECCIONES = [
  {
    id: 'demos',
    titulo: 'Fechas de demostración',
    descripcion:
      'Días disponibles para hacer demostraciones. En el formulario de solicitud, «Fecha preferente» solo ofrece estas fechas (las pasadas no salen). Sin ninguna, el cliente puede elegir cualquier día a partir de mañana.',
    ver: '/#contacto',
    campos: [
      {
        k: 'fechas',
        tipo: 'lista',
        etiqueta: 'Fechas disponibles',
        singular: 'fecha',
        resumen: 'fecha',
        orden: 'fecha',
        campos: [
          { k: 'fecha', tipo: 'fecha', etiqueta: 'Día', requerido: true },
          { k: 'lugar', tipo: 'texto', etiqueta: 'Zona o ciudad (opcional)', max: 80 },
        ],
      },
    ],
  },
  {
    id: 'preguntas',
    titulo: 'Preguntas frecuentes',
    descripcion: 'Bloques de preguntas de la página «Preguntas frecuentes». Marca con (*) las respuestas pendientes de confirmar: es una nota interna y no se muestra en la web.',
    ver: '/preguntas-frecuentes/',
    campos: [
      {
        k: 'grupos',
        tipo: 'lista',
        etiqueta: 'Bloques',
        singular: 'bloque',
        resumen: 'titulo',
        campos: [
          { k: 'titulo', tipo: 'texto', etiqueta: 'Título del bloque', requerido: true, max: 80 },
          {
            k: 'preguntas',
            tipo: 'lista',
            etiqueta: 'Preguntas',
            singular: 'pregunta',
            resumen: 'pregunta',
            campos: [
              { k: 'pregunta', tipo: 'texto', etiqueta: 'Pregunta', requerido: true, ancho: 'wide', max: 200 },
              { k: 'respuesta', tipo: 'area', etiqueta: 'Respuesta', requerido: true, max: 1500 },
              { k: 'enlace', tipo: 'texto', etiqueta: 'Enlace «Saber más» (opcional, p. ej. /contratar/)', max: 200 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'home',
    titulo: 'Portada',
    descripcion: 'Textos y cifras de la página de inicio.',
    ver: '/',
    campos: [
      {
        k: 'hero',
        tipo: 'grupo',
        etiqueta: 'Cabecera',
        campos: [
          { k: 'antetitulo', tipo: 'texto', etiqueta: 'Antetítulo', max: 80 },
          { k: 'titulo', tipo: 'texto', etiqueta: 'Título', requerido: true, max: 80 },
          { k: 'acento', tipo: 'texto', etiqueta: 'Título en amarillo', max: 80 },
          { k: 'entrada', tipo: 'area', etiqueta: 'Entradilla', max: 400 },
          {
            k: 'cifras',
            tipo: 'lista',
            etiqueta: 'Cifras',
            singular: 'cifra',
            resumen: 'texto',
            max: 4,
            campos: [
              { k: 'prefijo', tipo: 'texto', etiqueta: 'Antes de la cifra (p. ej. <)', max: 4 },
              { k: 'valor', tipo: 'texto', etiqueta: 'Cifra', requerido: true, max: 8 },
              { k: 'unidad', tipo: 'texto', etiqueta: 'Unidad (p. ej. min)', max: 20 },
              { k: 'texto', tipo: 'texto', etiqueta: 'Texto', requerido: true, max: 80 },
              { k: 'animar', tipo: 'check', etiqueta: 'Contar desde 0 al aparecer (solo números)' },
            ],
          },
        ],
      },
      {
        k: 'cita',
        tipo: 'grupo',
        etiqueta: 'Frase de marca',
        campos: [
          { k: 'antes', tipo: 'texto', etiqueta: 'Principio', max: 80 },
          { k: 'destacado', tipo: 'texto', etiqueta: 'Parte destacada', max: 80 },
          { k: 'despues', tipo: 'texto', etiqueta: 'Final', max: 80 },
        ],
      },
      {
        k: 'planes',
        tipo: 'grupo',
        etiqueta: 'Modalidades de contratación',
        campos: [
          { k: 'antetitulo', tipo: 'texto', etiqueta: 'Antetítulo', max: 80 },
          { k: 'titulo', tipo: 'texto', etiqueta: 'Título', requerido: true, max: 80 },
          { k: 'acento', tipo: 'texto', etiqueta: 'Título en amarillo', max: 80 },
          { k: 'entrada', tipo: 'area', etiqueta: 'Entradilla', max: 400 },
          {
            k: 'planes',
            tipo: 'lista',
            etiqueta: 'Modalidades',
            singular: 'modalidad',
            resumen: 'nombre',
            max: 4,
            campos: [
              { k: 'nombre', tipo: 'texto', etiqueta: 'Nombre', requerido: true, max: 60 },
              { k: 'resumen', tipo: 'texto', etiqueta: 'Resumen', ancho: 'wide', max: 160 },
              { k: 'puntos', tipo: 'lista', de: 'texto', etiqueta: 'Qué incluye', singular: 'punto', max: 8 },
              { k: 'interes', tipo: 'opcion', etiqueta: 'Interés que se marca en el formulario', opciones: INTERESES, requerido: true },
              { k: 'destacado', tipo: 'check', etiqueta: 'Destacada («Recomendado»)' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'clientes',
    titulo: 'Clientes y testimonios',
    descripcion: 'Bloque «Respaldo internacional» de la portada y de «Nosotros». Los testimonios solo se muestran si hay alguno.',
    ver: '/#respaldo',
    campos: [
      { k: 'clientes', tipo: 'lista', de: 'texto', etiqueta: 'Lo utilizan', singular: 'cliente', max: 24 },
      {
        k: 'compromisos',
        tipo: 'lista',
        etiqueta: 'Compromisos RIVSAN',
        singular: 'compromiso',
        resumen: 'titulo',
        max: 6,
        campos: [
          { k: 'titulo', tipo: 'texto', etiqueta: 'Título', requerido: true, max: 60 },
          { k: 'texto', tipo: 'area', etiqueta: 'Texto', requerido: true, max: 200 },
        ],
      },
      {
        k: 'testimonios',
        tipo: 'lista',
        etiqueta: 'Testimonios',
        singular: 'testimonio',
        resumen: 'autor',
        max: 6,
        campos: [
          { k: 'frase', tipo: 'area', etiqueta: 'Frase', requerido: true, max: 400 },
          { k: 'autor', tipo: 'texto', etiqueta: 'Nombre', requerido: true, max: 80 },
          { k: 'cargo', tipo: 'texto', etiqueta: 'Cargo y unidad', max: 120 },
        ],
      },
    ],
  },
  {
    id: 'perfiles',
    titulo: 'Perfiles',
    descripcion: 'Páginas de «Para quién» (/soluciones/…) y sus tarjetas en la portada. Cada perfil es una página: no se añaden ni se quitan desde aquí.',
    ver: '/soluciones/policia-local/',
    campos: [
      {
        k: 'perfiles',
        tipo: 'lista',
        etiqueta: 'Perfiles',
        singular: 'perfil',
        resumen: 'label',
        fija: true,
        campos: [
          { k: 'slug', tipo: 'texto', etiqueta: 'Dirección (/soluciones/…)', fijo: true },
          { k: 'label', tipo: 'texto', etiqueta: 'Nombre', requerido: true, max: 60 },
          { k: 'short', tipo: 'texto', etiqueta: 'Frase para el menú y la portada', ancho: 'wide', requerido: true, max: 160 },
          { k: 'eyebrow', tipo: 'texto', etiqueta: 'Antetítulo', max: 80 },
          { k: 'titulo', tipo: 'texto', etiqueta: 'Título', requerido: true, max: 80 },
          { k: 'acento', tipo: 'texto', etiqueta: 'Título en amarillo', max: 80 },
          { k: 'lead', tipo: 'area', etiqueta: 'Entradilla (también es la descripción para buscadores)', requerido: true, max: 400 },
          { k: 'imagen', tipo: 'imagen', etiqueta: 'Imagen', requerido: true },
          { k: 'alt', tipo: 'texto', etiqueta: 'Texto alternativo de la imagen', requerido: true, max: 200 },
          { k: 'interes', tipo: 'opcion', etiqueta: 'Interés que se marca en el formulario', opciones: INTERESES, requerido: true },
          {
            k: 'retos',
            tipo: 'lista',
            etiqueta: 'Tus retos',
            singular: 'reto',
            resumen: 'title',
            max: 6,
            campos: [
              { k: 'title', tipo: 'texto', etiqueta: 'Título', requerido: true, max: 60 },
              { k: 'text', tipo: 'area', etiqueta: 'Texto', requerido: true, max: 300 },
            ],
          },
          {
            k: 'servicios',
            tipo: 'lista',
            etiqueta: 'Cómo te ayudamos',
            singular: 'servicio',
            resumen: 'title',
            max: 6,
            campos: [
              { k: 'title', tipo: 'texto', etiqueta: 'Título', requerido: true, max: 60 },
              { k: 'href', tipo: 'texto', etiqueta: 'Enlace (p. ej. /formacion/#fuerza)', requerido: true, max: 200 },
              { k: 'text', tipo: 'area', etiqueta: 'Texto', requerido: true, max: 300 },
            ],
          },
          {
            k: 'modulos',
            tipo: 'lista',
            etiqueta: 'Módulos del simulador recomendados',
            singular: 'módulo',
            resumen: 'texto',
            max: 6,
            campos: [
              { k: 'id', tipo: 'opcion', etiqueta: 'Módulo', opciones: MODULOS, requerido: true },
              { k: 'texto', tipo: 'texto', etiqueta: 'Cómo se llama aquí', requerido: true, max: 80 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'seo',
    titulo: 'Buscadores (SEO)',
    descripcion:
      'Título y descripción de cada página en Google y al compartirla. El título lleva detrás « · RIVSAN». Vacío = el valor por defecto (en Inicio: lema y descripción de «Datos de empresa»). Los cursos y perfiles usan su propio título y resumen.',
    campos: [
      {
        k: 'paginas',
        tipo: 'lista',
        etiqueta: 'Páginas',
        singular: 'página',
        resumen: 'pagina',
        fija: true,
        campos: [
          { k: 'pagina', tipo: 'texto', etiqueta: 'Página', fijo: true },
          { k: 'ruta', tipo: 'texto', etiqueta: 'Dirección', fijo: true },
          { k: 'titulo', tipo: 'texto', etiqueta: 'Título (ideal: menos de 50 caracteres)', ancho: 'wide', max: 70 },
          { k: 'descripcion', tipo: 'area', etiqueta: 'Descripción (ideal: 120–160 caracteres)', max: 300 },
        ],
      },
    ],
  },
];

export const seccion = (id) => SECCIONES.find((s) => s.id === id);
export const archivoSeccion = (id) => `src/data/contenido/${id}.json`;

const IMG = /^[^/\\]+\.(jpe?g|png|webp|avif)$/i;
const FECHA = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Limpia `valor` según `campos`: solo las claves del esquema, con su tipo y longitud.
 * `actual` es lo guardado (para los campos fijos y las listas fijas).
 * Devuelve { datos, errores } con los errores como texto legible («Bloques › 2 › Pregunta»).
 */
export function normalizar(campos, valor, actual = {}, ruta = []) {
  const errores = [];
  const datos = {};
  const v = valor && typeof valor === 'object' ? valor : {};
  const a = actual && typeof actual === 'object' ? actual : {};
  for (const c of campos) {
    const donde = [...ruta, c.etiqueta].join(' › ');
    if (c.fijo) {
      if (a[c.k] !== undefined) datos[c.k] = a[c.k];
      continue;
    }
    if (c.tipo === 'grupo') {
      const r = normalizar(c.campos, v[c.k], a[c.k], [...ruta, c.etiqueta]);
      datos[c.k] = r.datos;
      errores.push(...r.errores);
      continue;
    }
    if (c.tipo === 'lista') {
      let lista = Array.isArray(v[c.k]) ? v[c.k] : [];
      const previa = Array.isArray(a[c.k]) ? a[c.k] : [];
      if (c.fija && lista.length !== previa.length) {
        errores.push(`${donde}: no se pueden añadir ni quitar elementos`);
        lista = previa;
      }
      if (lista.length > (c.max ?? 200)) errores.push(`${donde}: como máximo ${c.max ?? 200}`);
      if (c.de === 'texto') {
        datos[c.k] = lista.map((t) => String(t ?? '').trim().slice(0, 300)).filter(Boolean);
      } else {
        datos[c.k] = lista.map((item, i) => {
          const r = normalizar(c.campos, item, previa[i], [...ruta, c.etiqueta, `${c.singular ?? 'elemento'} ${i + 1}`]);
          errores.push(...r.errores);
          return r.datos;
        });
        if (c.orden) datos[c.k].sort((x, y) => String(x[c.orden]).localeCompare(String(y[c.orden])));
      }
      continue;
    }
    let x = v[c.k];
    if (c.tipo === 'check') {
      datos[c.k] = x === true;
      continue;
    }
    if (c.tipo === 'numero') {
      x = x === '' || x === null || x === undefined ? undefined : Number(x);
      if (x !== undefined && !Number.isFinite(x)) x = undefined;
    } else {
      x = String(x ?? '').trim().slice(0, c.max ?? (c.tipo === 'area' ? 2000 : 300));
      if (c.tipo === 'fecha' && x && !FECHA.test(x)) errores.push(`${donde}: fecha no válida`);
      if (c.tipo === 'imagen' && x && !IMG.test(x)) errores.push(`${donde}: imagen no válida`);
      if (c.tipo === 'opcion' && x && !c.opciones.some((o) => o.valor === x)) errores.push(`${donde}: opción no válida`);
    }
    if (c.requerido && (x === undefined || x === '')) errores.push(`${donde}: es obligatorio`);
    if (x !== undefined && x !== '') datos[c.k] = x;
    else if (c.tipo !== 'numero') datos[c.k] = '';
  }
  return { datos, errores };
}

/** Nombres de imagen usados en `datos` (para comprobar que existen antes de guardar). */
export function imagenesDe(campos, datos) {
  const out = [];
  for (const c of campos) {
    const v = datos?.[c.k];
    if (c.tipo === 'imagen' && v) out.push(v);
    else if (c.tipo === 'grupo') out.push(...imagenesDe(c.campos, v));
    else if (c.tipo === 'lista' && c.campos) for (const item of v ?? []) out.push(...imagenesDe(c.campos, item));
  }
  return out;
}
