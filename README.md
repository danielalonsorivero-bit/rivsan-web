# RIVSAN · Web

Web de presentación de RIVSAN (formación táctica inmersiva, socio exclusivo de RE-liON en España). Hecha con [Astro](https://astro.build), genera HTML estático.

## Uso

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # genera dist/ para subir al alojamiento
```

## Estructura

- `src/pages/index.astro`: página de inicio
- `src/components/home/`: secciones de la home
- `src/components/`: cabecera, pie, logo y formulario de contacto
- `src/data/site.ts`: datos de empresa y navegación
- `src/styles/global.css`: colores, tipografías y utilidades
- `src/assets/img/`: fotos (se optimizan a WebP al compilar)
- `logo/`: logos originales en SVG/PDF

## Cursos

Cada curso es un archivo Markdown en `src/content/cursos/`. El nombre del archivo da la URL
(`control-y-arresto.md` → `/formacion/control-y-arresto/`). Para añadir uno, copia un archivo existente y cambia:

- `titulo`, `resumen`, `categoria` (`simulador`, `auxilios` o `fuerza`)
- `imagen` (ruta a `src/assets/img/`) e `imagenAlt`
- `duracion`, `asistentes`, `modalidad`, `acreditacion`, `dirigidoA`
- `fechas`: lista de convocatorias con `inicio`, `fin` (opcional), `lugar` y `plazasLibres` (opcional; `0` = completo)
- `ejemplo: true` muestra el aviso de «contenido provisional»; quítalo en los cursos reales

Debajo de la cabecera va el texto del curso (objetivos, programa…) en Markdown.
El calendario de `/formacion/` se genera con todas las fechas futuras; las pasadas se ocultan al compilar,
así que hay que recompilar la web periódicamente (o al añadir fechas).

## Provisional

- Teléfono, CIF, razón social y dirección en `src/data/site.ts` son **ficticios**.
- Los 6 cursos y sus fechas son de ejemplo (`ejemplo: true`).
- Las fotos se sacaron del dossier comercial y del catálogo de RE-liON; habrá que sustituirlas.
- El formulario aún no envía (falta el backend del alojamiento).
- Pendiente de revisar: uso de logos oficiales de clientes de RE-liON, fuente de las cifras de impacto (75 %, 25 %, 30 %) y la falta de referencias en España.
- `robots: noindex` activado en `BaseLayout.astro` hasta publicar.
