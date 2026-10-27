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

export type NavLink = { label: string; href: string; desc?: string };
export type NavItem = NavLink & { soon?: boolean; children?: NavLink[] };

// Menú principal. Los elementos con `children` se muestran como desplegable;
// su `href` es el destino en el pie y el enlace «Ver todo» del desplegable.
export const nav: NavItem[] = [
  {
    label: 'Soluciones',
    href: '/simulador/',
    children: [
      { label: 'Simulador VR', href: '/simulador/', desc: 'Entrenamiento inmersivo RE-liON en tu jefatura' },
      { label: 'Jornadas con simulador', href: '/formacion/#simulador', desc: 'Equipo e instructores incluidos' },
      { label: 'Primeros auxilios tácticos', href: '/formacion/#auxilios', desc: 'Asistencia bajo amenaza, con Iberotac' },
      { label: 'Uso de la fuerza no letal', href: '/formacion/#fuerza', desc: 'Control, arresto y defensa ante armas' },
    ],
  },
  {
    label: 'Para quién',
    href: '/soluciones/policia-local/',
    children: [
      { label: 'Policía Local', href: '/soluciones/policia-local/', desc: 'Formación continua obligatoria' },
      { label: 'FCSE y unidades especiales', href: '/soluciones/fcse/', desc: 'Intervención en equipo y medición' },
      { label: 'Fuerzas Armadas', href: '/soluciones/defensa/', desc: 'Escuadras, drones y ensayo de misión' },
    ],
  },
  { label: 'Formación', href: '/formacion/' },
  {
    label: 'Recursos',
    href: '/normativa/',
    children: [
      { label: 'Cómo contratar', href: '/contratar/', desc: 'Modalidades y tramitación en tu ayuntamiento' },
      { label: 'Normativa', href: '/normativa/', desc: 'Ley 6/2023 y Decreto 8/2026' },
      { label: 'Calculadora de ahorro', href: '/normativa/#calculadora', desc: 'Lo que te cuesta seguir igual' },
      { label: 'Preguntas frecuentes', href: '/preguntas-frecuentes/', desc: 'Espacio, mareo, datos, acreditación…' },
    ],
  },
  { label: 'Nosotros', href: '/nosotros/' },
];

// Enlaces que solo van en el pie (la tienda vuelve al menú cuando se lance)
export const footerExtra: NavItem[] = [{ label: 'Tienda', href: '/tienda/', soon: true }];
