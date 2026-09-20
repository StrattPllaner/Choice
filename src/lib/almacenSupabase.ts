import type { Almacen } from './storage';
import { obtenerSupabase, supabaseConfigurado } from './supabase';

/** Almacén contra Supabase, con la MISMA interfaz que el local.
 *
 *  Esto es lo que se prometió cuando se escribió src/lib/storage.ts: cambiar el backend
 *  sin tocar un solo componente. Ningún archivo de src/components ni src/pages cambia por esto.
 */
export class AlmacenSupabase implements Almacen {
  #oyentes = new Map<string, Set<(valor: unknown) => void>>();

  async #tabla() {
    const supabase = await obtenerSupabase();
    if (!supabase) throw new Error('Supabase no está configurado');
    const { data } = await supabase.auth.getUser();
    const usuario = data.user;
    if (!usuario) throw new Error('Sin sesión');
    return { supabase, usuarioId: usuario.id };
  }

  async leer<T>(clave: string): Promise<T | null> {
    const { supabase, usuarioId } = await this.#tabla();
    const { data } = await supabase
      .from('almacen_alumno')
      .select('valor')
      .eq('usuario_id', usuarioId)
      .eq('clave', clave)
      .maybeSingle();
    return (data?.valor as T) ?? null;
  }

  async guardar<T>(clave: string, valor: T): Promise<void> {
    const { supabase, usuarioId } = await this.#tabla();
    await supabase
      .from('almacen_alumno')
      .upsert({ usuario_id: usuarioId, clave, valor, actualizado_en: new Date().toISOString() });
    this.#oyentes.get(clave)?.forEach((escucha) => escucha(valor));
  }

  async borrar(clave: string): Promise<void> {
    const { supabase, usuarioId } = await this.#tabla();
    await supabase.from('almacen_alumno').delete().eq('usuario_id', usuarioId).eq('clave', clave);
    this.#oyentes.get(clave)?.forEach((escucha) => escucha(null));
  }

  /** Borrado real en base, vía la función que también revoca el consentimiento. */
  async limpiar(): Promise<void> {
    const { supabase } = await this.#tabla();
    await supabase.rpc('borrar_mis_datos');
  }

  async claves(): Promise<string[]> {
    const { supabase, usuarioId } = await this.#tabla();
    const { data } = await supabase.from('almacen_alumno').select('clave').eq('usuario_id', usuarioId);
    return (data ?? []).map((fila: { clave: string }) => fila.clave);
  }

  suscribir(clave: string, escucha: (valor: unknown) => void) {
    const conjunto = this.#oyentes.get(clave) ?? new Set();
    conjunto.add(escucha);
    this.#oyentes.set(clave, conjunto);
    return () => conjunto.delete(escucha);
  }
}

export const hayBackend = supabaseConfigurado;
