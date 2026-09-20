/** Reglas del catálogo en JS plano: las usan igual el validador del build (Node)
 *  y la app (TypeScript). Una sola fuente de verdad para la regla no negociable. */

/** Campos duros: si no traen fuente, van en null y la UI dice "dato no disponible". */
export const CAMPOS_DUROS = [
  'laboral.salarioEntradaMxn',
  'laboral.salarioCincoAniosMxn',
  'laboral.tasaDesempleo',
  'laboral.tasaInformalidad',
  'laboral.saturacion',
  'costos.publicaMxn',
  'costos.privadaMxn',
];

export const MAX_PALABRAS_MARTES = 120;

export const TIPOS_FUENTE_PERMITIDOS = [
  'inegi_enoe',
  'inegi_otro',
  'anuies',
  'sep',
  'gobmx_becas',
  'plan_estudios',
  'referencia',
];

/** IMCO Compara Carreras solo se enlaza y se cita: nunca se copia su base. */
export const FUENTES_SOLO_REFERENCIA = ['comparacarreras.imco.org.mx', 'imco.org.mx'];

export function leerRuta(objeto, ruta) {
  return ruta.split('.').reduce((actual, llave) => (actual == null ? undefined : actual[llave]), objeto);
}

/** Un dato es válido solo si trae valor y al menos una fuente. */
export function tieneFuente(dato) {
  return Boolean(dato && dato.valor !== undefined && dato.valor !== null && Array.isArray(dato.fuentes) && dato.fuentes.length > 0);
}

/** Campos duros que siguen sin fuente. */
export function calcularPendientes(carrera) {
  return CAMPOS_DUROS.filter((ruta) => !tieneFuente(leerRuta(carrera, ruta)));
}

/** Verificada = todos los datos duros con fuente. No se marca a mano. */
export function esVerificada(carrera) {
  return calcularPendientes(carrera).length === 0;
}

export function contarPalabras(texto) {
  return texto.trim().split(/\s+/).filter(Boolean).length;
}
