import { obtenerSupabase } from '@/lib/supabase';

/** Acceso a los agregados del panel.
 *
 *  Todo pasa por funciones RPC con k-anonimato en la base. Este archivo NO consulta
 *  ninguna tabla de alumnos: aunque alguien lo modificara, la RLS se lo impediría.
 */

export const MINIMO_GRUPO = 10;

export interface Cobertura { alumnos: number; con_perfil: number; publicable: boolean }
export interface SinRumbo { n: number; sin_rumbo: number | null; porcentaje: number | null; publicable: boolean }
export interface AreaGeneracion { area: string; alumnos: number; porcentaje: number }
export interface CambioImpacto {
  indicador: string;
  n_inicial: number;
  n_seguimiento: number;
  inicial: number | null;
  seguimiento: number | null;
  cambio: number | null;
  publicable: boolean;
}
export interface CarreraExplorada { carrera_id: string; alumnos: number }
export interface EstadoLicencia {
  vigente: boolean;
  en_gracia: boolean;
  fecha_inicio: string;
  fecha_fin: string;
  dias_restantes: number;
  alumnos_permitidos: number;
  alumnos_registrados: number;
}

async function rpc<T>(nombre: string, parametros: Record<string, unknown>): Promise<T[]> {
  const supabase = await obtenerSupabase();
  if (!supabase) throw new Error('Supabase no está configurado');
  const { data, error } = await supabase.rpc(nombre, parametros);
  if (error) throw error;
  return (data ?? []) as T[];
}

export const cargarCobertura = (plantel: string) =>
  rpc<Cobertura>('panel_cobertura', { p_plantel: plantel }).then((filas) => filas[0] ?? null);

export const cargarSinRumbo = (plantel: string) =>
  rpc<SinRumbo>('panel_sin_rumbo', { p_plantel: plantel }).then((filas) => filas[0] ?? null);

export const cargarAreas = (plantel: string) => rpc<AreaGeneracion>('panel_areas', { p_plantel: plantel });

export const cargarCambioImpacto = (plantel: string) =>
  rpc<CambioImpacto>('panel_cambio_impacto', { p_plantel: plantel });

export const cargarCarrerasExploradas = (plantel: string, limite = 10) =>
  rpc<CarreraExplorada>('panel_carreras_exploradas', { p_plantel: plantel, p_limite: limite });

export const cargarLicencia = (plantel: string) =>
  rpc<EstadoLicencia>('licencia_estado', { p_plantel: plantel }).then((filas) => filas[0] ?? null);

/** CSV del panel: solo agregados, nunca filas de alumno. */
export function csvPanel(
  secciones: { titulo: string; encabezados: string[]; filas: (string | number | null)[][] }[]
): string {
  const escapar = (celda: string | number | null) => {
    const texto = celda === null ? '' : String(celda);
    return /[",\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
  };
  const lineas: string[] = [];
  for (const seccion of secciones) {
    lineas.push(seccion.titulo);
    lineas.push(seccion.encabezados.map(escapar).join(','));
    for (const fila of seccion.filas) lineas.push(fila.map(escapar).join(','));
    lineas.push('');
  }
  return lineas.join('\n');
}
