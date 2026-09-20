import type { Comparacion } from './calculo';

/** Gráfica de líneas en SVG inline: sin librería (0 KB extra) y legible en 360px.
 *
 *  Decisiones de lectura:
 *  - dos series de color validado (contraste y separación para daltonismo) más una
 *    línea de referencia gris punteada: "si te pones a trabajar desde ya"
 *  - identidad nunca por color solo: hay leyenda, etiqueta al final de cada línea y tabla
 *  - marcadores en los años 5 y 10, que son los cortes que importan
 *  - sin hover: en celular de gama baja no hay cursor; la tabla de abajo da los números
 */

const ANCHO = 328;
const ALTO = 200;
const MARGEN = { arriba: 16, derecha: 14, abajo: 26, izquierda: 44 };

const COLORES = ['rgb(var(--c-serie-a))', 'rgb(var(--c-serie-b))'];

const enMiles = (monto: number) => {
  if (Math.abs(monto) >= 1_000_000) return `${(monto / 1_000_000).toFixed(1)}M`;
  return `${Math.round(monto / 1000)}k`;
};

const pesos = (monto: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(monto);

export function Grafica({ comparacion }: { comparacion: Comparacion }) {
  const series = comparacion.rutas.map((resultado, indice) => ({
    id: resultado.ruta.id,
    nombre: resultado.ruta.nombre,
    valores: resultado.acumulado,
    color: COLORES[indice % COLORES.length]!,
  }));

  const todos = [...series.flatMap((s) => s.valores), ...comparacion.referencia];
  const maximo = Math.max(...todos, 1);
  const minimo = Math.min(...todos, 0);
  const horizonte = comparacion.supuestos.horizonteAnios;

  const anchoUtil = ANCHO - MARGEN.izquierda - MARGEN.derecha;
  const altoUtil = ALTO - MARGEN.arriba - MARGEN.abajo;
  const x = (anio: number) => MARGEN.izquierda + (anio / horizonte) * anchoUtil;
  const y = (monto: number) => MARGEN.arriba + altoUtil - ((monto - minimo) / (maximo - minimo || 1)) * altoUtil;

  const trazo = (valores: number[]) => valores.map((valor, anio) => `${anio === 0 ? 'M' : 'L'}${x(anio).toFixed(1)},${y(valor).toFixed(1)}`).join(' ');

  const marcas = [minimo, minimo + (maximo - minimo) / 2, maximo];
  const aniosEje = [0, Math.round(horizonte / 2), horizonte];
  const cortes = comparacion.cortes.map((c) => c.anio);

  const resumen = series
    .map((serie) => `${serie.nombre}: ${pesos(serie.valores[horizonte] ?? 0)} acumulados al año ${horizonte}`)
    .join('. ');

  return (
    <figure className="space-y-3">
      <svg
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Dinero acumulado a ${horizonte} años. ${resumen}. Los números exactos están en la tabla de abajo.`}
      >
        {/* rejilla discreta */}
        {marcas.map((marca) => (
          <g key={marca}>
            <line
              x1={MARGEN.izquierda}
              x2={ANCHO - MARGEN.derecha}
              y1={y(marca)}
              y2={y(marca)}
              stroke="rgb(var(--c-borde))"
              strokeWidth={1}
            />
            <text x={MARGEN.izquierda - 6} y={y(marca) + 4} textAnchor="end" fontSize="10" fill="rgb(var(--c-texto-suave))">
              {enMiles(marca)}
            </text>
          </g>
        ))}

        {/* cero, si la escala lo cruza */}
        {minimo < 0 && (
          <line
            x1={MARGEN.izquierda}
            x2={ANCHO - MARGEN.derecha}
            y1={y(0)}
            y2={y(0)}
            stroke="rgb(var(--c-texto-suave))"
            strokeWidth={1}
          />
        )}

        {aniosEje.map((anio) => (
          <text key={anio} x={x(anio)} y={ALTO - 8} textAnchor="middle" fontSize="10" fill="rgb(var(--c-texto-suave))">
            año {anio}
          </text>
        ))}

        {/* referencia: trabajar desde ya */}
        <path d={trazo(comparacion.referencia)} fill="none" stroke="rgb(var(--c-referencia))" strokeWidth={2} strokeDasharray="4 3" />

        {series.map((serie) => (
          <g key={serie.id}>
            <path d={trazo(serie.valores)} fill="none" stroke={serie.color} strokeWidth={2} strokeLinecap="round" />
            {cortes.map((anio) => (
              <circle
                key={anio}
                cx={x(anio)}
                cy={y(serie.valores[anio] ?? 0)}
                r={4}
                fill={serie.color}
                stroke="rgb(var(--c-superficie))"
                strokeWidth={2}
              />
            ))}
          </g>
        ))}
      </svg>

      {/* leyenda: la identidad nunca depende solo del color */}
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-micro">
        {series.map((serie) => (
          <li key={serie.id} className="flex items-center gap-2">
            <span aria-hidden="true" className="h-1 w-4 rounded-full" style={{ background: serie.color }} />
            <span>{serie.nombre}</span>
          </li>
        ))}
        <li className="flex items-center gap-2 text-tinta-suave">
          <span aria-hidden="true" className="h-0.5 w-4 border-t-2 border-dashed border-referencia" />
          <span>Si trabajas desde ya, sin estudiar</span>
        </li>
      </ul>

      <details className="text-chico">
        <summary className="toque cursor-pointer text-primario underline">Ver los números en tabla</summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-micro">
            <caption className="sr-only">Dinero acumulado por año en cada ruta</caption>
            <thead>
              <tr className="border-b border-borde">
                <th scope="col" className="py-1 pr-2">Año</th>
                {series.map((serie) => (
                  <th key={serie.id} scope="col" className="py-1 pr-2">
                    {serie.nombre}
                  </th>
                ))}
                <th scope="col" className="py-1">Sin estudiar</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: horizonte + 1 }, (_, anio) => anio)
                .filter((anio) => anio % 2 === 0 || cortes.includes(anio))
                .map((anio) => (
                  <tr key={anio} className="border-b border-borde">
                    <th scope="row" className="py-1 pr-2 font-normal">{anio}</th>
                    {series.map((serie) => (
                      <td key={serie.id} className="py-1 pr-2 tabular-nums">
                        {pesos(serie.valores[anio] ?? 0)}
                      </td>
                    ))}
                    <td className="py-1 tabular-nums text-tinta-suave">{pesos(comparacion.referencia[anio] ?? 0)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </details>

      <figcaption className="text-micro text-tinta-suave">
        Dinero acumulado: lo que llevas ganado menos lo que llevas gastado en estudiar. No es ahorro real;
        sirve para comparar rutas entre sí con los mismos supuestos.
      </figcaption>
    </figure>
  );
}
