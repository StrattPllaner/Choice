export function BarraProgreso({
  actual,
  total,
  etiqueta = 'Avance del cuestionario',
}: {
  actual: number;
  total: number;
  etiqueta?: string;
}) {
  const porcentaje = total === 0 ? 0 : Math.round((actual / total) * 100);
  return (
    <div className="space-y-1">
      <div
        role="progressbar"
        aria-label={etiqueta}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={actual}
        aria-valuetext={`Pregunta ${actual} de ${total}`}
        className="h-2 w-full overflow-hidden rounded-full bg-superficie-2"
      >
        <div className="h-full rounded-full bg-marca transition-[width]" style={{ width: `${porcentaje}%` }} />
      </div>
      <p className="text-xs text-texto-suave">
        Pregunta {actual} de {total}
      </p>
    </div>
  );
}
