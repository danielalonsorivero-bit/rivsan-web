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

## Provisional

- Teléfono, CIF, razón social y dirección en `src/data/site.ts` son **ficticios**.
- Las fotos se sacaron del dossier comercial y del catálogo de RE-liON; habrá que sustituirlas.
- El formulario aún no envía (falta el backend del alojamiento).
- Pendiente de revisar: uso de logos oficiales de clientes de RE-liON, fuente de las cifras de impacto (75 %, 25 %, 30 %) y la falta de referencias en España.
- `robots: noindex` activado en `BaseLayout.astro` hasta publicar.
