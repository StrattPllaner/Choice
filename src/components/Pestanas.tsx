import { useId, useRef, useState, type ReactNode } from 'react';

export interface Pestana {
  id: string;
  etiqueta: string;
  contenido: ReactNode;
}

/** Pestañas con el patrón ARIA completo: flechas para moverse, Home y End,
 *  y solo la activa es tabulable. */
export function Pestanas({ pestanas, inicial }: { pestanas: Pestana[]; inicial?: string }) {
  const base = useId();
  const [activa, setActiva] = useState(inicial ?? pestanas[0]?.id ?? '');
  const botones = useRef<Record<string, HTMLButtonElement | null>>({});

  const mover = (indice: number) => {
    const destino = pestanas[(indice + pestanas.length) % pestanas.length];
    if (!destino) return;
    setActiva(destino.id);
    botones.current[destino.id]?.focus();
  };

  const indiceActual = pestanas.findIndex((p) => p.id === activa);

  return (
    <div>
      <div role="tablist" aria-label="Secciones" className="flex gap-1 overflow-x-auto border-b border-borde">
        {pestanas.map((pestana, indice) => {
          const seleccionada = pestana.id === activa;
          return (
            <button
              key={pestana.id}
              ref={(nodo) => {
                botones.current[pestana.id] = nodo;
              }}
              role="tab"
              id={`${base}-${pestana.id}-tab`}
              aria-selected={seleccionada}
              aria-controls={`${base}-${pestana.id}-panel`}
              tabIndex={seleccionada ? 0 : -1}
              onClick={() => setActiva(pestana.id)}
              onKeyDown={(evento) => {
                if (evento.key === 'ArrowRight') mover(indice + 1);
                if (evento.key === 'ArrowLeft') mover(indice - 1);
                if (evento.key === 'Home') mover(0);
                if (evento.key === 'End') mover(pestanas.length - 1);
              }}
              className={[
                'toque anillo-foco shrink-0 px-4 py-3 text-chico font-medium',
                'transition-colors duration-estado ease-entrada',
                seleccionada ? 'border-b-2 border-primario text-primario' : 'text-tinta-suave',
              ].join(' ')}
            >
              {pestana.etiqueta}
            </button>
          );
        })}
      </div>

      {pestanas.map((pestana) => (
        <div
          key={pestana.id}
          role="tabpanel"
          id={`${base}-${pestana.id}-panel`}
          aria-labelledby={`${base}-${pestana.id}-tab`}
          hidden={pestana.id !== activa}
          tabIndex={0}
          className="entra-pantalla pt-4"
        >
          {pestana.id === activa && pestana.contenido}
        </div>
      ))}
      <span className="sr-only" aria-live="polite">
        {pestanas[indiceActual]?.etiqueta}
      </span>
    </div>
  );
}
