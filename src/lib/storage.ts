/** Capa de almacenamiento.
 *
 *  Los componentes NUNCA usan localStorage directo: hablan con `almacen`, cuya API es
 *  asíncrona a propósito. El día que haya backend se escribe un `AlmacenHttp` con la
 *  misma interfaz y se cambia una sola línea (`almacen = ...`), sin tocar la UI.
 */

export interface Almacen {
  leer<T>(clave: string): Promise<T | null>;
  guardar<T>(clave: string, valor: T): Promise<void>;
  borrar(clave: string): Promise<void>;
  limpiar(): Promise<void>;
  claves(): Promise<string[]>;
  /** Avisa cuando otra pestaña (u otro origen de cambio) modifica una clave. */
  suscribir(clave: string, escucha: (valor: unknown) => void): () => void;
}

export const ESPACIO = 'nombreapp';
export const VERSION_DATOS = 'v1';

const prefijo = `${ESPACIO}:${VERSION_DATOS}:`;
const conPrefijo = (clave: string) => `${prefijo}${clave}`;

function hayLocalStorage(): boolean {
  try {
    const prueba = `${prefijo}__prueba__`;
    window.localStorage.setItem(prueba, '1');
    window.localStorage.removeItem(prueba);
    return true;
  } catch {
    return false; // modo privado, cuota llena o WebView con storage bloqueado
  }
}

type Oyentes = Map<string, Set<(valor: unknown) => void>>;

function crearOyentes() {
  const oyentes: Oyentes = new Map();
  return {
    oyentes,
    suscribir(clave: string, escucha: (valor: unknown) => void) {
      const conjunto = oyentes.get(clave) ?? new Set();
      conjunto.add(escucha);
      oyentes.set(clave, conjunto);
      return () => conjunto.delete(escucha);
    },
    avisar(clave: string, valor: unknown) {
      oyentes.get(clave)?.forEach((escucha) => escucha(valor));
    },
  };
}

/** Implementación por defecto: localStorage con espacio de nombres y versión. */
export class AlmacenLocal implements Almacen {
  #bus = crearOyentes();

  constructor() {
    window.addEventListener('storage', (evento) => {
      if (!evento.key?.startsWith(prefijo)) return;
      const clave = evento.key.slice(prefijo.length);
      this.#bus.avisar(clave, evento.newValue ? this.#parsear(evento.newValue) : null);
    });
  }

  #parsear(texto: string): unknown {
    try {
      return JSON.parse(texto);
    } catch {
      return null; // dato corrupto: se trata como inexistente en lugar de tronar la app
    }
  }

  async leer<T>(clave: string): Promise<T | null> {
    const texto = window.localStorage.getItem(conPrefijo(clave));
    return texto === null ? null : (this.#parsear(texto) as T | null);
  }

  async guardar<T>(clave: string, valor: T): Promise<void> {
    try {
      window.localStorage.setItem(conPrefijo(clave), JSON.stringify(valor));
    } catch {
      // cuota llena: no rompemos el flujo del alumno, solo no persiste
    }
    this.#bus.avisar(clave, valor);
  }

  async borrar(clave: string): Promise<void> {
    window.localStorage.removeItem(conPrefijo(clave));
    this.#bus.avisar(clave, null);
  }

  async limpiar(): Promise<void> {
    for (const clave of await this.claves()) await this.borrar(clave);
  }

  async claves(): Promise<string[]> {
    const todas: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const clave = window.localStorage.key(i);
      if (clave?.startsWith(prefijo)) todas.push(clave.slice(prefijo.length));
    }
    return todas;
  }

  suscribir(clave: string, escucha: (valor: unknown) => void) {
    return this.#bus.suscribir(clave, escucha);
  }
}

/** Respaldo en memoria para modo privado o SSR/pruebas: la app funciona igual, solo no recuerda. */
export class AlmacenMemoria implements Almacen {
  #datos = new Map<string, unknown>();
  #bus = crearOyentes();

  async leer<T>(clave: string): Promise<T | null> {
    return (this.#datos.get(clave) as T) ?? null;
  }
  async guardar<T>(clave: string, valor: T): Promise<void> {
    this.#datos.set(clave, valor);
    this.#bus.avisar(clave, valor);
  }
  async borrar(clave: string): Promise<void> {
    this.#datos.delete(clave);
    this.#bus.avisar(clave, null);
  }
  async limpiar(): Promise<void> {
    this.#datos.clear();
  }
  async claves(): Promise<string[]> {
    return [...this.#datos.keys()];
  }
  suscribir(clave: string, escucha: (valor: unknown) => void) {
    return this.#bus.suscribir(clave, escucha);
  }
}

export const almacen: Almacen =
  typeof window !== 'undefined' && hayLocalStorage() ? new AlmacenLocal() : new AlmacenMemoria();

export const almacenaEnDispositivo = almacen instanceof AlmacenLocal;
