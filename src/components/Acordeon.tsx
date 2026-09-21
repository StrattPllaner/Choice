import { useId, useState, type ReactNode } from 'react';

/** Acordeón nativo por accesibilidad: botón + región. No se anima el alto
 *  (eso obliga a recalcular layout); se anima la opacidad del contenido. */
export function Acordeon({
  titulo,
  children,
  abiertoInicial = false,
}: {
  titulo: string;
  children: ReactNode;
  abiertoInicial?: boolean;
}) {
  const id = useId();
  const [abierto, setAbierto] = useState(abiertoInicial);

  return (
    <div className="border-b border-borde">
      <h3>
        <button
          type="button"
          aria-expanded={abierto}
          aria-controls={`${id}-panel`}
          onClick={() => setAbierto((previo) => !previo)}
          className="toque ondulado anillo-foco flex w-full items-center justify-between gap-3 py-4 text-left text-base font-medium"
        >
          <span>{titulo}</span>
          <span
            aria-hidden="true"
            className="transition-transform duration-estado ease-entrada"
            style={{ transform: abierto ? 'rotate(180deg)' : 'none' }}
          >
            ▾
          </span>
        </button>
      </h3>
      <div id={`${id}-panel`} role="region" hidden={!abierto} className="entra-pantalla pb-4 text-base text-tinta-suave">
        {abierto && children}
      </div>
    </div>
  );
}
