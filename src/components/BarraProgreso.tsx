/** Barra de progreso. El relleno se mueve con transform (scaleX), no con width:
 *  animar el ancho obliga a recalcular el layout en cada cuadro. */
export function BarraProgreso({
  actual,
  total,
  etiqueta = 'Avance',
  mostrarTexto = true,
}: {
  actual: number;
  total: number;
  etiqueta?: string;
  mostrarTexto?: boolean;
}) {
  const proporcion = total === 0 ? 0 : Math.min(actual / total, 1);

  return (
    <div className="space-y-1">
      <div
        role="progressbar"
        aria-label={etiqueta}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={actual}
        aria-valuetext={`${actual} de ${total}`}
        className="h-2 w-full overflow-hidden rounded-lleno bg-superficie-2"
      >
        <div
          className="h-full origin-left rounded-lleno bg-primario transition-transform duration-estado ease-entrada"
          style={{ transform: `scaleX(${proporcion})` }}
        />
      </div>
      {mostrarTexto && (
        <p className="text-micro text-tinta-suave">
          {actual} de {total}
        </p>
      )}
    </div>
  );
}
