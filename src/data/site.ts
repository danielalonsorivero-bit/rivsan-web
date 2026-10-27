import empresa from './empresa.json';

// Datos generales de la empresa. Los editables (contacto, datos fiscales…) están en
// empresa.json y se cambian desde el panel /admin/ (npm run dev).
// OJO: teléfono, CIF y dirección son ficticios hasta tener los definitivos.
export const site = {
  name: 'RIVSAN',
  ...empresa,
  url: 'https://rivsan.es',
  get phoneHref() {
    return this.phone.replace(/[^\d+]/g, '');
  },
  get address() {
    return `${this.street} · ${this.postalCode} ${this.city}`;
  },
  domains: ['rivsan.es', 'rivsan.com'],
  partner: { name: 'RE-liON', url: 'https://re-lion.com/' },
};

export type NavItem = { label: string; href: string; soon?: boolean };

// Mientras solo existe la home, la navegación apunta a anclas.
// Cuando existan las páginas, sustituir por sus rutas (/simulador, /formacion, ...).
export const nav: NavItem[] = [
  { label: 'Simulador VR', href: '/simulador/' },
  { label: 'Módulos', href: '/simulador/#modulos' },
  { label: 'Formación', href: '/formacion/' },
  { label: 'Normativa', href: '/normativa/' },
  { label: 'Contratación', href: '/#contratacion' },
  { label: 'Nosotros', href: '/nosotros/' },
  { label: 'Tienda', href: '/tienda/', soon: true },
];
