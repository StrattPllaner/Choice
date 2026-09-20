/** Contratos de los datos de carreras. Viven fuera del bundle (public/datos/*.json)
 *  para que el service worker los precache con una URL estable. */

export type IdArea = 'salud' | 'ingenierias' | 'sociales' | 'economico' | 'arte' | 'naturales';

export type NivelMate = 'poca' | 'media' | 'mucha';
export type ConQueTrabajas = 'personas' | 'datos' | 'cosas' | 'ideas';

export interface Area {
  id: IdArea;
  nombre: string;
  descripcion: string;
  color: string;
}

export interface Carrera {
  id: string;
  nombre: string;
  area: IdArea;
  resumen: string;
  duracionAnios: number;
  materiasClave: string[];
  dondeTrabajas: string[];
  /** [mínimo, máximo] en pesos mensuales al salir */
  sueldoInicialMxn: [number, number];
  demanda: 'baja' | 'media' | 'alta' | 'muy alta';
  dondeEstudiar: string[];
  esBecable: boolean;
  seTrabajaCon: ConQueTrabajas;
  requiereMate: NivelMate;
}

export interface CatalogoCarreras {
  version: number;
  actualizado: string;
  carreras: Carrera[];
}

export interface CatalogoAreas {
  version: number;
  areas: Area[];
}
