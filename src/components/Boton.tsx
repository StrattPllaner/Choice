import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

export type VarianteBoton = 'primario' | 'secundario' | 'fantasma' | 'destructivo';
export type TamanoBoton = 'chico' | 'medio' | 'grande';

/** Todo sale de los tokens. Si un valor no está en tokens.css, no se usa aquí. */
const VARIANTES: Record<VarianteBoton, string> = {
  primario: 'bg-primario text-sobre-primario hover:bg-primario-fuerte shadow-1',
  secundario: 'bg-superficie text-tinta border border-borde-fuerte hover:bg-superficie-2',
  fantasma: 'bg-transparent text-primario hover:bg-primario-suave',
  destructivo: 'bg-error text-sobre-estado hover:opacity-90 shadow-1',
};

/** El alto mínimo siempre respeta el área de toque de 44px, incluso en "chico". */
const TAMANOS: Record<TamanoBoton, string> = {
  chico: 'text-chico px-3 py-2 gap-2',
  medio: 'text-base px-5 py-3 gap-2',
  grande: 'text-md px-6 py-4 gap-3',
};

const BASE =
  'toque pulsable anillo-foco relative rounded-chico font-medium ' +
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none';

/** Indicador de carga: aparece a la izquierda del texto, que NO se quita.
 *  El ancho del botón no cambia, para que la interfaz no salte bajo el dedo. */
function Girador() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 shrink-0 rounded-lleno border-2 border-current border-t-transparent opacity-70"
      style={{ animation: 'girar 700ms linear infinite' }}
    />
  );
}

interface Comunes {
  variante?: VarianteBoton;
  tamano?: TamanoBoton;
  anchoCompleto?: boolean;
  cargando?: boolean;
  /** Se anuncia a lectores de pantalla mientras carga. */
  textoCargando?: string;
  children: ReactNode;
}

export function Boton({
  variante = 'primario',
  tamano = 'medio',
  anchoCompleto,
  cargando = false,
  textoCargando = 'Guardando',
  className = '',
  children,
  disabled,
  ...resto
}: Comunes & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={`${BASE} ${VARIANTES[variante]} ${TAMANOS[tamano]} ${anchoCompleto ? 'w-full' : ''} ${className}`}
      {...resto}
    >
      <span
        className="transition-opacity duration-estado ease-entrada"
        style={{ opacity: cargando ? 1 : 0, width: cargando ? undefined : 0, overflow: 'hidden' }}
        aria-hidden={!cargando}
      >
        {cargando && <Girador />}
      </span>
      <span>{children}</span>
      {cargando && <span className="sr-only">{textoCargando}</span>}
    </button>
  );
}

export function BotonEnlace({
  a,
  variante = 'primario',
  tamano = 'medio',
  anchoCompleto,
  className = '',
  children,
  ...resto
}: Comunes & { a: string } & Omit<LinkProps, 'to' | 'children'>) {
  return (
    <Link
      to={a}
      className={`${BASE} ${VARIANTES[variante]} ${TAMANOS[tamano]} ${anchoCompleto ? 'w-full' : ''} ${className}`}
      {...resto}
    >
      {children}
    </Link>
  );
}
