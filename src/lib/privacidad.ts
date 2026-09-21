import { almacen } from './storage';

/** Consentimiento, derechos ARCO y registro de accesos.
 *
 *  Contexto: los usuarios son menores de edad en México. La LFPDPPP exige consentimiento
 *  del padre o tutor para tratar sus datos, aviso de privacidad previo, y mecanismos reales
 *  de acceso, rectificación, cancelación y oposición.
 *
 *  Minimización, por diseño: no se pide nombre completo, dirección, CURP, teléfono ni correo
 *  del alumno. La identificación es por CÓDIGO DE ALUMNO que asigna la escuela.
 */

export const VERSION_AVISO = '1.0.0';
export const CLAVE_CONSENTIMIENTO = 'consentimiento';
export const CLAVE_ACCESOS = 'privacidad:accesos';

export type FormaConsentimiento =
  | 'app_con_tutor_presente'
  | 'formato_impreso_entregado_a_escuela'
  | 'correo_de_la_escuela';

export const ETIQUETA_FORMA: Record<FormaConsentimiento, string> = {
  app_con_tutor_presente: 'En la app, con el padre o tutor presente',
  formato_impreso_entregado_a_escuela: 'Formato impreso firmado y entregado a la escuela',
  correo_de_la_escuela: 'Por correo, a través de la escuela',
};

export interface Consentimiento {
  otorgado: boolean;
  /** Fecha en que se otorgó. Requisito para poder acreditarlo. */
  fecha: string;
  forma: FormaConsentimiento;
  /** Nombre de quien autoriza: es el mínimo para acreditar el consentimiento. */
  nombreTutor: string;
  parentesco: string;
  /** Versión del aviso de privacidad que se le mostró. */
  versionAviso: string;
  /** El alumno declaró ser mayor de edad: entonces consiente él mismo. */
  mayorDeEdad: boolean;
  /** Se revocó (derecho de cancelación / oposición). */
  revocado?: { fecha: string };
}

export async function leerConsentimiento(): Promise<Consentimiento | null> {
  const guardado = await almacen.leer<Consentimiento>(CLAVE_CONSENTIMIENTO);
  if (!guardado || typeof guardado !== 'object') return null;
  return guardado;
}

export const consentimientoVigente = (consentimiento: Consentimiento | null): boolean =>
  Boolean(consentimiento?.otorgado && !consentimiento.revocado);

export async function otorgarConsentimiento(
  datos: Omit<Consentimiento, 'otorgado' | 'fecha' | 'versionAviso'>
): Promise<Consentimiento> {
  const consentimiento: Consentimiento = {
    ...datos,
    otorgado: true,
    fecha: new Date().toISOString(),
    versionAviso: VERSION_AVISO,
  };
  await almacen.guardar(CLAVE_CONSENTIMIENTO, consentimiento);
  almacen.activarConsentimiento();
  await registrarAcceso('alumno', 'consentimiento', 'otorgar');
  return consentimiento;
}

/** Revocar = borrado real de todo lo guardado, no una bandera de baja lógica. */
export async function revocarConsentimiento(): Promise<void> {
  const previo = await leerConsentimiento();
  await almacen.revocarConsentimiento();
  if (previo) {
    await almacen.guardar<Consentimiento>(CLAVE_CONSENTIMIENTO, {
      ...previo,
      otorgado: false,
      revocado: { fecha: new Date().toISOString() },
    });
  }
  await registrarAcceso('alumno', 'todos_sus_datos', 'borrar');
}

/** Arranque: si hay consentimiento vigente, se abre la puerta del almacenamiento. */
export async function inicializarConsentimiento(): Promise<Consentimiento | null> {
  const consentimiento = await leerConsentimiento();
  if (consentimientoVigente(consentimiento)) almacen.activarConsentimiento();
  return consentimiento;
}

/* ── Registro de accesos ─────────────────────────────────────────────── */

export type Rol = 'alumno' | 'orientador' | 'direccion' | 'sistema';
export type Operacion = 'leer' | 'escribir' | 'exportar' | 'borrar' | 'otorgar';

export interface Acceso {
  fecha: string;
  rol: Rol;
  recurso: string;
  operacion: Operacion;
}

/** Qué puede tocar cada rol. La versión que manda está en la base (RLS); esta tabla
 *  es la que documenta y la que usa la app para no pedir lo que no le toca. */
export const MATRIZ_ACCESOS: Record<Rol, { recurso: string; operaciones: Operacion[]; detalle: string }[]> = {
  alumno: [
    { recurso: 'su perfil de exploración', operaciones: ['leer', 'escribir', 'exportar', 'borrar'], detalle: 'Solo los suyos.' },
    { recurso: 'sus mediciones de impacto', operaciones: ['leer', 'escribir', 'exportar', 'borrar'], detalle: 'Solo las suyas.' },
    { recurso: 'sus carreras guardadas', operaciones: ['leer', 'escribir', 'borrar'], detalle: 'Solo las suyas.' },
  ],
  orientador: [
    { recurso: 'agregados del plantel', operaciones: ['leer', 'exportar'], detalle: 'Solo grupos con 10 o más respuestas. Nunca filas individuales.' },
  ],
  direccion: [
    { recurso: 'agregados del plantel', operaciones: ['leer', 'exportar'], detalle: 'Solo grupos con 10 o más respuestas. Nunca filas individuales.' },
    { recurso: 'licencia del plantel', operaciones: ['leer'], detalle: 'Vigencia y alumnos permitidos.' },
  ],
  sistema: [
    { recurso: 'registro de accesos', operaciones: ['escribir'], detalle: 'Bitácora de quién consultó qué.' },
  ],
};

export async function registrarAcceso(rol: Rol, recurso: string, operacion: Operacion): Promise<void> {
  const previos = (await almacen.leer<Acceso[]>(CLAVE_ACCESOS)) ?? [];
  const acceso: Acceso = { fecha: new Date().toISOString(), rol, recurso, operacion };
  // se conservan los últimos 200: es bitácora de transparencia, no un histórico eterno
  await almacen.guardar(CLAVE_ACCESOS, [...previos, acceso].slice(-200));
}

export const leerAccesos = async (): Promise<Acceso[]> => (await almacen.leer<Acceso[]>(CLAVE_ACCESOS)) ?? [];

/* ── Derechos ARCO ───────────────────────────────────────────────────── */

/** Acceso + portabilidad: todo lo que la app tiene del alumno, en un archivo. */
export async function exportarMisDatos(): Promise<string> {
  const claves = await almacen.claves();
  const datos: Record<string, unknown> = {};
  for (const clave of claves) datos[clave] = await almacen.leer(clave);
  await registrarAcceso('alumno', 'todos_sus_datos', 'exportar');
  return JSON.stringify(
    {
      exportadoEl: new Date().toISOString(),
      versionAviso: VERSION_AVISO,
      nota: 'Esto es todo lo que Vocatlas guarda de ti en este dispositivo.',
      datos,
    },
    null,
    2
  );
}

/** Cancelación: borrado real. No hay baja lógica ni copia "por si acaso". */
export async function borrarMisDatos(): Promise<void> {
  const claves = await almacen.claves();
  for (const clave of claves) {
    if (clave !== CLAVE_CONSENTIMIENTO) await almacen.borrar(clave);
  }
  await registrarAcceso('alumno', 'todos_sus_datos', 'borrar');
}

export function descargar(nombre: string, contenido: string, tipo = 'application/json') {
  const url = URL.createObjectURL(new Blob([contenido], { type: `${tipo};charset=utf-8` }));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}
