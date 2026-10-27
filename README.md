# RIVSAN · Web

Web de presentación de RIVSAN (formación táctica inmersiva, socio exclusivo de RE-liON en España). Hecha con [Astro](https://astro.build), genera HTML estático.

## Uso

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # genera dist/ para subir al alojamiento
```

## Panel de administración

Con `npm run dev` abierto, entra en **http://localhost:4321/admin/**. Desde ahí se puede:

- Crear, editar y borrar **cursos**: ficha, imagen (o subir una nueva), convocatorias con plazas libres y el texto en Markdown.
- Cambiar los **datos de empresa**: email, teléfono, dirección, datos fiscales, lema y descripción.

El panel solo existe en tu ordenador: escribe directamente en los archivos del proyecto
(`src/content/cursos/*.md`, `src/assets/img/` y `src/data/empresa.json`) y **no se incluye en `npm run build`**.
Los cambios se ven al momento en la web local; para publicarlos hay que compilar y subir `dist/` como siempre
(y, si usas git, hacer commit de los archivos cambiados). El código está en `admin/` y se activa en `astro.config.mjs`.

## Versión de muestra (GitHub Pages)

Cada push a `main` publica la web en **https://danielalonsorivero-bit.github.io/rivsan-web/**
(`.github/workflows/pages.yml`). Esa compilación:

- va en la subcarpeta `/rivsan-web/` (`BASE_PATH`); `integrations/base-links.mjs` adapta los enlaces del HTML,
- no se indexa (como siempre sin `PUBLIC_INDEXABLE`),
- pide contraseña (`PUBLIC_PASSWORD_HASH`, SHA-256 de la contraseña; ver `src/components/Gate.astro`).
  Es una barrera de cortesía, no seguridad: el repositorio es público. Para cambiarla:
  `printf '%s' 'nueva' | shasum -a 256` y sustituir el valor en el workflow.

En local (`npm run dev` / `npm run build` sin variables) la web va en la raíz y sin contraseña.

## Publicación

- La web **no se indexa** en buscadores por defecto (`noindex` en las páginas y `Disallow: /` en `robots.txt`).
  Para publicarla de verdad, compilar con la variable `PUBLIC_INDEXABLE=true`:
  ```bash
  PUBLIC_INDEXABLE=true npm run build
  ```
  Así se quita el `noindex`, `robots.txt` permite el rastreo y apunta al sitemap.
- El sitemap se genera solo (`sitemap-index.xml`). El dominio canónico es `https://rivsan.es`
  (`astro.config.mjs`); en el alojamiento, `rivsan.com` debe redirigir con un 301 a `rivsan.es`.
- Datos estructurados (schema.org): organización en todas las páginas y `Course` con sus convocatorias en cada curso.

## Estructura

- `src/pages/index.astro`: página de inicio
- `src/pages/simulador.astro`: página del simulador VR
- `src/pages/soluciones/[perfil].astro`: una página por perfil (Policía Local, FCSE, Fuerzas Armadas); contenidos en `src/data/perfiles.ts`
- `src/pages/contratar.astro`: modalidades y cómo tramitar la contratación desde un ayuntamiento
- `src/pages/preguntas-frecuentes.astro`: preguntas frecuentes (con datos estructurados `FAQPage`)
- `src/pages/nosotros.astro`: sobre RIVSAN, RE-liON y alianzas
- `src/pages/normativa.astro`: marco legal y calculadora de ahorro
- `src/pages/tienda.astro`: tienda (próximamente) con registro de interesados
- `src/pages/legal/`: aviso legal, privacidad y cookies (plantilla en `src/layouts/LegalLayout.astro`)
- `src/pages/formacion/`: catálogo, calendario y fichas de cursos
- `src/components/Crosshair.astro`: cursor de punto de mira, solo dentro de las secciones marcadas con `data-xh-zone` (hero y simulador; solo con ratón; sin estela con «reducir movimiento»)
- `src/components/AarDemo.astro`: demo interactiva de la revisión posterior (vista cenital, línea de tiempo y métricas; datos ilustrativos), en la home y en `/simulador/#aar`
- `src/components/LiveEditDemo.astro`: el instructor activa factores de estrés (oscuridad, humo, civil, obstáculo, comunicaciones) sobre el escenario; en `/simulador/#aar`
- `src/components/ForceDemo.astro`: esquema interactivo del uso progresivo de la fuerza con el curso que entrena cada nivel; en `/formacion/` y en los perfiles de Policía Local y FCSE
- `src/components/CounterDroneDemo.astro`: mini ejercicio de 20 s en un radar (clic, Espacio o botón para disparar); en el perfil de Defensa
- Estilo: `--font-data` (IBM Plex Mono) para antetítulos y cifras; clase `.theme-light` para secciones en claro; las cifras con `data-count` se animan al aparecer
- `src/components/home/`: secciones de la home
- `src/components/`: cabecera, pie, logo y formulario de contacto
- `src/data/site.ts`: datos de empresa y navegación con desplegables (los editables, en `src/data/empresa.json`)
- `src/components/PageHero.astro`: cabecera común de las páginas interiores nuevas
- `admin/`: panel de administración local (solo `npm run dev`)
- `src/styles/global.css`: colores, tipografías y utilidades
- `src/assets/img/`: fotos (se optimizan a WebP al compilar)
- `logo/`: logos originales en SVG/PDF

## Cursos

Lo más cómodo es gestionarlos desde el panel (`/admin/`). Cada curso es un archivo Markdown en `src/content/cursos/`. El nombre del archivo da la URL
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

- Teléfono, CIF, razón social, dirección, registro mercantil y email de privacidad (`src/data/empresa.json`, editables desde el panel) son **ficticios**.
- Los textos legales son un borrador: debe revisarlos un profesional y quitar el aviso de `LegalLayout.astro`. Si se añade analítica o la tienda usa cookies, hay que actualizar la política de cookies y poner un banner de consentimiento.
- Los 6 cursos y sus fechas son de ejemplo (`ejemplo: true`).
- Las fotos se sacaron del dossier comercial y del catálogo de RE-liON; habrá que sustituirlas.
- Los formularios (contacto, cursos y registro de la tienda) aún no envían ni guardan nada (falta el backend del alojamiento).
- Las categorías de la tienda son orientativas.
- `/contratar/` (contrato menor, gasto corriente, certificado de exclusividad): **validar con un asesor de contratación pública** antes de publicar.
- Preguntas frecuentes: las respuestas marcadas con `(*)` en `preguntas-frecuentes.astro` (espacio, mareo, conexión, acreditación, datos) deben confirmarse con RE-liON / el estado de la homologación.
- Las cifras de impacto de RE-liON (75 %, 25 %, 30 %) ya no salen en la home; siguen en `/nosotros/` hasta tener la fuente.
- Pendiente de revisar: uso de logos oficiales de clientes de RE-liON, fuente de las cifras de impacto (75 %, 25 %, 30 %) y la falta de referencias en España.
