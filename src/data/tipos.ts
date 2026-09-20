/** Modelo de datos del catálogo de carreras.
 *
 *  Regla no negociable: un dato duro NO puede existir sin fuente. Eso no se documenta,
 *  se hace imposible de escribir: todo dato duro es `Dato<T>`, que o trae al menos una
 *  fuente o es `null`. No hay forma de teclear un número suelto. La UI pinta
 *  "dato no disponible" cuando es `null`; nunca estima.
 */

/* ── Fuentes ─────────────────────────────────────────────────────────── */

export type TipoFuente =
  | 'inegi_enoe' // microdatos públicos de la ENOE
  | 'inegi_otro'
  | 'anuies' // anuarios estadísticos de educación superior
  | 'sep' // SEP / SEMS / DGESuM
  | 'gobmx_becas' // convocatorias y reglas de operación en gob.mx
  | 'plan_estudios' // plan de estudios publicado por una universidad
  | 'referencia'; // solo se enlaza y se cita, NUNCA se copia (p. ej. IMCO Compara Carreras)

export interface Fuente {
  nombre: string;
  url: string;
  /** Año de la publicación o del periodo de referencia del dato. */
  anio: number;
  tipo: TipoFuente;
  /** Detalle para poder reproducir el dato: trimestre, tabulado, página. */
  nota?: string;
}

/** Al menos una fuente: el tipo no admite un arreglo vacío. */
export type Fuentes = [Fuente, ...Fuente[]];

/** Un dato duro con respaldo, o `null` si todavía no tiene fuente. */
export type Dato<T> = { valor: T; fuentes: Fuentes } | null;

export const valorDe = <T>(dato: Dato<T>): T | null => (dato ? dato.valor : null);
export const tieneDato = <T>(dato: Dato<T>): dato is { valor: T; fuentes: Fuentes } => dato !== null;

/* ── Vocabularios ────────────────────────────────────────────────────── */

export type IdArea =
  | 'salud'
  | 'ingenierias'
  | 'sociales'
  | 'economico'
  | 'arte'
  | 'naturales'
  | 'educacion'
  | 'oficios';

export type Nivel = 'licenciatura' | 'ingenieria' | 'tsu' | 'tecnica' | 'certificacion';

export type Modalidad = 'escolarizada' | 'mixta' | 'en_linea' | 'dual' | 'abierta';

export type NivelSaturacion = 'baja' | 'media' | 'alta' | 'muy_alta';

export type TipoPeriodo = 'semestre' | 'cuatrimestre' | 'modulo';

export type RiesgoMateria = 'alta_reprobacion' | 'alta_desercion' | 'filtro';

export const ETIQUETA_NIVEL: Record<Nivel, string> = {
  licenciatura: 'Licenciatura',
  ingenieria: 'Ingeniería',
  tsu: 'Técnico Superior Universitario',
  tecnica: 'Carrera técnica',
  certificacion: 'Certificación u oficio',
};

export const ETIQUETA_MODALIDAD: Record<Modalidad, string> = {
  escolarizada: 'Presencial',
  mixta: 'Mixta (presencial y en línea)',
  en_linea: 'En línea',
  dual: 'Dual (escuela y empresa)',
  abierta: 'Abierta (a tu ritmo)',
};

export const ETIQUETA_RIESGO: Record<RiesgoMateria, string> = {
  alta_reprobacion: 'Aquí se reprueba mucho',
  alta_desercion: 'Aquí mucha gente se sale',
  filtro: 'Materia filtro',
};

export const ETIQUETA_SATURACION: Record<NivelSaturacion, string> = {
  baja: 'Pocos egresados para la demanda',
  media: 'Equilibrada',
  alta: 'Muchos egresados compitiendo',
  muy_alta: 'Muy saturada',
};

/* ── Piezas de la ficha ──────────────────────────────────────────────── */

export type Periodicidad = 'mensual' | 'semestral' | 'anual' | 'total_carrera';

export interface RangoMxn {
  min: number;
  max: number;
  periodicidad: Periodicidad;
}

export interface Area {
  id: IdArea;
  nombre: string;
  descripcion: string;
  color: string;
}

export interface Materia {
  nombre: string;
  /** Materia que tumba gente. Marca pedagógica del mapa, no un dato duro con fuente. */
  riesgo?: RiesgoMateria;
  nota?: string;
}

export interface Periodo {
  numero: number;
  materias: Materia[];
}

export interface MapaMaterias {
  tipoPeriodo: TipoPeriodo;
  /** 'plantilla' = materias típicas de la carrera en México, NO el plan de una escuela.
   *  'verificado' = calcado de un plan de estudios publicado; exige `fuentePlan`. */
  estado: 'plantilla' | 'verificado';
  fuentePlan: Fuente | null;
  periodos: Periodo[];
}

export interface PerfilBatalla {
  /** Quién suele batallar y por qué, en lenguaje llano. */
  resumen: string;
  /** Señales para que el alumno se reconozca antes de inscribirse. */
  senales: string[];
  /** Qué sí ayuda a pasarla. */
  queAyuda: string[];
}

export interface DatosLaborales {
  /** Sueldo mensual al salir. */
  salarioEntradaMxn: Dato<RangoMxn>;
  /** Sueldo mensual con ~5 años de experiencia. */
  salarioCincoAniosMxn: Dato<RangoMxn>;
  /** Proporción 0–1 de egresados desocupados. */
  tasaDesempleo: Dato<number>;
  /** Proporción 0–1 trabajando en la informalidad. */
  tasaInformalidad: Dato<number>;
  saturacion: Dato<NivelSaturacion>;
}

export interface Costos {
  /** Costo total de estudiarla en institución pública (inscripciones, materiales, transporte). */
  publicaMxn: Dato<RangoMxn>;
  privadaMxn: Dato<RangoMxn>;
}

export interface Beca {
  id: string;
  nombre: string;
  institucion: string;
  montoMxn: Dato<RangoMxn>;
  /** Para qué niveles aplica; de aquí se derivan las becas de cada carrera. */
  aplicaNiveles: Nivel[];
  soloPublicas: boolean;
  requisitosResumen: string;
  url: string;
  fuentes: Fuentes;
}

export interface Carrera {
  id: string;
  nombre: string;
  /** Como la nombran otras escuelas o la calle ("Sistemas", "Doctor"). Sirve para buscar. */
  nombresAlternativos: string[];
  area: IdArea;
  nivel: Nivel;
  duracionAnios: number;
  modalidades: Modalidad[];
  /** Qué hace esa persona un martes cualquiera. Máximo 120 palabras (lo valida el build). */
  martesTipico: string;
  mapaMaterias: MapaMaterias;
  quienBatalla: PerfilBatalla;
  laboral: DatosLaborales;
  costos: Costos;
  /** ids del catálogo de becas. */
  becas: string[];
  /** true solo si TODOS los datos duros tienen fuente. Lo recalcula el validador del build. */
  verificado: boolean;
  /** Campos duros que siguen sin fuente. Lo recalcula el validador. */
  pendientes: string[];
  fuentes: Fuente[];
  actualizado: string;
}

export interface CatalogoCarreras {
  version: number;
  actualizado: string;
  /** Reglas que el validador aplica; se muestran en la UI como aviso de transparencia. */
  politicaDeDatos: string;
  carreras: Carrera[];
}

export interface CatalogoAreas {
  version: number;
  areas: Area[];
}

export interface CatalogoBecas {
  version: number;
  actualizado: string;
  becas: Beca[];
}

/* Los campos duros y la regla de verificación viven en `src/data/reglas.js`,
   compartidos con el validador del build: una sola fuente de verdad. */
