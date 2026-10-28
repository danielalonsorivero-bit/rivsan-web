import type { ImageMetadata } from 'astro';
import { imagen } from './imagenes';

// Vídeos de los perfiles (/soluciones/<slug>/ y sus tarjetas en la portada), por convención de nombre:
//   src/assets/video/perfil-<slug>-sd.mp4   640 px, para las tarjetas y móviles
//   src/assets/video/perfil-<slug>-hd.mp4   1280 px, para la cabecera de la página
//   src/assets/img/video-<slug>.jpg          primer fotograma (se ve mientras carga)
// Sin vídeo, el perfil usa su imagen.
export type VideoPerfil = { sd: string; hd: string; poster: ImageMetadata };

const urls = import.meta.glob<string>('/src/assets/video/perfil-*.mp4', { query: '?url', import: 'default', eager: true });

export function videoPerfil(slug: string): VideoPerfil | undefined {
  const sd = urls[`/src/assets/video/perfil-${slug}-sd.mp4`];
  const hd = urls[`/src/assets/video/perfil-${slug}-hd.mp4`];
  if (!sd || !hd) return undefined;
  return { sd, hd, poster: imagen(`video-${slug}.jpg`) };
}
