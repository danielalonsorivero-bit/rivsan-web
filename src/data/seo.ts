import { site } from './site';

// Indexación en buscadores: desactivada hasta publicar.
// Para activarla, compilar con PUBLIC_INDEXABLE=true (p. ej. en un archivo .env del alojamiento).
export const indexable = import.meta.env.PUBLIC_INDEXABLE === 'true';

/** Datos estructurados de la organización (schema.org), presentes en todas las páginas. */
export const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${site.url}/#organizacion`,
  name: site.name,
  legalName: site.legalName,
  description: site.description,
  url: site.url,
  logo: `${site.url}/favicon.svg`,
  email: site.email,
  telephone: site.phone,
  address: {
    '@type': 'PostalAddress',
    streetAddress: site.street,
    postalCode: site.postalCode,
    addressLocality: site.city,
    addressCountry: 'ES',
  },
  areaServed: 'ES',
};
