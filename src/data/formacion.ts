import type { CollectionEntry } from 'astro:content';

export type Curso = CollectionEntry<'cursos'>;
export type Categoria = Curso['data']['categoria'];

export const categorias: Record<Categoria, { label: string; partner: string; interest: string }> = {
  simulador: { label: 'Simulador VR', partner: 'Con instructor RIVSAN', interest: 'jornada' },
  auxilios: { label: 'Primeros auxilios tácticos', partner: 'En colaboración con Iberotac', interest: 'auxilios' },
  fuerza: { label: 'Uso de la fuerza no letal', partner: 'Cursos para FCSE', interest: 'fuerza' },
};

export type Convocatoria = {
  curso: Curso;
  inicio: Date;
  fin?: Date;
  lugar: string;
  plazasLibres?: number;
  id: string; // AAAA-MM-DD, identifica la convocatoria en el formulario
};

const hoy = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/** Convocatorias futuras de un curso, ordenadas por fecha. */
export function convocatoriasDe(curso: Curso): Convocatoria[] {
  return curso.data.fechas
    .filter((f) => (f.fin ?? f.inicio) >= hoy())
    .sort((a, b) => +a.inicio - +b.inicio)
    .map((f) => ({ ...f, curso, id: isoDay(f.inicio) }));
}

/** Todas las convocatorias futuras de todos los cursos, ordenadas por fecha. */
export function calendario(cursos: Curso[]): Convocatoria[] {
  return cursos.flatMap(convocatoriasDe).sort((a, b) => +a.inicio - +b.inicio);
}

export const ordenarCursos = (cursos: Curso[]) =>
  [...cursos].sort((a, b) => a.data.orden - b.data.orden || a.data.titulo.localeCompare(b.data.titulo));

const fmtDia = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const fmtLargo = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const fmtMes = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export const formatoMes = (d: Date) => fmtMes.format(d);

/** "12 nov" o "12–13 nov" / "28 nov – 2 dic". */
export function rangoCorto(inicio: Date, fin?: Date): string {
  if (!fin || isoDay(fin) === isoDay(inicio)) return fmtDia.format(inicio);
  if (inicio.getUTCMonth() === fin.getUTCMonth()) return `${inicio.getUTCDate()}–${fmtDia.format(fin)}`;
  return `${fmtDia.format(inicio)} – ${fmtDia.format(fin)}`;
}

export function rangoLargo(inicio: Date, fin?: Date): string {
  if (!fin || isoDay(fin) === isoDay(inicio)) return fmtLargo.format(inicio);
  return `${fmtLargo.format(inicio)} – ${fmtLargo.format(fin)}`;
}

/** Estado de plazas para mostrar en etiquetas. */
export function estadoPlazas(plazasLibres: number | undefined) {
  if (plazasLibres === undefined) return { label: 'Plazas disponibles', tone: 'ok' as const };
  if (plazasLibres === 0) return { label: 'Completo', tone: 'full' as const };
  if (plazasLibres <= 4) return { label: `Últimas ${plazasLibres} plazas`, tone: 'low' as const };
  return { label: `${plazasLibres} plazas libres`, tone: 'ok' as const };
}
