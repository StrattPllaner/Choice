import { useState } from 'react';
import { usarPulso } from '@/lib/pulso';

/** Chip de filtro. Al seleccionarse da un rebote corto: es la confirmación de que
 *  el toque sí registró, que en pantallas lentas no siempre es obvio. */
export function Chip({
  etiqueta,
  seleccionado,
  onCambio,
  deshabilitado,
  cuenta,
}: {
  etiqueta: string;
  seleccionado: boolean;
  onCambio: (seleccionado: boolean) => void;
  deshabilitado?: boolean;
  cuenta?: number;
}) {
  const [confirmando, setConfirmando] = useState(false);
  const { propsPulso } = usarPulso<HTMLButtonElement>();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={seleccionado}
      disabled={deshabilitado}
      {...(deshabilitado ? {} : propsPulso)}
      onClick={() => {
        onCambio(!seleccionado);
        if (!seleccionado) {
          setConfirmando(true);
          window.setTimeout(() => setConfirmando(false), 240);
        }
      }}
      className={[
        'toque ondulado anillo-foco rounded-lleno border px-4 py-2 text-chico font-medium',
        'transition-colors duration-estado ease-entrada disabled:opacity-50',
        confirmando ? 'confirma' : '',
        seleccionado
          ? 'border-primario bg-primario-suave text-primario'
          : 'border-borde-fuerte bg-superficie text-tinta',
      ].join(' ')}
    >
      {etiqueta}
      {cuenta !== undefined && <span className="ml-2 text-tinta-suave">{cuenta}</span>}
    </button>
  );
}
