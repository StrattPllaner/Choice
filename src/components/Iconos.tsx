/** Iconos en SVG inline (sin librería de iconos: ~0 KB y se pintan con currentColor). */
type Props = { className?: string };

const comunes = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
};

export const IconoInicio = ({ className }: Props) => (
  <svg {...comunes} className={className}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </svg>
);

export const IconoExplorar = ({ className }: Props) => (
  <svg {...comunes} className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const IconoMapa = ({ className }: Props) => (
  <svg {...comunes} className={className}>
    <path d="m9 4 6 2 5-2v14l-5 2-6-2-5 2V6z" />
    <path d="M9 4v14M15 6v14" />
  </svg>
);

export const IconoPerfil = ({ className }: Props) => (
  <svg {...comunes} className={className}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
  </svg>
);
