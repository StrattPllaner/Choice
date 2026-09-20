/** Pruebas de la lógica de puntuación del perfil. Fijan lo que no debe romperse:
 *  siempre 3+ áreas, orden estable, sin contestar no penaliza, avisos de confianza baja.
 *  Compila el TS con esbuild (ya viene con Vite) y lo corre en Node, sin agregar dependencias. */
import { build } from 'esbuild';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const salida = resolve(mkdtempSync(resolve(tmpdir(), 'nombreapp-')), 'puntuacion.mjs');

await build({
  entryPoints: [resolve(RAIZ, 'src/features/perfil/puntuacion.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: salida,
  logLevel: 'error',
  alias: { '@': resolve(RAIZ, 'src') },
});

const { calcularPerfil, compararPerfiles, MINIMO_SUGERIDAS, VERSION_ALGORITMO } = await import(
  pathToFileURL(salida).href
);
const { REACTIVOS } = await import(
  pathToFileURL(await compilar('src/features/perfil/reactivos.ts')).href
);

async function compilar(ruta) {
  const destino = resolve(mkdtempSync(resolve(tmpdir(), 'nombreapp-')), 'mod.mjs');
  await build({
    entryPoints: [resolve(RAIZ, ruta)],
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile: destino,
    logLevel: 'error',
    alias: { '@': resolve(RAIZ, 'src') },
  });
  return destino;
}

let fallas = 0;
const prueba = (nombre, condicion, detalle = '') => {
  if (condicion) console.log(`  ✓ ${nombre}`);
  else {
    console.error(`  ✗ ${nombre}${detalle ? ` · ${detalle}` : ''}`);
    fallas++;
  }
};

const responder = (fn) => Object.fromEntries(REACTIVOS.map((r) => [r.id, fn(r)]));

console.log(`Puntuación del perfil · algoritmo ${VERSION_ALGORITMO}`);

// 1. Nunca una sola área
const todoAlto = responder(() => 3);
const rTodoAlto = calcularPerfil(todoAlto);
prueba(`siempre sugiere al menos ${MINIMO_SUGERIDAS} áreas`, rTodoAlto.sugeridas.length >= MINIMO_SUGERIDAS, `dio ${rTodoAlto.sugeridas.length}`);

const vacio = calcularPerfil({});
prueba('sin respuestas también sugiere 3 áreas y no truena', vacio.sugeridas.length >= MINIMO_SUGERIDAS);

// 2. Coherencia: quien responde alto solo a lo de salud, debe ver salud arriba
const soloSalud = responder((r) => {
  const pesos = r.pesosArea ?? {};
  if (pesos.salud) return 3;
  if (r.valor === 'ayudar') return 3;
  return 0;
});
const rSalud = calcularPerfil(soloSalud);
prueba('respuestas de salud ponen salud en primer lugar', rSalud.afinidades[0].area === 'salud', `dio ${rSalud.afinidades[0].area}`);

const soloManos = responder((r) => {
  const pesos = r.pesosArea ?? {};
  if (pesos.oficios) return 3;
  if (r.valor === 'independencia') return 3;
  return 0;
});
const rManos = calcularPerfil(soloManos);
prueba('respuestas de taller y oficios ponen oficios en primer lugar', rManos.afinidades[0].area === 'oficios', `dio ${rManos.afinidades[0].area}`);

// 3. Determinismo y orden estable
const a = calcularPerfil(soloSalud);
const b = calcularPerfil(soloSalud);
prueba('mismas respuestas dan exactamente el mismo resultado', JSON.stringify(a) === JSON.stringify(b));
prueba('las afinidades vienen ordenadas de mayor a menor', a.afinidades.every((x, i, arr) => i === 0 || arr[i - 1].puntaje >= x.puntaje));

// 4. Rango
prueba('ningún puntaje se sale de 0–100', a.afinidades.every((x) => x.puntaje >= 0 && x.puntaje <= 100));

// 5. Sin contestar no penaliza
const parcial = { i1: 3, m2: 3 };
const rParcial = calcularPerfil(parcial);
prueba('un cuestionario a medias no manda todo a cero', rParcial.afinidades[0].puntaje > 0);
prueba('reporta cuántos reactivos se contestaron', rParcial.contestados === 2 && rParcial.total === REACTIVOS.length);

// 6. Avisos de confianza
prueba('avisa confianza baja cuando se contesta todo igual', rTodoAlto.confianza === 'baja' && Boolean(rTodoAlto.motivoConfianza));
prueba('confianza normal con respuestas variadas', calcularPerfil(soloSalud).confianza === 'normal');

// 7. Comparación entre versiones
const comparacion = compararPerfiles(rSalud, rManos);
const oficios = comparacion.find((c) => c.area === 'oficios');
prueba('la comparación detecta que oficios subió', oficios && oficios.cambio > 0, JSON.stringify(oficios));

console.log(fallas === 0 ? '\n✓ Puntuación: todas las pruebas pasan.' : `\n✗ ${fallas} prueba(s) fallaron.`);
process.exit(fallas === 0 ? 0 : 1);
