import type { SupabaseClient } from '@supabase/supabase-js';

/** Cliente de Supabase cargado bajo demanda.
 *
 *  Se importa dinámicamente para que la librería NO entre en el bundle inicial: el alumno
 *  de prepa pública en 3G no debe pagar el peso de un SDK que solo usa el panel y la
 *  sincronización. Si no hay variables de entorno, la app corre en modo local completo.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigurado = Boolean(url && anon);

let cliente: SupabaseClient | null = null;

export async function obtenerSupabase(): Promise<SupabaseClient | null> {
  if (!supabaseConfigurado) return null;
  if (cliente) return cliente;
  const { createClient } = await import('@supabase/supabase-js');
  cliente = createClient(url!, anon!, {
    auth: { persistSession: true, autoRefreshToken: true },
    global: { headers: { 'x-aplicacion': 'nombreapp' } },
  });
  return cliente;
}

export async function usuarioActual() {
  const supabase = await obtenerSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export interface PerfilUsuario {
  id: string;
  plantel_id: string;
  rol: 'alumno' | 'orientador' | 'direccion';
  codigo_alumno: string | null;
  grupo: string | null;
  grado: number | null;
}

export async function perfilUsuario(): Promise<PerfilUsuario | null> {
  const supabase = await obtenerSupabase();
  if (!supabase) return null;
  const { data } = await supabase.from('usuarios').select('*').maybeSingle();
  return (data as PerfilUsuario) ?? null;
}
