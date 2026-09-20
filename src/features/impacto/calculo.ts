import { REACTIVOS_IMPACTO, UMBRAL_SIN_RUMBO, VERSION_INSTRUMENTO } from './instrumento';

/** Indicadores individuales y agregados de la medición de impacto.
 *
 *  Regla dura del módulo: a la escuela solo le llegan agregados, y solo si el grupo tiene
 *  al menos MINIMO_GRUPO respuestas. Con menos, un agregado permite reidentificar a un alumno.
 */

export const MINIMO_GRUPO = 10;

export type MomentoMedicion = 'inicial' | 'seguimiento';

export interface Medicion {
  momento: MomentoMedicion;
  fecha: string;
  versionInstrumento: string;
  /** id de reactivo → número. De las preguntas abiertas se guarda solo el conteo. */
  respuestas: Record<string, number>;
}

export interface IndicadoresAlumno {
  carrerasNombradas: number;
  becasNombradas: number;
  tsuNombradas: number;
  seguridad: number;
  sabeBecas: number;
  conoceTsu: number;
  sabeCosto: number;
  sabeSueldo: number;
  sabePasos: number;
  tieneOpcion: number;
  sinRumbo: boolean;
}

export function indicadores(medicion: Medicion): IndicadoresAlumno {
  const valor = (id: string) => medicion.respuestas[id] ?? 0;
  return {
    carrerasNombradas: valor('carreras_nombradas'),
    becasNombradas: valor('becas_nombradas'),
    tsuNombradas: valor('tsu_nombradas'),
    seguridad: valor('seguridad'),
    sabeBecas: valor('sabe_becas'),
    conoceTsu: valor('conoce_tsu'),
    sabeCosto: valor('sabe_costo'),
    sabeSueldo: valor('sabe_sueldo'),
    sabePasos: valor('sabe_pasos'),
    tieneOpcion: valor('tiene_opcion'),
    sinRumbo: valor('seguridad') <= UMBRAL_SIN_RUMBO,
  };
}

export interface Agregado {
  n: number;
  promedioCarrerasNombradas: number;
  promedioBecasNombradas: number;
  promedioTsuNombradas: number;
  promedioSeguridad: number;
  porcentajeSinRumbo: number;
  porcentajeConoceTsu: number;
  porcentajeSabeBecas: number;
  porcentajeSabeCosto: number;
  porcentajeSabeSueldo: number;
  porcentajeSabePasos: number;
  porcentajeConOpcion: number;
}

const promedio = (valores: number[]) => (valores.length ? valores.reduce((s, v) => s + v, 0) / valores.length : 0);
const porcentaje = (valores: number[], cumple: (v: number) => boolean) =>
  valores.length ? (valores.filter(cumple).length / valores.length) * 100 : 0;

export function agregar(mediciones: Medicion[]): Agregado {
  const datos = mediciones.map(indicadores);
  return {
    n: datos.length,
    promedioCarrerasNombradas: promedio(datos.map((d) => d.carrerasNombradas)),
    promedioBecasNombradas: promedio(datos.map((d) => d.becasNombradas)),
    promedioTsuNombradas: promedio(datos.map((d) => d.tsuNombradas)),
    promedioSeguridad: promedio(datos.map((d) => d.seguridad)),
    porcentajeSinRumbo: porcentaje(datos.map((d) => d.seguridad), (v) => v <= UMBRAL_SIN_RUMBO),
    porcentajeConoceTsu: porcentaje(datos.map((d) => d.conoceTsu), (v) => v >= 1),
    porcentajeSabeBecas: porcentaje(datos.map((d) => d.sabeBecas), (v) => v >= 1),
    porcentajeSabeCosto: porcentaje(datos.map((d) => d.sabeCosto), (v) => v >= 1),
    porcentajeSabeSueldo: porcentaje(datos.map((d) => d.sabeSueldo), (v) => v >= 1),
    porcentajeSabePasos: porcentaje(datos.map((d) => d.sabePasos), (v) => v >= 1),
    porcentajeConOpcion: porcentaje(datos.map((d) => d.tieneOpcion), (v) => v >= 1),
  };
}

export interface FilaComparativa {
  indicador: string;
  unidad: 'promedio' | 'porcentaje';
  antes: number;
  despues: number;
  cambio: number;
  /** true cuando subir es lo deseable. */
  subirEsBueno: boolean;
}

const INDICADORES_VISIBLES: { llave: keyof Agregado; nombre: string; unidad: 'promedio' | 'porcentaje'; subirEsBueno: boolean }[] = [
  { llave: 'promedioCarrerasNombradas', nombre: 'Carreras que puede nombrar', unidad: 'promedio', subirEsBueno: true },
  { llave: 'promedioSeguridad', nombre: 'Seguridad de su decisión (1 a 5)', unidad: 'promedio', subirEsBueno: true },
  { llave: 'porcentajeSinRumbo', nombre: 'Sin rumbo definido', unidad: 'porcentaje', subirEsBueno: false },
  { llave: 'porcentajeSabeBecas', nombre: 'Sabe que existen becas', unidad: 'porcentaje', subirEsBueno: true },
  { llave: 'promedioBecasNombradas', nombre: 'Becas que puede nombrar', unidad: 'promedio', subirEsBueno: true },
  { llave: 'porcentajeConoceTsu', nombre: 'Conoce rutas técnicas o TSU', unidad: 'porcentaje', subirEsBueno: true },
  { llave: 'promedioTsuNombradas', nombre: 'Técnicas o TSU que puede nombrar', unidad: 'promedio', subirEsBueno: true },
  { llave: 'porcentajeSabeCosto', nombre: 'Sabe cuánto cuesta su opción', unidad: 'porcentaje', subirEsBueno: true },
  { llave: 'porcentajeSabeSueldo', nombre: 'Sabe cuánto se gana', unidad: 'porcentaje', subirEsBueno: true },
  { llave: 'porcentajeSabePasos', nombre: 'Sabe qué trámites siguen', unidad: 'porcentaje', subirEsBueno: true },
  { llave: 'porcentajeConOpcion', nombre: 'Ya tiene una opción concreta', unidad: 'porcentaje', subirEsBueno: true },
];

export function compararAgregados(antes: Agregado, despues: Agregado): FilaComparativa[] {
  return INDICADORES_VISIBLES.map(({ llave, nombre, unidad, subirEsBueno }) => ({
    indicador: nombre,
    unidad,
    antes: antes[llave],
    despues: despues[llave],
    cambio: despues[llave] - antes[llave],
    subirEsBueno,
  }));
}

/** ¿Se puede enseñar este grupo? Con menos de MINIMO_GRUPO respuestas, no. */
export const grupoPublicable = (n: number) => n >= MINIMO_GRUPO;

export interface GrupoMedido {
  grupo: string;
  inicial: Medicion[];
  seguimiento: Medicion[];
}

/** CSV de agregados. Nunca incluye filas de alumnos ni identificadores. */
export function csvAgregado(grupos: GrupoMedido[]): string {
  const encabezados = [
    'grupo',
    'n_inicial',
    'n_seguimiento',
    'indicador',
    'unidad',
    'inicial',
    'seguimiento',
    'cambio',
    'version_instrumento',
  ];
  const filas: string[][] = [];

  for (const { grupo, inicial, seguimiento } of grupos) {
    const agregadoInicial = agregar(inicial);
    const agregadoSeguimiento = agregar(seguimiento);

    if (!grupoPublicable(agregadoInicial.n) || !grupoPublicable(agregadoSeguimiento.n)) {
      filas.push([
        grupo,
        String(agregadoInicial.n),
        String(agregadoSeguimiento.n),
        'GRUPO NO PUBLICABLE',
        '',
        '',
        '',
        '',
        VERSION_INSTRUMENTO,
      ]);
      continue;
    }

    for (const fila of compararAgregados(agregadoInicial, agregadoSeguimiento)) {
      filas.push([
        grupo,
        String(agregadoInicial.n),
        String(agregadoSeguimiento.n),
        fila.indicador,
        fila.unidad,
        fila.antes.toFixed(2),
        fila.despues.toFixed(2),
        fila.cambio.toFixed(2),
        VERSION_INSTRUMENTO,
      ]);
    }
  }

  const escapar = (celda: string) => (/[",\n]/.test(celda) ? `"${celda.replace(/"/g, '""')}"` : celda);
  return [encabezados, ...filas].map((fila) => fila.map(escapar).join(',')).join('\n');
}

export const REACTIVOS_DOCUMENTADOS = REACTIVOS_IMPACTO.map((r) => ({ id: r.id, texto: r.texto }));
