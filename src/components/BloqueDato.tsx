import type { ReactNode } from 'react';
import type { Dato } from '@/data/tipos';
import { tieneFuente } from '@/data/reglas.js';
import { ListaFuentes } from './Fuente';

/** Un dato duro se pinta de una de dos formas: con su valor y su fuente a la vista,
 *  o como "Dato no disponible" con el motivo. Nunca con un número estimado. */
export function BloqueDato<T>({
  etiqueta,
  dato,
  porQueFalta,
  aclaracion,
  children,
}: {
  etiqueta: string;
  dato: Dato<T>;
  /** Por qué todavía no hay dato. El alumno merece saberlo. */
  porQueFalta: string;
  /** Aclaración obligatoria del dato (p. ej. que es mediana y no el mejor caso). */
  aclaracion?: string;
  children: (valor: T) => ReactNode;
}) {
  const hay = tieneFuente(dato);

  return (
    <div className="border-t border-borde pt-3 first:border-t-0 first:pt-0">
      <p className="text-chico font-semibold">{etiqueta}</p>
      {hay ? (
        <>
          <div className="mt-1 text-base">{children((dato as { valor: T }).valor)}</div>
          {aclaracion && <p className="mt-1 text-micro text-tinta-suave">{aclaracion}</p>}
          <ListaFuentes fuentes={(dato as { fuentes: Parameters<typeof ListaFuentes>[0]['fuentes'] }).fuentes} />
        </>
      ) : (
        <div className="mt-1">
          <p className="text-base text-tinta-suave">Dato no disponible</p>
          <p className="mt-1 text-micro text-tinta-suave">{porQueFalta}</p>
        </div>
      )}
    </div>
  );
}
