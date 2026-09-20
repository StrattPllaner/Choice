import type { HTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  /** Si es clickeable, se eleva al pasar el cursor. */
  interactiva?: boolean;
  children: ReactNode;
}

export function Tarjeta({
  interactiva,
  className = '',
  children,
  ...resto
}: Props & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`tarjeta ${interactiva ? 'elevable' : ''} ${className}`} {...resto}>
      {children}
    </div>
  );
}

export function TarjetaEnlace({ a, className = '', children }: { a: string; className?: string; children: ReactNode }) {
  return (
    <Link to={a} className={`tarjeta elevable anillo-foco block ${className}`}>
      {children}
    </Link>
  );
}
