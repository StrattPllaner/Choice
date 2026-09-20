import { almacen } from './storage';

/** Sesión del alumno. Sin cuenta ni contraseña: en prepa pública se comparte el equipo
 *  y pedir registro mata la adopción. El `id` local permite migrar a backend después. */

export type Licencia = 'gratis' | 'escuela';

export interface SesionAlumno {
  id: string;
  nombre: string | null;
  grado: 1 | 2 | 3 | null;
  escuela: string | null;
  licencia: Licencia;
  favoritas: string[];
  /** id de carrera → visto en (ISO) */
  vistas: Record<string, string>;
  respuestasTest: Record<string, number>;
  creadaEn: string;
  actualizadaEn: string;
}

export const CLAVE_SESION = 'sesion';

function idNuevo(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `a-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function sesionNueva(): SesionAlumno {
  const ahora = new Date().toISOString();
  return {
    id: idNuevo(),
    nombre: null,
    grado: null,
    escuela: null,
    licencia: 'gratis',
    favoritas: [],
    vistas: {},
    respuestasTest: {},
    creadaEn: ahora,
    actualizadaEn: ahora,
  };
}

/** Normaliza lo leído del disco: datos viejos o a medias no deben tumbar la app. */
function normalizar(valor: unknown): SesionAlumno | null {
  if (!valor || typeof valor !== 'object') return null;
  const parcial = valor as Partial<SesionAlumno>;
  if (typeof parcial.id !== 'string') return null;
  const base = sesionNueva();
  return {
    ...base,
    ...parcial,
    id: parcial.id,
    favoritas: Array.isArray(parcial.favoritas) ? parcial.favoritas.filter((f) => typeof f === 'string') : [],
    vistas: parcial.vistas && typeof parcial.vistas === 'object' ? parcial.vistas : {},
    respuestasTest:
      parcial.respuestasTest && typeof parcial.respuestasTest === 'object' ? parcial.respuestasTest : {},
  };
}

export async function leerSesion(): Promise<SesionAlumno> {
  const guardada = normalizar(await almacen.leer<SesionAlumno>(CLAVE_SESION));
  if (guardada) return guardada;
  const nueva = sesionNueva();
  await almacen.guardar(CLAVE_SESION, nueva);
  return nueva;
}

export async function guardarSesion(sesion: SesionAlumno): Promise<SesionAlumno> {
  const actualizada = { ...sesion, actualizadaEn: new Date().toISOString() };
  await almacen.guardar(CLAVE_SESION, actualizada);
  return actualizada;
}

export async function borrarSesion(): Promise<void> {
  await almacen.borrar(CLAVE_SESION);
}

export function alternarFavorita(sesion: SesionAlumno, idCarrera: string): SesionAlumno {
  const favoritas = sesion.favoritas.includes(idCarrera)
    ? sesion.favoritas.filter((f) => f !== idCarrera)
    : [...sesion.favoritas, idCarrera];
  return { ...sesion, favoritas };
}

export function marcarVista(sesion: SesionAlumno, idCarrera: string): SesionAlumno {
  return { ...sesion, vistas: { ...sesion.vistas, [idCarrera]: new Date().toISOString() } };
}
