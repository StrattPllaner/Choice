import { almacen, observarCambios, type Almacen } from './storage';
import { AlmacenSupabase } from './almacenSupabase';
import { supabaseConfigurado, usuarioActual } from './supabase';

/** Offline primero, nube después.
 *
 *  El alumno escribe siempre en local (instantáneo, funciona sin señal) y los cambios se
 *  encolan para subirlos. Nada de esto se ve en los componentes: siguen hablando con `almacen`.
 */

const CLAVE_COLA = 'sync:pendientes';
const CLAVE_ULTIMA = 'sync:ultima';

interface Pendiente {
  clave: string;
  operacion: 'guardar' | 'borrar';
  fecha: string;
}

async function leerCola(): Promise<Pendiente[]> {
  return (await almacen.leer<Pendiente[]>(CLAVE_COLA)) ?? [];
}

export async function encolar(clave: string, operacion: Pendiente['operacion']): Promise<void> {
  if (!supabaseConfigurado) return;
  if (clave.startsWith('sync:')) return; // la cola no se sincroniza a sí misma
  const cola = await leerCola();
  const sinDuplicados = cola.filter((p) => p.clave !== clave);
  await almacen.guardar(CLAVE_COLA, [...sinDuplicados, { clave, operacion, fecha: new Date().toISOString() }]);
}

export interface ResultadoSincronizacion {
  subidos: number;
  bajados: number;
  motivo?: string;
}

export async function sincronizar(remoto: Almacen = new AlmacenSupabase()): Promise<ResultadoSincronizacion> {
  if (!supabaseConfigurado) return { subidos: 0, bajados: 0, motivo: 'Sin backend configurado' };
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { subidos: 0, bajados: 0, motivo: 'Sin conexión' };
  }
  if (!(await usuarioActual())) return { subidos: 0, bajados: 0, motivo: 'Sin sesión iniciada' };

  const cola = await leerCola();
  let subidos = 0;

  for (const pendiente of cola) {
    try {
      if (pendiente.operacion === 'borrar') await remoto.borrar(pendiente.clave);
      else {
        const valor = await almacen.leer(pendiente.clave);
        if (valor !== null) await remoto.guardar(pendiente.clave, valor);
      }
      subidos++;
    } catch {
      break; // se corta al primer error y se reintenta después con la cola intacta
    }
  }

  await almacen.guardar(CLAVE_COLA, cola.slice(subidos));

  // baja lo que exista en la nube y no esté en el dispositivo (cambio de celular)
  let bajados = 0;
  try {
    for (const clave of await remoto.claves()) {
      if (clave.startsWith('sync:')) continue;
      if ((await almacen.leer(clave)) === null) {
        const valor = await remoto.leer(clave);
        if (valor !== null) {
          await almacen.guardar(clave, valor);
          bajados++;
        }
      }
    }
  } catch {
    /* si falla la bajada, lo local sigue siendo la verdad */
  }

  await almacen.guardar(CLAVE_ULTIMA, new Date().toISOString());
  return { subidos, bajados };
}

/** Se llama al arrancar: intenta sincronizar y se queda escuchando cuando vuelve la señal. */
export function arrancarSincronizacion(): void {
  if (!supabaseConfigurado) return;
  observarCambios((clave, operacion) => void encolar(clave, operacion));
  const intentar = () => void sincronizar().catch(() => undefined);
  window.addEventListener('online', intentar);
  window.setTimeout(intentar, 3000); // sin competir con el primer render
}

export const ultimaSincronizacion = () => almacen.leer<string>(CLAVE_ULTIMA);
