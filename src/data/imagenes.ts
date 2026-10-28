import type { ImageMetadata } from 'astro';

// Imágenes de src/assets/img por nombre de archivo: los contenidos editables desde el panel
// (src/data/contenido/*.json) guardan solo el nombre.
const archivos = import.meta.glob<{ default: ImageMetadata }>('/src/assets/img/*.{jpg,jpeg,png,webp,avif}', { eager: true });

export function imagen(nombre: string): ImageMetadata {
  const m = archivos[`/src/assets/img/${nombre}`];
  if (!m) throw new Error(`No existe la imagen «${nombre}» en src/assets/img`);
  return m.default;
}
