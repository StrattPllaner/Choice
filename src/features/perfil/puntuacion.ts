import type { IdArea } from '@/data/tipos';
import {
  BLOQUES,
  PESOS_BLOQUE,
  PESOS_VALOR_AREA,
  REACTIVOS,
  type Bloque,
  type Reactivo,
  type Respuesta,
} from './reactivos';

/** Lógica de puntuación del perfil de exploración.
 *
 *  Vive aparte a propósito: es auditable, se puede leer completa sin abrir un componente
 *  y está explicada en prosa en docs/puntuacion-perfil.md. Si alguien no está de acuerdo
 *  con un peso, este es el archivo que hay que discutir.
 *
 *  NO es un instrumento psicométrico validado. Es una suma ponderada de preferencias
 *  declaradas, y así se le presenta al alumno.
 */

export const VERSION_ALGORITMO = '1.0.0';

export const AREAS: IdArea[] = [
  'salud',
  'ingenierias',
  'sociales',
  'economico',
  'arte',
  'naturales',
  'educacion',
  'oficios',
];

export type Respuestas = Record<string, Respuesta>;

export interface Afinidad {
  area: IdArea;
  /** 0–100. Es una afinidad relativa entre áreas, no un porcentaje de éxito. */
  puntaje: number;
}

export type Confianza = 'normal' | 'baja';

export interface ResultadoPerfil {
  versionAlgoritmo: string;
  afinidades: Afinidad[];
  /** Áreas a explorar primero. Siempre son 3 o más, nunca una sola. */
  sugeridas: IdArea[];
  confianza: Confianza;
  motivoConfianza: string | null;
  /** Reactivos contestados / total. */
  contestados: number;
  total: number;
}

/** Mínimo de áreas que se muestran. Elegir carrera no se reduce a un solo camino. */
export const MINIMO_SUGERIDAS = 3;

/** Un área extra entra si queda a menos de esta distancia de la tercera. */
const HOLGURA_EMPATE = 5;

const intensidad = (respuesta: Respuesta) => respuesta / 3; // 0, 0.33, 0.67, 1

function pesosDelReactivo(reactivo: Reactivo): Partial<Record<IdArea, number>> {
  if (reactivo.valor) return PESOS_VALOR_AREA[reactivo.valor];
  return reactivo.pesosArea ?? {};
}

/** Puntaje 0–1 de un área dentro de un bloque: promedio ponderado de los reactivos
 *  del bloque que tocan esa área. Un bloque que no toca el área no la penaliza. */
function puntajeBloque(bloque: Bloque, area: IdArea, respuestas: Respuestas): number | null {
  let suma = 0;
  let pesoTotal = 0;

  for (const reactivo of REACTIVOS) {
    if (reactivo.bloque !== bloque) continue;
    const peso = pesosDelReactivo(reactivo)[area];
    if (!peso) continue;
    const respuesta = respuestas[reactivo.id];
    if (respuesta === undefined) continue; // sin contestar no cuenta ni a favor ni en contra
    suma += intensidad(respuesta) * peso;
    pesoTotal += peso;
  }

  return pesoTotal === 0 ? null : suma / pesoTotal;
}

/** Afinidad 0–100 de un área: promedio de sus bloques, ponderado por PESOS_BLOQUE
 *  y renormalizado sobre los bloques donde el área sí participa. */
export function puntajeArea(area: IdArea, respuestas: Respuestas): number {
  let suma = 0;
  let pesoTotal = 0;

  for (const bloque of BLOQUES) {
    const puntaje = puntajeBloque(bloque, area, respuestas);
    if (puntaje === null) continue;
    suma += puntaje * PESOS_BLOQUE[bloque];
    pesoTotal += PESOS_BLOQUE[bloque];
  }

  return pesoTotal === 0 ? 0 : Math.round((suma / pesoTotal) * 100);
}

/** Orden estable: por puntaje y, en empate, alfabético. El mismo input da el mismo output. */
function ordenar(afinidades: Afinidad[]): Afinidad[] {
  return [...afinidades].sort((a, b) => b.puntaje - a.puntaje || a.area.localeCompare(b.area));
}

/** Respuestas muy parejas o todas iguales: el resultado casi no discrimina y hay que decirlo. */
function evaluarConfianza(respuestas: Respuestas, afinidades: Afinidad[]): {
  confianza: Confianza;
  motivo: string | null;
} {
  const valores = Object.values(respuestas);
  if (valores.length === 0) return { confianza: 'baja', motivo: 'Todavía no contestas nada.' };

  const conteo = new Map<Respuesta, number>();
  for (const valor of valores) conteo.set(valor, (conteo.get(valor) ?? 0) + 1);
  const repetidaMax = Math.max(...conteo.values());
  if (repetidaMax / valores.length >= 0.8) {
    return {
      confianza: 'baja',
      motivo: 'Contestaste casi todo igual, así que el mapa sale muy parejo. Si lo vuelves a contestar con más calma, va a ser más útil.',
    };
  }

  const puntajes = afinidades.map((a) => a.puntaje);
  const promedio = puntajes.reduce((suma, p) => suma + p, 0) / puntajes.length;
  const desviacion = Math.sqrt(puntajes.reduce((suma, p) => suma + (p - promedio) ** 2, 0) / puntajes.length);
  if (desviacion < 5) {
    return {
      confianza: 'baja',
      motivo: 'Tus áreas quedaron muy parejas: ninguna destaca sobre las otras. Tómalo como que tienes varias puertas abiertas, no como que ninguna te queda.',
    };
  }

  return { confianza: 'normal', motivo: null };
}

/** Elige las áreas a explorar primero: mínimo 3, más las que empaten de cerca. */
export function elegirSugeridas(afinidades: Afinidad[]): IdArea[] {
  const ordenadas = ordenar(afinidades);
  const corte = ordenadas[MINIMO_SUGERIDAS - 1]?.puntaje ?? 0;
  const conEmpates = ordenadas.filter((a, indice) => indice < MINIMO_SUGERIDAS || a.puntaje >= corte - HOLGURA_EMPATE);
  return conEmpates.slice(0, MINIMO_SUGERIDAS + 2).map((a) => a.area);
}

export function calcularPerfil(respuestas: Respuestas): ResultadoPerfil {
  const afinidades = ordenar(AREAS.map((area) => ({ area, puntaje: puntajeArea(area, respuestas) })));
  const { confianza, motivo } = evaluarConfianza(respuestas, afinidades);

  return {
    versionAlgoritmo: VERSION_ALGORITMO,
    afinidades,
    sugeridas: elegirSugeridas(afinidades),
    confianza,
    motivoConfianza: motivo,
    contestados: Object.keys(respuestas).length,
    total: REACTIVOS.length,
  };
}

/** Diferencia de afinidad entre dos perfiles, para comparar primero contra tercero de prepa. */
export function compararPerfiles(antes: ResultadoPerfil, despues: ResultadoPerfil) {
  const mapaAntes = new Map(antes.afinidades.map((a) => [a.area, a.puntaje]));
  return despues.afinidades
    .map((a) => ({ area: a.area, antes: mapaAntes.get(a.area) ?? 0, despues: a.puntaje, cambio: a.puntaje - (mapaAntes.get(a.area) ?? 0) }))
    .sort((a, b) => Math.abs(b.cambio) - Math.abs(a.cambio));
}
