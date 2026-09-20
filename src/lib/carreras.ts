import {
  calcularPendientes,
  esVerificada,
  tieneFuente,
  CAMPOS_DUROS,
} from '@/data/reglas.js';
import type {
  Area,
  Beca,
  Carrera,
  CatalogoAreas,
  CatalogoBecas,
  CatalogoCarreras,
  Dato,
  IdArea,
  Materia,
  Modalidad,
  Nivel,
  RangoMxn,
  RiesgoMateria,
} from '@/data/tipos';

/* ── Carga ───────────────────────────────────────────────────────────── */

const base = import.meta.env.BASE_URL;
const cache = new Map<string, Promise<unknown>>();

function leerJson<T>(archivo: string): Promise<T> {
  let promesa = cache.get(archivo) as Promise<T> | undefined;
  if (!promesa) {
    promesa = fetch(`${base}datos/${archivo}`)
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error(`No se pudo leer ${archivo} (${respuesta.status})`);
        return respuesta.json() as Promise<T>;
      })
      .catch((error) => {
        cache.delete(archivo); // permite reintentar cuando vuelva la señal
        throw error;
      });
    cache.set(archivo, promesa);
  }
  return promesa;
}

export const cargarCatalogo = () => leerJson<CatalogoCarreras>('carreras.json');
export const cargarCarreras = () => cargarCatalogo().then((c) => c.carreras);
export const cargarAreas = () => leerJson<CatalogoAreas>('areas.json').then((c) => c.areas);
export const cargarBecas = () => leerJson<CatalogoBecas>('becas.json').then((c) => c.becas);

export async function cargarCarrera(id: string): Promise<Carrera | undefined> {
  return (await cargarCarreras()).find((carrera) => carrera.id === id);
}

/* ── Búsqueda ────────────────────────────────────────────────────────── */

/** Sin acentos y en minúsculas: en el celular nadie escribe "Ingeniería" con tilde. */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

const indice = new WeakMap<Carrera, string>();

function textoBuscable(carrera: Carrera): string {
  let texto = indice.get(carrera);
  if (!texto) {
    texto = normalizar([carrera.nombre, ...carrera.nombresAlternativos, carrera.area, carrera.nivel].join(' '));
    indice.set(carrera, texto);
  }
  return texto;
}

export function buscarCarreras(carreras: Carrera[], consulta: string): Carrera[] {
  const terminos = normalizar(consulta).split(/\s+/).filter(Boolean);
  if (terminos.length === 0) return carreras;
  return carreras.filter((carrera) => {
    const texto = textoBuscable(carrera);
    return terminos.every((termino) => texto.includes(termino));
  });
}

/* ── Filtros ─────────────────────────────────────────────────────────── */

export interface FiltrosCarrera {
  texto?: string;
  areas?: IdArea[];
  niveles?: Nivel[];
  modalidades?: Modalidad[];
  /** Para quien no puede estudiar muchos años. */
  duracionMaximaAnios?: number;
  /** Solo carreras con todos los datos duros respaldados. */
  soloVerificadas?: boolean;
  /** Solo carreras con alguna beca aplicable en el catálogo. */
  conBeca?: boolean;
}

export const FILTROS_VACIOS: FiltrosCarrera = {};

export function filtrarCarreras(carreras: Carrera[], filtros: FiltrosCarrera = {}): Carrera[] {
  const { texto, areas, niveles, modalidades, duracionMaximaAnios, soloVerificadas, conBeca } = filtros;
  let resultado = texto ? buscarCarreras(carreras, texto) : carreras;

  if (areas?.length) resultado = resultado.filter((c) => areas.includes(c.area));
  if (niveles?.length) resultado = resultado.filter((c) => niveles.includes(c.nivel));
  if (modalidades?.length) {
    resultado = resultado.filter((c) => c.modalidades.some((m) => modalidades.includes(m)));
  }
  if (typeof duracionMaximaAnios === 'number') {
    resultado = resultado.filter((c) => c.duracionAnios <= duracionMaximaAnios);
  }
  if (soloVerificadas) resultado = resultado.filter((c) => c.verificado);
  if (conBeca) resultado = resultado.filter((c) => c.becas.length > 0);

  return resultado;
}

export type Orden = 'alfabetico' | 'mas_corta' | 'mas_larga' | 'verificadas_primero';

export function ordenarCarreras(carreras: Carrera[], orden: Orden = 'alfabetico'): Carrera[] {
  const copia = [...carreras];
  const porNombre = (a: Carrera, b: Carrera) => a.nombre.localeCompare(b.nombre, 'es-MX');
  switch (orden) {
    case 'mas_corta':
      return copia.sort((a, b) => a.duracionAnios - b.duracionAnios || porNombre(a, b));
    case 'mas_larga':
      return copia.sort((a, b) => b.duracionAnios - a.duracionAnios || porNombre(a, b));
    case 'verificadas_primero':
      return copia.sort((a, b) => Number(b.verificado) - Number(a.verificado) || porNombre(a, b));
    default:
      return copia.sort(porNombre);
  }
}

/* ── Conteos para la UI de filtros ───────────────────────────────────── */

function contar<T extends string>(valores: T[]): Record<T, number> {
  return valores.reduce(
    (cuenta, valor) => ({ ...cuenta, [valor]: (cuenta[valor] ?? 0) + 1 }),
    {} as Record<T, number>
  );
}

export const contarPorArea = (carreras: Carrera[]) => contar(carreras.map((c) => c.area));
export const contarPorNivel = (carreras: Carrera[]) => contar(carreras.map((c) => c.nivel));
export const contarPorModalidad = (carreras: Carrera[]) => contar(carreras.flatMap((c) => c.modalidades));

export function agruparPorArea(carreras: Carrera[]): Map<IdArea, Carrera[]> {
  const grupos = new Map<IdArea, Carrera[]>();
  for (const carrera of carreras) {
    const grupo = grupos.get(carrera.area) ?? [];
    grupo.push(carrera);
    grupos.set(carrera.area, grupo);
  }
  return grupos;
}

export const buscarArea = (areas: Area[], id: IdArea) => areas.find((a) => a.id === id);

/* ── Becas ───────────────────────────────────────────────────────────── */

export function becasDe(carrera: Carrera, becas: Beca[]): Beca[] {
  return becas.filter((beca) => carrera.becas.includes(beca.id) && beca.aplicaNiveles.includes(carrera.nivel));
}

/* ── Materias y riesgo ───────────────────────────────────────────────── */

export function materiasDeRiesgo(carrera: Carrera): { periodo: number; materia: Materia }[] {
  return carrera.mapaMaterias.periodos.flatMap((periodo) =>
    periodo.materias.filter((m) => m.riesgo).map((materia) => ({ periodo: periodo.numero, materia }))
  );
}

export function riesgosDelPeriodo(carrera: Carrera, numero: number): RiesgoMateria[] {
  const periodo = carrera.mapaMaterias.periodos.find((p) => p.numero === numero);
  return periodo ? periodo.materias.flatMap((m) => (m.riesgo ? [m.riesgo] : [])) : [];
}

/** El mapa es "plantilla" mientras no se cite un plan de estudios publicado. */
export const mapaEsPlantilla = (carrera: Carrera) => carrera.mapaMaterias.estado === 'plantilla';

/* ── Transparencia de datos ──────────────────────────────────────────── */

export const TEXTO_SIN_DATO = 'Dato no disponible';

export interface EstadoDatos {
  total: number;
  conFuente: number;
  pendientes: string[];
  verificada: boolean;
}

/** Qué tan completa está la ficha. La UI lo usa para no aparentar certeza que no hay. */
export function estadoDeDatos(carrera: Carrera): EstadoDatos {
  const pendientes = calcularPendientes(carrera);
  return {
    total: CAMPOS_DUROS.length,
    conFuente: CAMPOS_DUROS.length - pendientes.length,
    pendientes,
    verificada: esVerificada(carrera),
  };
}

/** Texto listo para pintar: el valor formateado o "Dato no disponible". Nunca estima. */
export function textoDeDato<T>(dato: Dato<T>, formatear: (valor: T) => string): string {
  return tieneFuente(dato) ? formatear((dato as { valor: T }).valor) : TEXTO_SIN_DATO;
}

const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

export const formatearRango = (rango: RangoMxn): string => {
  const periodo = {
    mensual: 'al mes',
    bimestral: 'cada dos meses',
    semestral: 'por semestre',
    anual: 'al año',
    total_carrera: 'en toda la carrera',
  }[rango.periodicidad];
  return rango.min === rango.max
    ? `${pesos.format(rango.min)} ${periodo}`
    : `${pesos.format(rango.min)} a ${pesos.format(rango.max)} ${periodo}`;
};

export const formatearPorcentaje = (proporcion: number) =>
  `${(proporcion * 100).toLocaleString('es-MX', { maximumFractionDigits: 1 })}%`;

/** Todas las fuentes citadas en una ficha, sin repetir por url. */
export function fuentesDe(carrera: Carrera) {
  const datos = CAMPOS_DUROS.map((ruta) =>
    ruta.split('.').reduce<unknown>((actual, llave) => (actual as Record<string, unknown>)?.[llave], carrera)
  );
  const fuentes = [
    ...carrera.fuentes,
    ...(carrera.mapaMaterias.fuentePlan ? [carrera.mapaMaterias.fuentePlan] : []),
    ...datos.flatMap((dato) => (tieneFuente(dato) ? (dato as { fuentes: Carrera['fuentes'] }).fuentes : [])),
  ];
  return [...new Map(fuentes.map((f) => [f.url, f])).values()];
}
