import type { Area, CatalogoAreas, CatalogoCarreras, Carrera } from './tipos';

/** Carga del catálogo: fetch a un JSON estático (lo precachea el SW en la instalación),
 *  no import estático, para que no entre al bundle inicial. */

const base = import.meta.env.BASE_URL;

let promesaCarreras: Promise<Carrera[]> | null = null;
let promesaAreas: Promise<Area[]> | null = null;

async function leerJson<T>(archivo: string): Promise<T> {
  const respuesta = await fetch(`${base}datos/${archivo}`, { cache: 'no-cache' });
  if (!respuesta.ok) throw new Error(`No se pudo leer ${archivo} (${respuesta.status})`);
  return (await respuesta.json()) as T;
}

export function obtenerCarreras(): Promise<Carrera[]> {
  promesaCarreras ??= leerJson<CatalogoCarreras>('carreras.json').then((c) => c.carreras);
  return promesaCarreras;
}

export function obtenerAreas(): Promise<Area[]> {
  promesaAreas ??= leerJson<CatalogoAreas>('areas.json').then((c) => c.areas);
  return promesaAreas;
}

export async function obtenerCarrera(id: string): Promise<Carrera | undefined> {
  const carreras = await obtenerCarreras();
  return carreras.find((c) => c.id === id);
}
