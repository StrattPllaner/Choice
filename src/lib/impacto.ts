import { almacen } from './storage';
import { VERSION_INSTRUMENTO } from '@/features/impacto/instrumento';
import type { Medicion, MomentoMedicion } from '@/features/impacto/calculo';

/** Guarda las aplicaciones del instrumento con su fecha, para poder calcular el cambio
 *  por alumno y, ya en el panel, por grupo. Nunca se pisa una medición anterior. */

export const CLAVE_MEDICIONES = 'impacto:mediciones';

export async function leerMediciones(): Promise<Medicion[]> {
  const guardadas = await almacen.leer<Medicion[]>(CLAVE_MEDICIONES);
  if (!Array.isArray(guardadas)) return [];
  return guardadas
    .filter((m) => m && typeof m.fecha === 'string' && m.respuestas)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export async function guardarMedicion(
  momento: MomentoMedicion,
  respuestas: Record<string, number>
): Promise<Medicion> {
  const medicion: Medicion = {
    momento,
    fecha: new Date().toISOString(),
    versionInstrumento: VERSION_INSTRUMENTO,
    respuestas,
  };
  const previas = await leerMediciones();
  await almacen.guardar(CLAVE_MEDICIONES, [...previas, medicion]);
  return medicion;
}

/** Qué toca aplicar: la inicial si no hay ninguna, si no el seguimiento. */
export function siguienteMomento(mediciones: Medicion[]): MomentoMedicion {
  return mediciones.some((m) => m.momento === 'inicial') ? 'seguimiento' : 'inicial';
}

export const borrarMediciones = () => almacen.borrar(CLAVE_MEDICIONES);
