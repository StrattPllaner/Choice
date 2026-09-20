import { useEffect, useRef, type ReactNode } from 'react';
import { atraparFoco } from '@/lib/foco';

/** Hoja inferior (celular) y modal (escritorio).
 *
 *  Las dos atrapan el foco y lo devuelven al cerrar. Entran con opacity + translateY;
 *  nada de animar alto o posición, que es lo que hace que se vean entrecortadas.
 */

function useDialogo(abierto: boolean, alCerrar: () => void) {
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto || !contenedor.current) return;
    const soltar = atraparFoco(contenedor.current, alCerrar);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflowPrevio;
      soltar();
    };
  }, [abierto, alCerrar]);

  return contenedor;
}

interface Props {
  abierto: boolean;
  titulo: string;
  descripcion?: string;
  onCerrar: () => void;
  children: ReactNode;
  /** Acciones al pie (botones). */
  pie?: ReactNode;
}

export function HojaInferior({ abierto, titulo, descripcion, onCerrar, children, pie }: Props) {
  const contenedor = useDialogo(abierto, onCerrar);
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onCerrar}
        className="absolute inset-0 bg-velo"
        style={{ animation: 'aparecer var(--dur-estado) var(--curva-entrada) both' }}
      />
      <div
        ref={contenedor}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        className="relative w-full max-w-contenido rounded-t-hoja bg-superficie p-6 shadow-3"
        style={{ animation: 'subir-hoja var(--dur-entrada) var(--curva-entrada) both' }}
      >
        <div aria-hidden="true" className="mx-auto mb-4 h-1 w-10 rounded-lleno bg-borde-fuerte" />
        <h2 className="text-lg">{titulo}</h2>
        {descripcion && <p className="mt-1 text-chico text-tinta-suave">{descripcion}</p>}
        <div className="mt-4">{children}</div>
        {pie && <div className="mt-6 flex gap-2">{pie}</div>}
      </div>
    </div>
  );
}

export function Modal({ abierto, titulo, descripcion, onCerrar, children, pie }: Props) {
  const contenedor = useDialogo(abierto, onCerrar);
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onCerrar}
        className="absolute inset-0 bg-velo"
        style={{ animation: 'aparecer var(--dur-estado) var(--curva-entrada) both' }}
      />
      <div
        ref={contenedor}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        className="relative w-full max-w-contenido rounded-hoja bg-superficie p-6 shadow-3"
        style={{ animation: 'entrar var(--dur-entrada) var(--curva-entrada) both' }}
      >
        <h2 className="text-lg">{titulo}</h2>
        {descripcion && <p className="mt-1 text-chico text-tinta-suave">{descripcion}</p>}
        <div className="mt-4">{children}</div>
        {pie && <div className="mt-6 flex justify-end gap-2">{pie}</div>}
      </div>
    </div>
  );
}
