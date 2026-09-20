import { almacen } from './storage';

export type Tema = 'sistema' | 'claro' | 'oscuro';
export const CLAVE_TEMA = 'tema';

export function aplicarTema(tema: Tema): void {
  document.documentElement.dataset.tema = tema;
}

export async function leerTema(): Promise<Tema> {
  const guardado = await almacen.leer<Tema>(CLAVE_TEMA);
  return guardado === 'claro' || guardado === 'oscuro' ? guardado : 'sistema';
}

export async function guardarTema(tema: Tema): Promise<void> {
  await almacen.guardar(CLAVE_TEMA, tema);
  aplicarTema(tema);
}
