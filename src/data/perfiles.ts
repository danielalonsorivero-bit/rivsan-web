import type { ImageMetadata } from 'astro';
import { imagen } from './imagenes';
import datos from './contenido/perfiles.json';

// Páginas /soluciones/<slug>/: una por perfil de cliente. Los textos se editan desde el panel
// (src/data/contenido/perfiles.json); los perfiles en sí (y sus páginas) se añaden aquí en el código.
// `interest` coincide con los valores del selector del formulario de contacto.
export type Perfil = {
  slug: string;
  label: string;
  /** Texto corto para el menú y las tarjetas de la home */
  short: string;
  eyebrow: string;
  title: [string, string];
  lead: string;
  image: ImageMetadata;
  alt: string;
  retos: { title: string; text: string }[];
  servicios: { title: string; text: string; href: string }[];
  /** Módulos del simulador recomendados (id del ancla en /simulador/) */
  modulos: { id: string; label: string }[];
  interest: string;
};

export const perfiles: Perfil[] = datos.perfiles.map((p) => ({
  slug: p.slug,
  label: p.label,
  short: p.short,
  eyebrow: p.eyebrow,
  title: [p.titulo, p.acento],
  lead: p.lead,
  image: imagen(p.imagen),
  alt: p.alt,
  retos: p.retos,
  servicios: p.servicios,
  modulos: p.modulos.map((m) => ({ id: m.id, label: m.texto })),
  interest: p.interes,
}));
