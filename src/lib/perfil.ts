import { almacen } from './storage';
import { calcularPerfil, VERSION_ALGORITMO, type Respuestas, type ResultadoPerfil } from '@/features/perfil/puntuacion';
import { TOTAL_REACTIVOS } from '@/features/perfil/reactivos';

/** Almacenamiento versionado del perfil.
 *
 *  Cada vez que el alumno termina el cuestionario se guarda una versión nueva; nunca se
 *  pisa la anterior. Así se puede comparar cómo cambió entre primero y tercero de prepa,
 *  que es justo cuando la gente cambia de idea.
 */

export const CLAVE_HISTORIAL = 'perfil:historial';
export const CLAVE_BORRADOR = 'perfil:borrador';

export interface VersionPerfil {
  /** 1, 2, 3… en orden de captura. */
  version: number;
  fecha: string;
  /** Grado de prepa al contestar: es el contexto que da sentido a la comparación. */
  grado: 1 | 2 | 3 | null;
  respuestas: Respuestas;
  resultado: ResultadoPerfil;
  /** Con qué versión del algoritmo se calculó, para no comparar peras con manzanas. */
  versionAlgoritmo: string;
}

export interface Borrador {
  respuestas: Respuestas;
  /** En qué reactivo se quedó, para retomar donde lo dejó. */
  indice: number;
  actualizado: string;
}

export async function leerHistorial(): Promise<VersionPerfil[]> {
  const guardado = await almacen.leer<VersionPerfil[]>(CLAVE_HISTORIAL);
  if (!Array.isArray(guardado)) return [];
  return guardado.filter((v) => v && typeof v.version === 'number' && v.resultado).sort((a, b) => a.version - b.version);
}

export const perfilVigente = (historial: VersionPerfil[]): VersionPerfil | null =>
  historial.length ? (historial[historial.length - 1] ?? null) : null;

export const primerPerfil = (historial: VersionPerfil[]): VersionPerfil | null => historial[0] ?? null;

/** Cierra el cuestionario: calcula, agrega versión nueva al historial y tira el borrador. */
export async function guardarNuevaVersion(
  respuestas: Respuestas,
  grado: 1 | 2 | 3 | null
): Promise<VersionPerfil> {
  const historial = await leerHistorial();
  const version: VersionPerfil = {
    version: (historial[historial.length - 1]?.version ?? 0) + 1,
    fecha: new Date().toISOString(),
    grado,
    respuestas,
    resultado: calcularPerfil(respuestas),
    versionAlgoritmo: VERSION_ALGORITMO,
  };
  await almacen.guardar(CLAVE_HISTORIAL, [...historial, version]);
  await borrarBorrador();
  return version;
}

/* ── Pausar y retomar ────────────────────────────────────────────────── */

export async function leerBorrador(): Promise<Borrador | null> {
  const guardado = await almacen.leer<Borrador>(CLAVE_BORRADOR);
  if (!guardado || typeof guardado !== 'object' || typeof guardado.respuestas !== 'object') return null;
  return guardado;
}

export async function guardarBorrador(respuestas: Respuestas, indice: number): Promise<void> {
  await almacen.guardar<Borrador>(CLAVE_BORRADOR, {
    respuestas,
    indice,
    actualizado: new Date().toISOString(),
  });
}

export const borrarBorrador = () => almacen.borrar(CLAVE_BORRADOR);

export const avanceDe = (borrador: Borrador | null) =>
  borrador ? Object.keys(borrador.respuestas).length / TOTAL_REACTIVOS : 0;

/** Borra todo el perfil: es dato del alumno y se tiene que poder eliminar. */
export async function borrarPerfil(): Promise<void> {
  await almacen.borrar(CLAVE_HISTORIAL);
  await borrarBorrador();
}
