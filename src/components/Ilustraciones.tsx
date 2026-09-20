/** Ilustraciones en SVG inline, con los colores de los tokens.
 *  Sin librerías, sin imágenes externas y sin peso extra de red. */

type Props = { className?: string };

const comunes = {
  viewBox: '0 0 120 96',
  fill: 'none',
  'aria-hidden': true,
  focusable: false,
  className: 'h-24 w-auto',
};

/** Estantería vacía: para "todavía no guardas carreras". */
export const IlustracionGuardadas = ({ className }: Props) => (
  <svg {...comunes} className={className ?? comunes.className}>
    <rect x="16" y="22" width="88" height="58" rx="10" fill="var(--color-superficie-2)" />
    <rect x="16" y="22" width="88" height="58" rx="10" stroke="var(--color-borde)" strokeWidth="2" />
    <path d="M28 46h30M28 58h20" stroke="var(--color-borde-fuerte)" strokeWidth="3" strokeLinecap="round" />
    <path
      d="M78 34l4.2 8.6 9.5 1.4-6.9 6.7 1.6 9.4-8.4-4.4-8.4 4.4 1.6-9.4-6.9-6.7 9.5-1.4z"
      fill="var(--color-acento-suave)"
      stroke="var(--color-acento)"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

/** Lupa sin resultados. */
export const IlustracionBusqueda = ({ className }: Props) => (
  <svg {...comunes} className={className ?? comunes.className}>
    <circle cx="52" cy="44" r="22" fill="var(--color-superficie-2)" stroke="var(--color-borde-fuerte)" strokeWidth="3" />
    <path d="M68 60l16 16" stroke="var(--color-borde-fuerte)" strokeWidth="5" strokeLinecap="round" />
    <path d="M44 44h16" stroke="var(--color-primario)" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

/** Brújula: para el mapa sin contestar. */
export const IlustracionMapa = ({ className }: Props) => (
  <svg {...comunes} className={className ?? comunes.className}>
    <circle cx="60" cy="48" r="28" fill="var(--color-primario-suave)" stroke="var(--color-primario)" strokeWidth="2" />
    <path d="M60 30l7 18 18 7-18 7-7 18-7-18-18-7 18-7z" fill="var(--color-primario)" opacity="0.85" />
  </svg>
);

/** Nube sin conexión / error de red. */
export const IlustracionSinConexion = ({ className }: Props) => (
  <svg {...comunes} className={className ?? comunes.className}>
    <path
      d="M38 62a14 14 0 010-28 20 20 0 0138-6 15 15 0 012 29z"
      fill="var(--color-superficie-2)"
      stroke="var(--color-borde-fuerte)"
      strokeWidth="2"
    />
    <path d="M34 74l52-44" stroke="var(--color-atencion)" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

/** Hoja con esquina doblada: contenido no encontrado. */
export const IlustracionNoEncontrado = ({ className }: Props) => (
  <svg {...comunes} className={className ?? comunes.className}>
    <path
      d="M34 18h34l18 18v42a6 6 0 01-6 6H34a6 6 0 01-6-6V24a6 6 0 016-6z"
      fill="var(--color-superficie-2)"
      stroke="var(--color-borde-fuerte)"
      strokeWidth="2"
    />
    <path d="M68 18v18h18" stroke="var(--color-borde-fuerte)" strokeWidth="2" />
    <path d="M44 56h28M44 66h18" stroke="var(--color-borde)" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

/** Dos tarjetas lado a lado: comparador vacío. */
export const IlustracionComparar = ({ className }: Props) => (
  <svg {...comunes} className={className ?? comunes.className}>
    <rect x="18" y="26" width="38" height="50" rx="8" fill="var(--color-superficie-2)" stroke="var(--color-borde)" strokeWidth="2" />
    <rect x="64" y="26" width="38" height="50" rx="8" fill="var(--color-primario-suave)" stroke="var(--color-primario)" strokeWidth="2" />
    <path d="M28 44h18M28 56h12M74 44h18M74 56h12" stroke="var(--color-borde-fuerte)" strokeWidth="3" strokeLinecap="round" />
  </svg>
);
