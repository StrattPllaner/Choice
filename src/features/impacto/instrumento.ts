/** Instrumento de medición de impacto.
 *
 *  Se aplica al inicio (antes de usar la app) y se repite después. Mide lo que el programa
 *  dice que va a cambiar: cuánto conoce el alumno y qué tan seguro se siente, no si le gustó
 *  la app. Va dentro del producto porque una encuesta externa nadie la contesta.
 *
 *  Minimización: de las preguntas abiertas se guarda SOLO el conteo, nunca el texto.
 *  Nadie necesita saber qué carreras escribió un alumno para medir si conoce más.
 */

export const VERSION_INSTRUMENTO = '1.0.0';

export type TipoReactivo = 'conteo' | 'escala' | 'opcion';

export interface OpcionReactivo {
  valor: number;
  etiqueta: string;
}

export interface ReactivoImpacto {
  id: string;
  texto: string;
  ayuda?: string;
  tipo: TipoReactivo;
  /** Para 'opcion' y 'escala'. */
  opciones?: OpcionReactivo[];
  /** Para 'conteo': qué se le pide escribir (solo se guarda cuántas escribió). */
  placeholder?: string;
  maximoConteo?: number;
}

const SI_MAS_O_MENOS_NO: OpcionReactivo[] = [
  { valor: 0, etiqueta: 'No' },
  { valor: 0.5, etiqueta: 'Más o menos' },
  { valor: 1, etiqueta: 'Sí' },
];

export const REACTIVOS_IMPACTO: ReactivoImpacto[] = [
  {
    id: 'carreras_nombradas',
    texto: '¿Qué carreras puedes nombrar ahorita, sin buscar?',
    ayuda: 'Escribe una por renglón. Solo guardamos cuántas escribiste, no cuáles.',
    tipo: 'conteo',
    placeholder: 'Una por renglón',
    maximoConteo: 20,
  },
  {
    id: 'seguridad',
    texto: '¿Qué tan seguro te sientes de lo que vas a estudiar?',
    tipo: 'escala',
    opciones: [
      { valor: 1, etiqueta: '1 · No tengo idea' },
      { valor: 2, etiqueta: '2' },
      { valor: 3, etiqueta: '3 · Más o menos' },
      { valor: 4, etiqueta: '4' },
      { valor: 5, etiqueta: '5 · Ya lo tengo claro' },
    ],
  },
  {
    id: 'sabe_becas',
    texto: '¿Sabías que existen becas para seguir estudiando?',
    tipo: 'opcion',
    opciones: [
      { valor: 0, etiqueta: 'No sabía' },
      { valor: 0.5, etiqueta: 'Algo había oído' },
      { valor: 1, etiqueta: 'Sí, sé que existen' },
    ],
  },
  {
    id: 'becas_nombradas',
    texto: '¿Cuáles becas puedes nombrar?',
    ayuda: 'Otra vez: solo guardamos cuántas.',
    tipo: 'conteo',
    placeholder: 'Una por renglón',
    maximoConteo: 10,
  },
  {
    id: 'conoce_tsu',
    texto: '¿Sabes qué es un TSU o una carrera técnica?',
    tipo: 'opcion',
    opciones: SI_MAS_O_MENOS_NO,
  },
  {
    id: 'tsu_nombradas',
    texto: '¿Qué carreras técnicas o TSU puedes nombrar?',
    tipo: 'conteo',
    placeholder: 'Una por renglón',
    maximoConteo: 10,
  },
  {
    id: 'sabe_costo',
    texto: '¿Sabes cuánto cuesta estudiar la opción que te interesa?',
    tipo: 'opcion',
    opciones: SI_MAS_O_MENOS_NO,
  },
  {
    id: 'sabe_sueldo',
    texto: '¿Sabes cuánto se gana trabajando en esa opción?',
    tipo: 'opcion',
    opciones: SI_MAS_O_MENOS_NO,
  },
  {
    id: 'sabe_pasos',
    texto: '¿Sabes qué trámites siguen al salir de la prepa para entrar a esa opción?',
    ayuda: 'Fechas de examen, papeles, convocatorias.',
    tipo: 'opcion',
    opciones: SI_MAS_O_MENOS_NO,
  },
  {
    id: 'tiene_opcion',
    texto: '¿Ya tienes al menos una opción que te interese de verdad?',
    tipo: 'opcion',
    opciones: [
      { valor: 0, etiqueta: 'Ninguna' },
      { valor: 0.5, etiqueta: 'Estoy entre varias' },
      { valor: 1, etiqueta: 'Sí, ya tengo una' },
    ],
  },
];

export const TOTAL_REACTIVOS_IMPACTO = REACTIVOS_IMPACTO.length;

/** Seguridad de 1 o 2 = "sin rumbo definido". Es el indicador que le importa a la escuela. */
export const UMBRAL_SIN_RUMBO = 2;

/** Cuenta renglones no vacíos. Lo que se guarda es este número, nunca el texto. */
export const contarRenglones = (texto: string): number =>
  texto
    .split('\n')
    .map((linea) => linea.trim())
    .filter(Boolean).length;
