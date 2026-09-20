import { ETIQUETA_RIESGO, type Carrera, type TipoPeriodo } from '@/data/tipos';
import { Fuente } from '@/components/Fuente';

const NOMBRE_PERIODO: Record<TipoPeriodo, [string, string]> = {
  semestre: ['Semestre', 'Semestres'],
  cuatrimestre: ['Cuatrimestre', 'Cuatrimestres'],
  modulo: ['Módulo', 'Módulos'],
};

/** Qué estudias, periodo por periodo, con las materias que tumban gente marcadas.
 *  La marca se explica en una leyenda: un color sin explicación no informa. */
export function MapaMaterias({ carrera }: { carrera: Carrera }) {
  const { mapaMaterias: mapa } = carrera;
  const [singular] = NOMBRE_PERIODO[mapa.tipoPeriodo];
  const totalRiesgo = mapa.periodos.reduce(
    (suma, periodo) => suma + periodo.materias.filter((m) => m.riesgo).length,
    0
  );

  return (
    <div className="space-y-3">
      <p className="text-chico text-tinta-suave">
        {mapa.periodos.length} {NOMBRE_PERIODO[mapa.tipoPeriodo][mapa.periodos.length === 1 ? 0 : 1].toLowerCase()} ·{' '}
        {totalRiesgo} materias marcadas como difíciles
      </p>

      <p className="flex flex-wrap items-center gap-2 text-micro">
        <span className="inline-flex items-center gap-1 rounded-full bg-atencion-suave px-2 py-1">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-atencion-suave" />
          Se reprueba mucho o es materia filtro
        </span>
      </p>

      <ol className="space-y-3">
        {mapa.periodos.map((periodo) => (
          <li key={periodo.numero} className="tarjeta">
            <p className="text-chico font-semibold">
              {singular} {periodo.numero}
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {periodo.materias.map((materia) => (
                <li
                  key={materia.nombre}
                  className={[
                    'rounded-lg px-2 py-1 text-chico',
                    materia.riesgo
                      ? 'bg-atencion-suave font-medium text-tinta ring-1 ring-atencion'
                      : 'bg-superficie-2 text-tinta-suave',
                  ].join(' ')}
                >
                  {materia.nombre}
                  {materia.riesgo && (
                    <span className="sr-only"> — {ETIQUETA_RIESGO[materia.riesgo]}</span>
                  )}
                  {materia.riesgo && (
                    <span aria-hidden="true" className="ml-1 text-atencion">
                      ●
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      {mapa.estado === 'plantilla' ? (
        <p className="rounded-xl2 bg-superficie-2 p-3 text-micro text-tinta-suave">
          Estas son las materias típicas de esta carrera en México, no el plan de una universidad en
          particular. Cada escuela cambia el orden y algunos nombres: revisa el plan de la escuela que te
          interesa antes de decidir.
        </p>
      ) : (
        mapa.fuentePlan && <Fuente fuente={mapa.fuentePlan} />
      )}
    </div>
  );
}
