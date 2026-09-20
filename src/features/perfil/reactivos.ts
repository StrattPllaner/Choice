import type { IdArea } from '@/data/tipos';

/** Reactivos del perfil de exploración.
 *
 *  NO es un test psicométrico: no está validado clínicamente y no mide rasgos de
 *  personalidad. Son preguntas de preferencia cuyos pesos están escritos a la vista
 *  (abajo y en docs/puntuacion-perfil.md) para que cualquiera los pueda auditar y discutir.
 */

export type Bloque = 'intereses' | 'materias' | 'forma_trabajo' | 'valores';

export type Valor = 'dinero' | 'estabilidad' | 'ayudar' | 'creatividad' | 'independencia';

/** Escala de 4 puntos. Sin punto medio: obliga a inclinarse y evita el "ahí más o menos". */
export type Respuesta = 0 | 1 | 2 | 3;

export const OPCIONES: { valor: Respuesta; etiqueta: string }[] = [
  { valor: 0, etiqueta: 'Nada' },
  { valor: 1, etiqueta: 'Poco' },
  { valor: 2, etiqueta: 'Bastante' },
  { valor: 3, etiqueta: 'Mucho' },
];

export interface Reactivo {
  id: string;
  bloque: Bloque;
  texto: string;
  /** Peso 1–3 por área. Un reactivo sin peso en un área simplemente no la toca. */
  pesosArea?: Partial<Record<IdArea, number>>;
  /** Solo en el bloque de valores: el reactivo mide un valor, no un área. */
  valor?: Valor;
}

export const ETIQUETA_BLOQUE: Record<Bloque, string> = {
  intereses: 'Lo que te late',
  materias: 'Lo que se te da',
  forma_trabajo: 'Cómo te gusta trabajar',
  valores: 'Lo que te importa',
};

export const INTRO_BLOQUE: Record<Bloque, string> = {
  intereses: 'Qué tanto te llama hacer esto, aunque nunca lo hayas hecho.',
  materias: 'Qué tan bien te va con estas materias en la prepa.',
  forma_trabajo: 'Qué tanto va contigo esta forma de trabajar.',
  valores: 'Qué tanto pesa esto para ti al elegir en qué trabajar.',
};

export const REACTIVOS: Reactivo[] = [
  // ── Intereses (7) ────────────────────────────────────────────────────
  { id: 'i1', bloque: 'intereses', texto: 'Cuidar o atender a alguien que se siente mal', pesosArea: { salud: 3, educacion: 2, sociales: 2 } },
  { id: 'i2', bloque: 'intereses', texto: 'Armar o reparar cosas y entender cómo funcionan por dentro', pesosArea: { ingenierias: 3, oficios: 3 } },
  { id: 'i3', bloque: 'intereses', texto: 'Vender, convencer o llevar las cuentas de un negocio', pesosArea: { economico: 3, sociales: 1 } },
  { id: 'i4', bloque: 'intereses', texto: 'Crear cosas: dibujar, escribir, grabar, diseñar', pesosArea: { arte: 3, sociales: 1 } },
  { id: 'i5', bloque: 'intereses', texto: 'Estar al aire libre, con plantas, animales o en el campo', pesosArea: { naturales: 3, oficios: 1 } },
  { id: 'i6', bloque: 'intereses', texto: 'Explicarle algo a alguien hasta que lo entiende', pesosArea: { educacion: 3, salud: 1, sociales: 1 } },
  { id: 'i7', bloque: 'intereses', texto: 'Resolver problemas con números, datos o programación', pesosArea: { ingenierias: 3, economico: 2 } },

  // ── Materias que se te dan (6) ───────────────────────────────────────
  { id: 'm1', bloque: 'materias', texto: 'Matemáticas y física', pesosArea: { ingenierias: 3, economico: 2 } },
  { id: 'm2', bloque: 'materias', texto: 'Biología y química', pesosArea: { salud: 3, naturales: 3 } },
  { id: 'm3', bloque: 'materias', texto: 'Español, lectura y redacción', pesosArea: { sociales: 3, educacion: 2, arte: 1 } },
  { id: 'm4', bloque: 'materias', texto: 'Historia y civismo', pesosArea: { sociales: 3, educacion: 2 } },
  { id: 'm5', bloque: 'materias', texto: 'Dibujo y artes', pesosArea: { arte: 3, oficios: 1 } },
  { id: 'm6', bloque: 'materias', texto: 'Taller, computación o materias de práctica', pesosArea: { oficios: 3, ingenierias: 2 } },

  // ── Forma de trabajo (4) ─────────────────────────────────────────────
  { id: 'f1', bloque: 'forma_trabajo', texto: 'Con las manos y con herramientas, no sentado en un escritorio', pesosArea: { oficios: 3, ingenierias: 1, naturales: 1 } },
  { id: 'f2', bloque: 'forma_trabajo', texto: 'Con gente todo el día, hablando y atendiendo', pesosArea: { salud: 2, educacion: 2, sociales: 2, economico: 1 } },
  { id: 'f3', bloque: 'forma_trabajo', texto: 'Con turnos, urgencias y horarios que cambian', pesosArea: { salud: 3, oficios: 2 } },
  { id: 'f4', bloque: 'forma_trabajo', texto: 'Concentrado solo en una tarea larga, sin que te interrumpan', pesosArea: { ingenierias: 2, arte: 2, naturales: 1 } },

  // ── Lo que te importa (5) ────────────────────────────────────────────
  { id: 'v1', bloque: 'valores', texto: 'Que pague bien lo más pronto posible', valor: 'dinero' },
  { id: 'v2', bloque: 'valores', texto: 'Tener un trabajo seguro y estable', valor: 'estabilidad' },
  { id: 'v3', bloque: 'valores', texto: 'Que sirva para ayudar a otras personas', valor: 'ayudar' },
  { id: 'v4', bloque: 'valores', texto: 'Poder crear cosas tuyas', valor: 'creatividad' },
  { id: 'v5', bloque: 'valores', texto: 'Trabajar por tu cuenta, sin jefe', valor: 'independencia' },
];

/** Cómo cada valor empuja hacia las áreas. Es la parte más discutible del modelo,
 *  por eso está aquí en una sola tabla y no repartida en el código. */
export const PESOS_VALOR_AREA: Record<Valor, Partial<Record<IdArea, number>>> = {
  dinero: { ingenierias: 2, economico: 2, oficios: 2, salud: 1 },
  estabilidad: { educacion: 3, salud: 2, economico: 1 },
  ayudar: { salud: 3, sociales: 3, educacion: 2 },
  creatividad: { arte: 3, ingenierias: 1, sociales: 1 },
  independencia: { oficios: 3, economico: 2, arte: 2 },
};

/** Peso de cada bloque en el resultado final. Suma 1. */
export const PESOS_BLOQUE: Record<Bloque, number> = {
  intereses: 0.4,
  materias: 0.25,
  forma_trabajo: 0.15,
  valores: 0.2,
};

export const BLOQUES: Bloque[] = ['intereses', 'materias', 'forma_trabajo', 'valores'];

export const reactivosDe = (bloque: Bloque) => REACTIVOS.filter((r) => r.bloque === bloque);

export const TOTAL_REACTIVOS = REACTIVOS.length;
