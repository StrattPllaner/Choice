import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/** Avisos emergentes (toasts).
 *
 *  Sirven para la confirmación inmediata: la acción se pinta como hecha al instante y,
 *  si la operación real falla, el mismo aviso ofrece deshacer o reintentar.
 */

export type TonoAviso = 'neutro' | 'exito' | 'error';

export interface Aviso {
  id: number;
  texto: string;
  tono: TonoAviso;
  accion?: { etiqueta: string; alActivar: () => void };
}

interface ValorAvisos {
  mostrar: (aviso: Omit<Aviso, 'id'>) => void;
}

const Contexto = createContext<ValorAvisos | null>(null);

const TONOS: Record<TonoAviso, string> = {
  neutro: 'bg-superficie text-tinta border-borde',
  exito: 'bg-exito-suave text-exito border-exito',
  error: 'bg-error-suave text-error border-error',
};

export function ProveedorAvisos({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  const mostrar = useCallback((aviso: Omit<Aviso, 'id'>) => {
    const id = Date.now() + Math.random();
    setAvisos((previos) => [...previos.slice(-2), { ...aviso, id }]);
    window.setTimeout(() => setAvisos((previos) => previos.filter((a) => a.id !== id)), aviso.accion ? 7000 : 4000);
  }, []);

  const valor = useMemo(() => ({ mostrar }), [mostrar]);

  return (
    <Contexto.Provider value={valor}>
      {children}
      {/* aria-live para que el lector de pantalla también reciba la confirmación */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4"
      >
        {avisos.map((aviso) => (
          <div
            key={aviso.id}
            className={`entra pointer-events-auto flex w-full max-w-contenido items-center justify-between gap-3 rounded-chico border px-4 py-3 text-chico shadow-2 ${TONOS[aviso.tono]}`}
          >
            <span>{aviso.texto}</span>
            {aviso.accion && (
              <button
                type="button"
                onClick={aviso.accion.alActivar}
                className="toque anillo-foco shrink-0 font-medium underline"
              >
                {aviso.accion.etiqueta}
              </button>
            )}
          </div>
        ))}
      </div>
    </Contexto.Provider>
  );
}

export function usarAvisos() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('usarAvisos debe usarse dentro de <ProveedorAvisos>');
  return contexto;
}
