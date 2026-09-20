/** Calculadora de retorno de inversión educativa.
 *
 *  Toda la aritmética vive aquí, separada de la pantalla, para que se pueda auditar y probar.
 *  Regla del proyecto: esto NO inventa datos. Los montos los pone el usuario o vienen de una
 *  ficha con fuente citada; la calculadora solo los combina y siempre enseña los supuestos.
 *
 *  Lo que NO modela, a propósito y dicho en pantalla:
 *  - inflación y aumentos de sueldo (sería suponer una tasa que no tenemos de fuente;
 *    dejarla fuera es conservador e igual para todas las rutas)
 *  - deuda, intereses, becas parciales, cambios de ciudad, reprobar semestres
 *  - que consigas trabajo de lo que estudiaste: es la suposición más fuerte de todas
 */

export const VERSION_MODELO = '1.0.0';

export type DedicacionTrabajo = 'nada' | 'medio' | 'completo';

/** Qué fracción de un sueldo completo alcanzas a ganar mientras estudias. */
export const FRACCION_TRABAJO: Record<DedicacionTrabajo, number> = {
  nada: 0,
  medio: 0.5,
  completo: 1,
};

export const ETIQUETA_DEDICACION: Record<DedicacionTrabajo, string> = {
  nada: 'No voy a trabajar mientras estudio',
  medio: 'Voy a trabajar medio tiempo',
  completo: 'Voy a trabajar tiempo completo',
};

export interface Ruta {
  id: string;
  nombre: string;
  duracionAnios: number;
  /** Colegiatura mensual. En pública suele ser 0 o casi. */
  colegiaturaMensualMxn: number;
  /** Vida, transporte, materiales: lo que sale del bolsillo por estudiar. */
  gastosMensualesMxn: number;
  /** Sueldo mensual esperado al egresar. */
  ingresoEsperadoMensualMxn: number;
  /** De dónde salió el ingreso: de una ficha con fuente o un supuesto del usuario. */
  origenIngreso: 'fuente' | 'supuesto';
  dedicacion: DedicacionTrabajo;
}

export interface Supuestos {
  /** Lo que ganarías si te pusieras a trabajar en lugar de estudiar. */
  ingresoSinCarreraMensualMxn: number;
  /** Horizonte de la proyección, en años desde que empiezas. */
  horizonteAnios: number;
}

export interface ResultadoRuta {
  ruta: Ruta;
  /** Colegiatura + gastos durante toda la carrera. */
  costoDirectoMxn: number;
  /** Lo que dejas de ganar por no trabajar (o trabajar menos) mientras estudias. */
  costoOportunidadMxn: number;
  /** Directo + oportunidad. */
  inversionTotalMxn: number;
  ingresoAnualEsperadoMxn: number;
  /** Cuánto más al año ganas que si no hubieras estudiado. */
  diferencialAnualMxn: number;
  /** Años desde que egresas hasta recuperar la inversión. null = no se recupera con estos supuestos. */
  aniosParaRecuperar: number | null;
  /** Año (desde que empiezas) en que el acumulado alcanza al de no estudiar. */
  anioDeCruce: number | null;
  /** Acumulado neto año por año, desde el año 0. */
  acumulado: number[];
}

const redondear = (monto: number) => Math.round(monto);

/** Acumulado neto del año 0 al horizonte: lo que llevas ganado menos lo que llevas gastado. */
function serieAcumulada(ruta: Ruta, supuestos: Supuestos): number[] {
  const fraccion = FRACCION_TRABAJO[ruta.dedicacion];
  const serie: number[] = [0];
  let acumulado = 0;

  for (let anio = 1; anio <= supuestos.horizonteAnios; anio++) {
    const estudiando = anio <= ruta.duracionAnios;
    if (estudiando) {
      const ingreso = supuestos.ingresoSinCarreraMensualMxn * fraccion * 12;
      const egreso = (ruta.colegiaturaMensualMxn + ruta.gastosMensualesMxn) * 12;
      acumulado += ingreso - egreso;
    } else {
      acumulado += ruta.ingresoEsperadoMensualMxn * 12;
    }
    serie.push(redondear(acumulado));
  }
  return serie;
}

/** Línea de referencia: ponerse a trabajar desde ya, sin estudiar. */
export function serieSinEstudiar(supuestos: Supuestos): number[] {
  const serie: number[] = [0];
  for (let anio = 1; anio <= supuestos.horizonteAnios; anio++) {
    serie.push(redondear(supuestos.ingresoSinCarreraMensualMxn * 12 * anio));
  }
  return serie;
}

export function calcularRuta(ruta: Ruta, supuestos: Supuestos): ResultadoRuta {
  const meses = ruta.duracionAnios * 12;
  const fraccion = FRACCION_TRABAJO[ruta.dedicacion];

  const costoDirectoMxn = redondear((ruta.colegiaturaMensualMxn + ruta.gastosMensualesMxn) * meses);
  const costoOportunidadMxn = redondear(supuestos.ingresoSinCarreraMensualMxn * (1 - fraccion) * meses);
  const inversionTotalMxn = costoDirectoMxn + costoOportunidadMxn;

  const ingresoAnualEsperadoMxn = redondear(ruta.ingresoEsperadoMensualMxn * 12);
  const diferencialAnualMxn = redondear(
    (ruta.ingresoEsperadoMensualMxn - supuestos.ingresoSinCarreraMensualMxn) * 12
  );

  const aniosParaRecuperar =
    diferencialAnualMxn > 0 ? Math.round((inversionTotalMxn / diferencialAnualMxn) * 10) / 10 : null;

  const acumulado = serieAcumulada(ruta, supuestos);
  const referencia = serieSinEstudiar(supuestos);
  const indiceCruce = acumulado.findIndex(
    (valor, anio) => anio > ruta.duracionAnios && valor >= (referencia[anio] ?? 0)
  );

  return {
    ruta,
    costoDirectoMxn,
    costoOportunidadMxn,
    inversionTotalMxn,
    ingresoAnualEsperadoMxn,
    diferencialAnualMxn,
    aniosParaRecuperar,
    anioDeCruce: indiceCruce === -1 ? null : indiceCruce,
    acumulado,
  };
}

export interface Comparacion {
  supuestos: Supuestos;
  rutas: ResultadoRuta[];
  referencia: number[];
  /** Acumulado de cada ruta en los cortes que importan. */
  cortes: { anio: number; valores: { rutaId: string; monto: number }[] }[];
}

export const ANIOS_DE_CORTE = [5, 10];

export function compararRutas(rutas: Ruta[], supuestos: Supuestos): Comparacion {
  const resultados = rutas.map((ruta) => calcularRuta(ruta, supuestos));
  return {
    supuestos,
    rutas: resultados,
    referencia: serieSinEstudiar(supuestos),
    cortes: ANIOS_DE_CORTE.filter((anio) => anio <= supuestos.horizonteAnios).map((anio) => ({
      anio,
      valores: resultados.map((resultado) => ({
        rutaId: resultado.ruta.id,
        monto: resultado.acumulado[anio] ?? 0,
      })),
    })),
  };
}

/** Los supuestos en texto, para pintarlos completos junto al resultado. */
export function describirSupuestos(comparacion: Comparacion): string[] {
  const { supuestos } = comparacion;
  const pesos = (monto: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(monto);

  const lineas = [
    `Si no estudiaras, ganarías ${pesos(supuestos.ingresoSinCarreraMensualMxn)} al mes. Ese número lo pusiste tú.`,
    `La proyección va a ${supuestos.horizonteAnios} años contados desde que entras a estudiar.`,
    'Los sueldos se mantienen igual todo el periodo: no suponemos aumentos ni inflación, porque no tenemos una fuente para esa tasa. Afecta parejo a todas las rutas.',
    'No se consideran becas, deudas, intereses, reprobar semestres ni cambiarte de ciudad.',
    'Se supone que terminas la carrera y consigues trabajo de lo que estudiaste. Es la suposición más fuerte de todas y en la vida real no siempre pasa.',
  ];

  for (const { ruta } of comparacion.rutas) {
    lineas.push(
      `${ruta.nombre}: ${ruta.duracionAnios} ${ruta.duracionAnios === 1 ? 'año' : 'años'}, ` +
        `${pesos(ruta.colegiaturaMensualMxn)} de colegiatura y ${pesos(ruta.gastosMensualesMxn)} de gastos al mes, ` +
        `y al salir ganarías ${pesos(ruta.ingresoEsperadoMensualMxn)} al mes ` +
        `(${ruta.origenIngreso === 'fuente' ? 'dato con fuente citada en la ficha' : 'supuesto que pusiste tú'}). ` +
        `${ETIQUETA_DEDICACION[ruta.dedicacion].toLowerCase()}.`
    );
  }
  return lineas;
}
