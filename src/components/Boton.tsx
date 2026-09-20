import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variante = 'primario' | 'secundario' | 'texto';

const estilos: Record<Variante, string> = {
  primario: 'bg-marca text-sobre-marca hover:bg-marca-fuerte',
  secundario: 'bg-superficie-2 text-texto border border-borde hover:bg-marca-suave',
  texto: 'text-marca underline underline-offset-4',
};

const base =
  'toque gap-2 rounded-xl2 px-5 py-3 text-base font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

interface Comunes {
  variante?: Variante;
  anchoCompleto?: boolean;
  children: ReactNode;
}

export function Boton({
  variante = 'primario',
  anchoCompleto,
  className = '',
  children,
  ...resto
}: Comunes & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`${base} ${estilos[variante]} ${anchoCompleto ? 'w-full' : ''} ${className}`}
      {...resto}
    >
      {children}
    </button>
  );
}

export function BotonEnlace({
  a,
  variante = 'primario',
  anchoCompleto,
  className = '',
  children,
  ...resto
}: Comunes & { a: string } & Omit<React.ComponentProps<typeof Link>, 'to' | 'children'>) {
  return (
    <Link
      to={a}
      className={`${base} ${estilos[variante]} ${anchoCompleto ? 'w-full' : ''} ${className}`}
      {...resto}
    >
      {children}
    </Link>
  );
}
