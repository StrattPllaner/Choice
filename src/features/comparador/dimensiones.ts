import { tieneFuente } from '@/data/reglas.js';
import { materiasDeRiesgo } from '@/lib/carreras';
import type { Carrera, Dato, Fuente } from '@/data/tipos';
import type { ResultadoPerfil } from '@/features/perfil/puntuacion';

/** Dimensiones del comparador.
 *
 *  Cada dimensión sabe cómo sacar su valor, cómo escribirlo, si más es mejor o peor,
 *  y de dónde salió. Así la tabla de comparación no tiene lógica escondida y agregar una
 *  dimensión nueva es agregar un objeto a esta lista.
 */

export type Mejor = 'mayor' | 'menor' | 'ninguno';

export interface Dimension {
  id: string;
  etiqueta: string;
  ayuda?: string;
  mejor: Mejor;
  /** null = no hay dato con fuente para esa carrera. */
  valor: (carrera: Carrera, perfil: ResultadoPerfil | null) => number | null;
  texto: (carrera: Carrera, perfil: ResultadoPerfil | null) => string;
  fuentes?: (carrera: Carrera) => Fuente[];
  /** Por qué falta, cuando falta. */
  porQueFalta?: string;
}

const pesos = (monto: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(monto);

const valorDeDato = <T,>(dato: Dato<T>): T | null => (tieneFuente(dato) ? (dato as { valor: T }).valor : null);
const fuentesDeDato = <T,>(dato: Dato<T>): Fuente[] => (tieneFuente(dato) ? (dato as { fuentes: Fuente[] }).fuentes : []);

const ORDEN_SATURACION = { baja: 1, media: 2, alta: 3, muy_alta: 4 } as const;
const TEXTO_SATURACION = {
  baja: 'Poca competencia',
  media: 'Equilibrada',
  alta: 'Muchos egresados',
  muy_alta: 'Muy saturada',
} as const;

const SIN_DATO = 'Dato no disponible';

export const DIMENSIONES: Dimension[] = [
  {
    id: 'duracion',
    etiqueta: 'Cuánto dura',
    mejor: 'menor',
    valor: (carrera) => carrera.duracionAnios,
    texto: (carrera) => `${carrera.duracionAnios} ${carrera.duracionAnios === 1 ? 'año' : 'años'}`,
  },
  {
    id: 'costo',
    etiqueta: 'Costo total de estudiarla',
    mejor: 'menor',
    porQueFalta: 'Los costos cambian por escuela y estado; solo los publicamos con la cuota oficial como fuente.',
    valor: (carrera) => {
      const rango = valorDeDato(carrera.costos.publicaMxn) ?? valorDeDato(carrera.costos.privadaMxn);
      return rango ? (rango.min + rango.max) / 2 : null;
    },
    texto: (carrera) => {
      const publica = valorDeDato(carrera.costos.publicaMxn);
      const privada = valorDeDato(carrera.costos.privadaMxn);
      if (!publica && !privada) return SIN_DATO;
      const partes = [];
      if (publica) partes.push(`Pública: ${pesos(publica.min)}–${pesos(publica.max)}`);
      if (privada) partes.push(`Privada: ${pesos(privada.min)}–${pesos(privada.max)}`);
      return partes.join(' · ');
    },
    fuentes: (carrera) => [...fuentesDeDato(carrera.costos.publicaMxn), ...fuentesDeDato(carrera.costos.privadaMxn)],
  },
  {
    id: 'salario-entrada',
    etiqueta: 'Sueldo al entrar',
    ayuda: 'Mediana, no el mejor caso.',
    mejor: 'mayor',
    porQueFalta: 'Falta procesar los microdatos de la ENOE para esta carrera.',
    valor: (carrera) => {
      const rango = valorDeDato(carrera.laboral.salarioEntradaMxn);
      return rango ? (rango.min + rango.max) / 2 : null;
    },
    texto: (carrera) => {
      const rango = valorDeDato(carrera.laboral.salarioEntradaMxn);
      return rango ? `${pesos(rango.min)} a ${pesos(rango.max)} al mes` : SIN_DATO;
    },
    fuentes: (carrera) => fuentesDeDato(carrera.laboral.salarioEntradaMxn),
  },
  {
    id: 'salario-cinco',
    etiqueta: 'Sueldo a 5 años',
    ayuda: 'También es mediana.',
    mejor: 'mayor',
    porQueFalta: 'Falta procesar los microdatos de la ENOE para esta carrera.',
    valor: (carrera) => {
      const rango = valorDeDato(carrera.laboral.salarioCincoAniosMxn);
      return rango ? (rango.min + rango.max) / 2 : null;
    },
    texto: (carrera) => {
      const rango = valorDeDato(carrera.laboral.salarioCincoAniosMxn);
      return rango ? `${pesos(rango.min)} a ${pesos(rango.max)} al mes` : SIN_DATO;
    },
    fuentes: (carrera) => fuentesDeDato(carrera.laboral.salarioCincoAniosMxn),
  },
  {
    id: 'saturacion',
    etiqueta: 'Qué tan saturada',
    mejor: 'menor',
    porQueFalta: 'Se calcula cruzando egresados (ANUIES) contra empleo (ENOE); sin ese cruce citado no se publica.',
    valor: (carrera) => {
      const nivel = valorDeDato(carrera.laboral.saturacion);
      return nivel ? ORDEN_SATURACION[nivel] : null;
    },
    texto: (carrera) => {
      const nivel = valorDeDato(carrera.laboral.saturacion);
      return nivel ? TEXTO_SATURACION[nivel] : SIN_DATO;
    },
    fuentes: (carrera) => fuentesDeDato(carrera.laboral.saturacion),
  },
  {
    id: 'informalidad',
    etiqueta: 'Termina en informalidad',
    ayuda: 'Sin contrato ni seguro social.',
    mejor: 'menor',
    porQueFalta: 'Sale de los microdatos de la ENOE del INEGI.',
    valor: (carrera) => valorDeDato(carrera.laboral.tasaInformalidad),
    texto: (carrera) => {
      const tasa = valorDeDato(carrera.laboral.tasaInformalidad);
      return tasa === null ? SIN_DATO : `${(tasa * 100).toLocaleString('es-MX', { maximumFractionDigits: 1 })}%`;
    },
    fuentes: (carrera) => fuentesDeDato(carrera.laboral.tasaInformalidad),
  },
  {
    id: 'dificultad',
    etiqueta: 'Materias marcadas como difíciles',
    ayuda: 'Conteo de nuestro mapa de materias, no una medición oficial de reprobación.',
    mejor: 'menor',
    valor: (carrera) => materiasDeRiesgo(carrera).length,
    texto: (carrera) => {
      const total = materiasDeRiesgo(carrera).length;
      return `${total} de ${carrera.mapaMaterias.periodos.reduce((suma, p) => suma + p.materias.length, 0)} materias`;
    },
  },
  {
    id: 'afinidad',
    etiqueta: 'Afinidad con tu mapa',
    mejor: 'mayor',
    porQueFalta: 'Arma tu mapa de exploración y aquí aparece qué tanto se acerca a lo que contestaste.',
    valor: (carrera, perfil) => perfil?.afinidades.find((a) => a.area === carrera.area)?.puntaje ?? null,
    texto: (carrera, perfil) => {
      const puntaje = perfil?.afinidades.find((a) => a.area === carrera.area)?.puntaje;
      if (puntaje === undefined) return 'Sin mapa contestado';
      const sugerida = perfil?.sugeridas.includes(carrera.area);
      return `${puntaje} de 100${sugerida ? ' · área sugerida para ti' : ''}`;
    },
  },
];

/** En qué dimensiones gana cada carrera. No hay ganadora global: la decisión no es solo numérica. */
export function mejoresPorDimension(
  carreras: Carrera[],
  perfil: ResultadoPerfil | null
): Record<string, string[]> {
  const mejores: Record<string, string[]> = {};

  for (const dimension of DIMENSIONES) {
    if (dimension.mejor === 'ninguno') continue;
    const valores = carreras
      .map((carrera) => ({ id: carrera.id, valor: dimension.valor(carrera, perfil) }))
      .filter((entrada): entrada is { id: string; valor: number } => entrada.valor !== null);

    if (valores.length < 2) continue; // con un solo dato no hay comparación que resaltar

    const objetivo =
      dimension.mejor === 'mayor'
        ? Math.max(...valores.map((v) => v.valor))
        : Math.min(...valores.map((v) => v.valor));
    const ganadoras = valores.filter((v) => v.valor === objetivo);
    if (ganadoras.length === valores.length) continue; // empate total: no resalta nada
    mejores[dimension.id] = ganadoras.map((v) => v.id);
  }

  return mejores;
}
