import type { IdArea } from '@/data/tipos';
import type { Respuestas } from './puntuacion';

/** Señales personalizadas para la ficha de carrera.
 *
 *  Reglas explícitas y auditables, igual que la puntuación: cada una dice qué respuesta
 *  del alumno la dispara y qué le decimos. Nada de inferencias escondidas en un componente.
 *  Solo se activan si el alumno ya contestó su mapa; si no, la ficha se muestra genérica.
 */

export interface Senal {
  id: string;
  /** Reactivo que la dispara. */
  reactivo: string;
  /** Áreas donde la señal aplica. */
  areas: IdArea[];
  /** Se activa cuando la respuesta es menor o igual a este valor (0–3). */
  siRespuestaMenorIgual: number;
  mensaje: string;
}

export const SENALES: Senal[] = [
  {
    id: 'mate-baja',
    reactivo: 'm1',
    areas: ['ingenierias', 'economico'],
    siRespuestaMenorIgual: 1,
    mensaje:
      'Dijiste que las matemáticas y la física no se te dan mucho. Aquí son el filtro de los primeros semestres: se puede, pero vas a tener que darles tiempo extra desde el día uno.',
  },
  {
    id: 'ciencias-baja',
    reactivo: 'm2',
    areas: ['salud', 'naturales'],
    siRespuestaMenorIgual: 1,
    mensaje:
      'Dijiste que biología y química no se te dan mucho. Esta ruta está llena de las dos desde el principio.',
  },
  {
    id: 'lectura-baja',
    reactivo: 'm3',
    areas: ['sociales', 'educacion'],
    siRespuestaMenorIgual: 1,
    mensaje:
      'Dijiste que la lectura y la redacción no se te dan mucho. Aquí se lee y se escribe todos los días, y eso no baja con los semestres.',
  },
  {
    id: 'turnos',
    reactivo: 'f3',
    areas: ['salud', 'oficios'],
    siRespuestaMenorIgual: 1,
    mensaje:
      'Dijiste que los turnos y los horarios que cambian no van contigo. En esta ruta es lo normal, sobre todo al empezar.',
  },
  {
    id: 'gente',
    reactivo: 'f2',
    areas: ['salud', 'educacion', 'sociales'],
    siRespuestaMenorIgual: 1,
    mensaje:
      'Dijiste que estar con gente todo el día no te acomoda tanto. Este trabajo es de trato constante con personas.',
  },
  {
    id: 'manos',
    reactivo: 'f1',
    areas: ['oficios'],
    siRespuestaMenorIgual: 1,
    mensaje:
      'Dijiste que el trabajo con las manos y herramientas no te llama mucho. Aquí es prácticamente todo el trabajo.',
  },
];

/** Señales que aplican a una carrera, según lo que contestó el alumno. */
export function senalesPara(area: IdArea, respuestas: Respuestas): string[] {
  return SENALES.filter((senal) => {
    if (!senal.areas.includes(area)) return false;
    const respuesta = respuestas[senal.reactivo];
    return respuesta !== undefined && respuesta <= senal.siRespuestaMenorIgual;
  }).map((senal) => senal.mensaje);
}

/** Regla aparte: quien necesita dinero pronto y elige una carrera larga merece el aviso. */
export function senalDuracion(duracionAnios: number, respuestas: Respuestas): string | null {
  const quiereDineroPronto = (respuestas['v1'] ?? 0) >= 3;
  if (quiereDineroPronto && duracionAnios >= 5) {
    return 'Dijiste que te urge que pague bien pronto. Esta ruta son varios años antes del primer sueldo completo; compárala con una técnica o un TSU de la misma área antes de decidir.';
  }
  return null;
}
