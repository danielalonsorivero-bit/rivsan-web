// Datos generales de la empresa.
// OJO: teléfono, CIF y dirección son ficticios hasta tener los definitivos.
export const site = {
  name: 'RIVSAN',
  tagline: 'Formación Táctica Inmersiva',
  description:
    'Simulación y entrenamiento táctico inmersivo en realidad virtual para Fuerzas y Cuerpos de Seguridad. Socio exclusivo de RE-liON en España.',
  url: 'https://rivsan.es',
  email: 'info@rivsan.com',
  phone: '+34 900 000 000',
  phoneHref: '+34900000000',
  legalName: 'RIVSAN Formación Táctica S.L.',
  cif: 'B00000000',
  address: 'Calle Ejemplo, 1 · 41001 Sevilla',
  partner: { name: 'RE-liON', url: 'https://re-lion.com/' },
};

export type NavItem = { label: string; href: string; soon?: boolean };

// Mientras solo existe la home, la navegación apunta a anclas.
// Cuando existan las páginas, sustituir por sus rutas (/simulador, /formacion, ...).
export const nav: NavItem[] = [
  { label: 'Simulador VR', href: '/#simulador' },
  { label: 'Módulos', href: '/#modulos' },
  { label: 'Formación', href: '/formacion/' },
  { label: 'Normativa', href: '/#normativa' },
  { label: 'Contratación', href: '/#contratacion' },
  { label: 'Tienda', href: '/#tienda', soon: true },
];
