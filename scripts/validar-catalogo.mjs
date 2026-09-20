/** Valida el catálogo ANTES de publicar. Aquí vive la regla no negociable:
 *  un dato duro sin fuente no se publica. Falla el build, no avisa y sigue.
 *
 *  Uso: node scripts/validar-catalogo.mjs [--escribir]
 *  --escribir recalcula `verificado` y `pendientes` en lugar de solo reclamarlos. */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CAMPOS_DUROS,
  FUENTES_SOLO_REFERENCIA,
  MAX_PALABRAS_MARTES,
  TIPOS_FUENTE_PERMITIDOS,
  calcularPendientes,
  contarPalabras,
  esVerificada,
  leerRuta,
  tieneFuente,
} from '../src/data/reglas.js';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DATOS = resolve(RAIZ, 'src/data');
const escribir = process.argv.includes('--escribir');

const leer = (archivo) => JSON.parse(readFileSync(resolve(DATOS, archivo), 'utf8'));

const catalogo = leer('carreras.json');
const areas = leer('areas.json');
const becas = leer('becas.json');

const errores = [];
const avisos = [];
const falla = (donde, mensaje) => errores.push(`${donde}: ${mensaje}`);

const AREAS = new Set(areas.areas.map((a) => a.id));
const NIVELES = new Set(['licenciatura', 'ingenieria', 'tsu', 'tecnica', 'certificacion']);
const MODALIDADES = new Set(['escolarizada', 'mixta', 'en_linea', 'dual', 'abierta']);
const PERIODOS = new Set(['semestre', 'cuatrimestre', 'modulo']);
const RIESGOS = new Set(['alta_reprobacion', 'alta_desercion', 'filtro']);
const BECAS = new Map(becas.becas.map((b) => [b.id, b]));

function validarFuente(donde, fuente) {
  if (!fuente || typeof fuente !== 'object') return falla(donde, 'fuente vacía o mal formada');
  for (const campo of ['nombre', 'url', 'anio', 'tipo']) {
    if (fuente[campo] === undefined || fuente[campo] === null || fuente[campo] === '') {
      falla(donde, `a la fuente le falta "${campo}"`);
    }
  }
  if (fuente.url && !/^https?:\/\//.test(fuente.url)) falla(donde, `url inválida: ${fuente.url}`);
  if (fuente.tipo && !TIPOS_FUENTE_PERMITIDOS.includes(fuente.tipo)) {
    falla(donde, `tipo de fuente no permitido: ${fuente.tipo}`);
  }
  if (typeof fuente.anio === 'number' && (fuente.anio < 2000 || fuente.anio > new Date().getFullYear() + 1)) {
    falla(donde, `año fuera de rango: ${fuente.anio}`);
  }
  // IMCO Compara Carreras: solo se enlaza y se cita, nunca se copia su base
  const esImco = FUENTES_SOLO_REFERENCIA.some((dominio) => String(fuente.url ?? '').includes(dominio));
  if (esImco && fuente.tipo !== 'referencia') {
    falla(donde, 'IMCO solo puede citarse como tipo "referencia": está prohibido copiar su base de datos');
  }
  return undefined;
}

/** El corazón: si hay valor, hay fuente. Si no hay fuente, el campo va en null. */
function validarDato(donde, dato) {
  if (dato === null) return;
  if (typeof dato !== 'object') return falla(donde, 'un dato duro debe ser null o { valor, fuentes }');
  if (dato.valor === undefined || dato.valor === null) {
    return falla(donde, 'trae fuentes pero no valor: si no hay dato, el campo va en null');
  }
  if (!Array.isArray(dato.fuentes) || dato.fuentes.length === 0) {
    return falla(donde, 'DATO DURO SIN FUENTE. O se cita de dónde salió, o el campo va en null');
  }
  dato.fuentes.forEach((fuente, i) => validarFuente(`${donde}.fuentes[${i}]`, fuente));
  return undefined;
}

/* ── Becas ───────────────────────────────────────────────────────────── */

for (const beca of becas.becas) {
  const donde = `beca "${beca.id}"`;
  validarDato(`${donde}.montoMxn`, beca.montoMxn);
  if (!Array.isArray(beca.fuentes) || beca.fuentes.length === 0) falla(donde, 'una beca sin fuente no se publica');
  else beca.fuentes.forEach((f, i) => validarFuente(`${donde}.fuentes[${i}]`, f));
  for (const nivel of beca.aplicaNiveles ?? []) {
    if (!NIVELES.has(nivel)) falla(donde, `nivel desconocido: ${nivel}`);
  }
}

/* ── Carreras ────────────────────────────────────────────────────────── */

const vistos = new Set();
let corregidas = 0;

for (const carrera of catalogo.carreras) {
  const donde = `carrera "${carrera.id}"`;

  if (vistos.has(carrera.id)) falla(donde, 'id repetido');
  vistos.add(carrera.id);

  if (!AREAS.has(carrera.area)) falla(donde, `área desconocida: ${carrera.area}`);
  if (!NIVELES.has(carrera.nivel)) falla(donde, `nivel desconocido: ${carrera.nivel}`);
  if (!carrera.modalidades?.length) falla(donde, 'sin modalidades');
  for (const modalidad of carrera.modalidades ?? []) {
    if (!MODALIDADES.has(modalidad)) falla(donde, `modalidad desconocida: ${modalidad}`);
  }
  if (!(carrera.duracionAnios > 0)) falla(donde, 'duración inválida');
  if (!Array.isArray(carrera.nombresAlternativos)) falla(donde, 'nombresAlternativos debe ser arreglo');

  const palabras = contarPalabras(carrera.martesTipico ?? '');
  if (palabras === 0) falla(donde, 'falta martesTipico');
  else if (palabras > MAX_PALABRAS_MARTES) falla(donde, `martesTipico tiene ${palabras} palabras (máximo ${MAX_PALABRAS_MARTES})`);

  const mapa = carrera.mapaMaterias ?? {};
  if (!PERIODOS.has(mapa.tipoPeriodo)) falla(donde, `tipoPeriodo inválido: ${mapa.tipoPeriodo}`);
  if (!mapa.periodos?.length) falla(donde, 'mapa de materias vacío');
  if (mapa.estado === 'verificado') {
    if (!mapa.fuentePlan) falla(donde, 'mapa marcado como verificado sin plan de estudios citado');
    else validarFuente(`${donde}.mapaMaterias.fuentePlan`, mapa.fuentePlan);
    if (mapa.fuentePlan && mapa.fuentePlan.tipo !== 'plan_estudios') {
      falla(donde, 'la fuente del mapa debe ser un plan de estudios publicado');
    }
  } else if (mapa.estado !== 'plantilla') {
    falla(donde, `estado de mapa inválido: ${mapa.estado}`);
  }
  for (const periodo of mapa.periodos ?? []) {
    for (const materia of periodo.materias ?? []) {
      if (!materia.nombre) falla(donde, `materia sin nombre en el periodo ${periodo.numero}`);
      if (materia.riesgo && !RIESGOS.has(materia.riesgo)) falla(donde, `riesgo inválido: ${materia.riesgo}`);
    }
  }

  const batalla = carrera.quienBatalla ?? {};
  if (!batalla.resumen) falla(donde, 'falta quienBatalla.resumen');
  if (!batalla.senales?.length || !batalla.queAyuda?.length) falla(donde, 'quienBatalla incompleto');

  for (const ruta of CAMPOS_DUROS) validarDato(`${donde}.${ruta}`, leerRuta(carrera, ruta));

  for (const idBeca of carrera.becas ?? []) {
    const beca = BECAS.get(idBeca);
    if (!beca) falla(donde, `beca inexistente: ${idBeca}`);
    else if (!beca.aplicaNiveles.includes(carrera.nivel)) {
      falla(donde, `la beca "${idBeca}" no aplica al nivel ${carrera.nivel}`);
    }
  }

  (carrera.fuentes ?? []).forEach((f, i) => validarFuente(`${donde}.fuentes[${i}]`, f));

  // verificado y pendientes se calculan, no se declaran a mano
  const pendientes = calcularPendientes(carrera);
  const verificado = esVerificada(carrera);
  const desfasado =
    carrera.verificado !== verificado || JSON.stringify(carrera.pendientes ?? []) !== JSON.stringify(pendientes);

  if (desfasado) {
    if (escribir) {
      carrera.verificado = verificado;
      carrera.pendientes = pendientes;
      corregidas++;
    } else {
      falla(donde, `"verificado"/"pendientes" no coinciden con los datos. Corre: npm run datos`);
    }
  }
}

if (escribir && corregidas > 0) {
  writeFileSync(resolve(DATOS, 'carreras.json'), `${JSON.stringify(catalogo, null, 2)}\n`);
}

/* ── Reporte ─────────────────────────────────────────────────────────── */

const total = catalogo.carreras.length;
const verificadas = catalogo.carreras.filter((c) => c.verificado).length;
const porNivel = catalogo.carreras.reduce((cuenta, c) => ({ ...cuenta, [c.nivel]: (cuenta[c.nivel] ?? 0) + 1 }), {});
const camposConFuente = catalogo.carreras.reduce(
  (suma, c) => suma + CAMPOS_DUROS.filter((ruta) => tieneFuente(leerRuta(c, ruta))).length,
  0
);

console.log(`Catálogo: ${total} carreras · ${Object.entries(porNivel).map(([k, v]) => `${k}: ${v}`).join(' · ')}`);
console.log(`Verificadas (todos sus datos duros con fuente): ${verificadas}/${total}`);
console.log(`Datos duros con fuente: ${camposConFuente}/${total * CAMPOS_DUROS.length}`);
if (corregidas) console.log(`Recalculadas ${corregidas} fichas (verificado/pendientes).`);

for (const aviso of avisos) console.warn(`aviso · ${aviso}`);

if (errores.length) {
  console.error(`\n✗ ${errores.length} problema(s):`);
  for (const error of errores.slice(0, 40)) console.error(`  · ${error}`);
  if (errores.length > 40) console.error(`  … y ${errores.length - 40} más`);
  process.exit(1);
}
console.log('✓ Catálogo válido: ningún dato duro sin fuente.');
