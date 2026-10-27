import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Cada curso es un .md en src/content/cursos/. El nombre del archivo es la URL:
// src/content/cursos/control-y-arresto.md → /formacion/control-y-arresto/
const cursos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cursos' }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      categoria: z.enum(['simulador', 'auxilios', 'fuerza']),
      resumen: z.string(),
      imagen: image(),
      imagenAlt: z.string(),
      duracion: z.string(),
      asistentes: z.number().int().positive(), // plazas máximas por convocatoria
      modalidad: z.string(),
      acreditacion: z.string(),
      dirigidoA: z.string(),
      // Convocatorias abiertas. Las pasadas se ocultan al compilar.
      fechas: z
        .array(
          z.object({
            inicio: z.coerce.date(),
            fin: z.coerce.date().optional(),
            lugar: z.string(),
            plazasLibres: z.number().int().nonnegative().optional(),
          }),
        )
        .default([]),
      // Si se puede impartir en las instalaciones del cliente
      aDemanda: z.boolean().default(true),
      orden: z.number().default(100),
      // Marca de contenido de ejemplo: muestra un aviso en la web
      ejemplo: z.boolean().default(false),
    }),
});

export const collections = { cursos };
