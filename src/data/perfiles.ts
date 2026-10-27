import type { ImageMetadata } from 'astro';
import policiaLocal from '../assets/img/policia-pabellon.jpg';
import fcse from '../assets/img/operador-anotado.jpg';
import defensa from '../assets/img/relion-operadores.jpg';

// Páginas /soluciones/<slug>/: una por perfil de cliente.
// `interest` coincide con los valores del selector del formulario de contacto.
export type Perfil = {
  slug: string;
  label: string;
  /** Texto corto para el menú y las tarjetas de la home */
  short: string;
  eyebrow: string;
  title: [string, string];
  lead: string;
  image: ImageMetadata;
  alt: string;
  retos: { title: string; text: string }[];
  servicios: { title: string; text: string; href: string }[];
  /** Módulos del simulador recomendados (id del ancla en /simulador/) */
  modulos: { id: string; label: string }[];
  interest: string;
};

export const perfiles: Perfil[] = [
  {
    slug: 'policia-local',
    label: 'Policía Local',
    short: 'Cumple la formación obligatoria sin sacar a tus agentes del municipio.',
    eyebrow: 'Soluciones · Policía Local',
    title: ['Formación continua', 'sin salir de tu jefatura'],
    lead: 'La Ley 6/2023 y el Decreto 8/2026 hacen obligatoria la formación continua en Andalucía. Te ayudamos a cumplirla con más frecuencia, menos coste y sin desplazar a la plantilla.',
    image: policiaLocal,
    alt: 'Dos agentes de policía con visores de realidad virtual entrenando en un pabellón',
    retos: [
      {
        title: 'Formación obligatoria',
        text: 'Hay que planificar, impartir y acreditar formación continua cada año, con plantillas ajustadas.',
      },
      {
        title: 'Presupuesto limitado',
        text: 'Galería externa, munición, dietas y desplazamientos se comen la partida antes de llegar a la práctica.',
      },
      {
        title: 'Turnos que cubrir',
        text: 'Cada salida a la galería son horas fuera de servicio. Entrenar en la jefatura las reduce al mínimo.',
      },
    ],
    servicios: [
      {
        title: 'Jornadas con simulador',
        text: 'Llevamos equipo e instructores: hasta 20 agentes por jornada, sin comprar ni alquilar nada.',
        href: '/formacion/#simulador',
      },
      {
        title: 'Uso de la fuerza no letal',
        text: 'Control y arresto, defensa ante armas de filo e impacto y grappling táctico operativo.',
        href: '/formacion/#fuerza',
      },
      {
        title: 'Primeros auxilios tácticos',
        text: 'Control de hemorragias y asistencia bajo amenaza, con Iberotac.',
        href: '/formacion/#auxilios',
      },
      {
        title: 'Simulador propio',
        text: 'Renting anual o compra para entrenar todo el año con tus propios instructores.',
        href: '/contratar/',
      },
    ],
    modulos: [
      { id: 'identificacion', label: 'Identificación de amenazas' },
      { id: 'tiro', label: 'Tiro táctico' },
      { id: 'cqb', label: 'Desescalada y uso progresivo de la fuerza' },
    ],
    interest: 'jornada',
  },
  {
    slug: 'fcse',
    label: 'FCSE y unidades especiales',
    short: 'Ensaya entradas, perímetros y trabajo en equipo con datos objetivos de cada intervención.',
    eyebrow: 'Soluciones · FCSE',
    title: ['Entrena la unidad', 'como interviene'],
    lead: 'Hasta 12 agentes en el mismo escenario, con armas de peso real y revisión 3D de cada intervención. Para unidades que necesitan repetir lo difícil sin riesgo.',
    image: fcse,
    alt: 'Operador con visor de realidad virtual y anotaciones de los sensores del equipo',
    retos: [
      {
        title: 'Coordinación real',
        text: 'Entradas, perímetros y gestión de masas exigen ensayar con toda la unidad, no solo en binomios.',
      },
      {
        title: 'Decisiones bajo estrés',
        text: 'Identificar la amenaza y graduar la respuesta en milisegundos solo se aprende repitiendo con presión.',
      },
      {
        title: 'Medir el progreso',
        text: 'Sin datos objetivos, la evaluación depende de la impresión del instructor.',
      },
    ],
    servicios: [
      {
        title: 'Simulador VR RE-liON',
        text: 'Hasta 12 agentes simultáneos, sin cables ni sensores fijos, en cualquier instalación.',
        href: '/simulador/',
      },
      {
        title: 'Revisión 3D de la intervención',
        text: 'Conos de visión, tiempos de reacción y trayectorias de disparo, desde cualquier ángulo.',
        href: '/simulador/#aar',
      },
      {
        title: 'Uso de la fuerza no letal',
        text: 'Técnicas operativas de intervención, control y reducción.',
        href: '/formacion/#fuerza',
      },
      {
        title: 'Primeros auxilios tácticos',
        text: 'Atención sanitaria en entornos hostiles, integrada en los escenarios.',
        href: '/formacion/#auxilios',
      },
    ],
    modulos: [
      { id: 'cqb', label: 'Combate en espacios cerrados (CQB)' },
      { id: 'identificacion', label: 'Identificación positiva de amenazas' },
      { id: 'tiro', label: 'Tiro táctico' },
      { id: 'planificacion', label: 'Planificación inmersiva' },
    ],
    interest: 'demo',
  },
  {
    slug: 'defensa',
    label: 'Fuerzas Armadas',
    short: 'Escuadras completas, amenaza dron y ensayo de misión sobre gemelos digitales.',
    eyebrow: 'Soluciones · Defensa',
    title: ['La escuadra completa,', 'en cualquier lugar'],
    lead: 'La misma tecnología que usan las fuerzas armadas de Países Bajos, Alemania o Singapur, desplegable en una base o en zona de operaciones.',
    image: defensa,
    alt: 'Dos operadores con visores de realidad virtual y fusiles simulados',
    retos: [
      {
        title: 'Nuevas amenazas',
        text: 'Los drones FPV y comerciales han cambiado el campo de batalla. Hay que entrenar la respuesta ya.',
      },
      {
        title: 'Desgaste de material',
        text: 'Cada hora de vuelo o de galería consume munición, repuestos y horas de mantenimiento.',
      },
      {
        title: 'Ensayar la misión',
        text: 'Conocer el terreno antes de pisarlo marca la diferencia en la ejecución.',
      },
    ],
    servicios: [
      {
        title: 'Simulador desplegable',
        text: '12 kits por unidad, operativos en menos de 60 minutos, sin infraestructura.',
        href: '/simulador/',
      },
      {
        title: 'Counter-drone',
        text: 'Respuesta con escopeta ante UAV y drones FPV. Desarrollado junto a UKRSOF.',
        href: '/simulador/#counter-drone',
      },
      {
        title: 'Pilotaje de drones',
        text: 'Formación acelerada de operadores UAS sin desgaste de material.',
        href: '/simulador/#pilotaje',
      },
      {
        title: 'Planificación inmersiva e ISR',
        text: 'Gemelos digitales en 3D con dron o LiDAR en 5-10 minutos para ensayar la misión.',
        href: '/simulador/#planificacion',
      },
    ],
    modulos: [
      { id: 'counter-drone', label: 'Counter-drone' },
      { id: 'pilotaje', label: 'Pilotaje de drones' },
      { id: 'planificacion', label: 'Planificación inmersiva e ISR' },
      { id: 'cqb', label: 'Combate en espacios cerrados (CQB)' },
    ],
    interest: 'demo',
  },
];
