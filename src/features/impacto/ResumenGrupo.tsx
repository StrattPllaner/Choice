import { MINIMO_GRUPO, compararAgregados, grupoPublicable, type Agregado } from './calculo';

/** Vista de antes y después de un grupo, lista para enseñarse en una junta.
 *  Si el grupo no llega al mínimo, no se pinta ningún número: se explica por qué. */
export function ResumenGrupo({
  grupo,
  inicial,
  seguimiento,
  periodo,
}: {
  grupo: string;
  inicial: Agregado;
  seguimiento: Agregado;
  periodo?: string;
}) {
  if (!grupoPublicable(inicial.n) || !grupoPublicable(seguimiento.n)) {
    return (
      <div className="tarjeta space-y-2">
        <h3 className="text-base font-semibold">{grupo}</h3>
        <p className="text-chico text-tinta-suave">
          No se muestran resultados: el grupo tiene menos de {MINIMO_GRUPO} respuestas en alguna de las dos
          mediciones ({inicial.n} inicial, {seguimiento.n} seguimiento). Con tan pocas, los promedios
          permitirían identificar a un alumno.
        </p>
      </div>
    );
  }

  const filas = compararAgregados(inicial, seguimiento);
  const formatear = (valor: number, unidad: 'promedio' | 'porcentaje') =>
    unidad === 'porcentaje' ? `${Math.round(valor)}%` : valor.toFixed(1);

  return (
    <section aria-labelledby={`grupo-${grupo}`} className="tarjeta space-y-3">
      <header>
        <h3 id={`grupo-${grupo}`} className="text-base font-semibold">
          {grupo}
        </h3>
        <p className="text-micro text-tinta-suave">
          {inicial.n} alumnos en la primera medición · {seguimiento.n} en la segunda
          {periodo ? ` · ${periodo}` : ''}
        </p>
      </header>

      <table className="w-full text-left text-chico">
        <caption className="sr-only">Comparación del grupo entre la primera y la segunda medición</caption>
        <thead>
          <tr className="border-b border-borde text-micro text-tinta-suave">
            <th scope="col" className="py-1">Indicador</th>
            <th scope="col" className="py-1 text-right">Antes</th>
            <th scope="col" className="py-1 text-right">Después</th>
            <th scope="col" className="py-1 text-right">Cambio</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => {
            const mejoro = fila.subirEsBueno ? fila.cambio > 0 : fila.cambio < 0;
            const empeoro = fila.cambio !== 0 && !mejoro;
            return (
              <tr key={fila.indicador} className="border-b border-borde">
                <th scope="row" className="py-1 pr-2 font-normal">{fila.indicador}</th>
                <td className="py-1 text-right tabular-nums">{formatear(fila.antes, fila.unidad)}</td>
                <td className="py-1 text-right tabular-nums">{formatear(fila.despues, fila.unidad)}</td>
                <td
                  className={[
                    'py-1 text-right tabular-nums',
                    mejoro ? 'text-exito' : empeoro ? 'text-tinta-suave' : '',
                  ].join(' ')}
                >
                  {fila.cambio > 0 ? '+' : ''}
                  {formatear(fila.cambio, fila.unidad)}
                  <span className="sr-only">{mejoro ? ' (mejoró)' : empeoro ? ' (empeoró)' : ' (sin cambio)'}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="text-micro text-tinta-suave">
        Son datos agregados del grupo. Ningún renglón corresponde a un alumno identificable, y el cambio no
        prueba causalidad: no hubo grupo de control.
      </p>
    </section>
  );
}
