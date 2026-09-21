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

/** Prefijo de las claves guardadas. Se queda como 'nombreapp' aunque la app ahora se
 *  llame Vocatlas: cambiarlo dejaría fuera de alcance lo que los alumnos ya tienen
 *  guardado en su dispositivo. Es un identificador interno, no se muestra a nadie. */
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

/** Observador de cambios: lo usa la sincronización para encolar sin que la capa de
 *  almacenamiento tenga que conocerla (si no, se hacen un nudo importándose entre sí). */
type Observador = (clave: string, operacion: 'guardar' | 'borrar') => void;
let observador: Observador | null = null;
export const observarCambios = (fn: Observador | null) => {
  observador = fn;
};

/** Claves que pueden guardarse SIN consentimiento del tutor: el registro del propio
 *  consentimiento y una preferencia de interfaz que no es dato personal. */
export const CLAVES_SIN_CONSENTIMIENTO = ['consentimiento', 'tema'];

/** Puerta de consentimiento.
 *
 *  Los usuarios son menores de edad: mientras no haya consentimiento del padre o tutor,
 *  NADA se escribe en disco. La app sigue funcionando (todo va a memoria y se pierde al
 *  cerrar), pero no se persiste un solo dato. Está implementado aquí, en la capa de
 *  almacenamiento, no en la interfaz: así ningún componente puede saltárselo por descuido.
 */
export class AlmacenConConsentimiento implements Almacen {
  #persistente: Almacen;
  #memoria = new AlmacenMemoria();
  #consentido = false;

  constructor(persistente: Almacen) {
    this.#persistente = persistente;
  }

  get consentido() {
    return this.#consentido;
  }

  /** La llama la app al arrancar si encuentra un consentimiento vigente. */
  activarConsentimiento() {
    this.#consentido = true;
  }

  /** Al revocar, lo que estaba en disco se borra de verdad (ARCO: cancelación). */
  async revocarConsentimiento() {
    this.#consentido = false;
    for (const clave of await this.#persistente.claves()) {
      if (clave !== 'consentimiento') await this.#persistente.borrar(clave);
    }
    await this.#memoria.limpiar();
  }

  #destino(clave: string): Almacen {
    if (this.#consentido || CLAVES_SIN_CONSENTIMIENTO.includes(clave)) return this.#persistente;
    return this.#memoria;
  }

  leer<T>(clave: string) {
    return this.#destino(clave).leer<T>(clave);
  }
  guardar<T>(clave: string, valor: T) {
    observador?.(clave, 'guardar');
    return this.#destino(clave).guardar(clave, valor);
  }
  borrar(clave: string) {
    observador?.(clave, 'borrar');
    // se borra en los dos lados: nunca debe quedar un rastro por el camino
    return Promise.all([this.#persistente.borrar(clave), this.#memoria.borrar(clave)]).then(() => undefined);
  }
  async limpiar() {
    await Promise.all([this.#persistente.limpiar(), this.#memoria.limpiar()]);
  }
  async claves() {
    const [persistentes, enMemoria] = await Promise.all([this.#persistente.claves(), this.#memoria.claves()]);
    return [...new Set([...persistentes, ...enMemoria])];
  }
  suscribir(clave: string, escucha: (valor: unknown) => void) {
    return this.#destino(clave).suscribir(clave, escucha);
  }
}

const base: Almacen =
  typeof window !== 'undefined' && hayLocalStorage() ? new AlmacenLocal() : new AlmacenMemoria();

export const almacen = new AlmacenConConsentimiento(base);

export const almacenaEnDispositivo = base instanceof AlmacenLocal;
