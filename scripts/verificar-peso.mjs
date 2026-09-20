/** Presupuesto de rendimiento: falla el build si la carga inicial pasa de 200 KB gzip.
 *  Suma index.html + todo lo que referencia (script, stylesheet y modulepreload). */
import { gzipSync } from 'node:zlib';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const LIMITE_KB = 200;
const DIST = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
const indice = resolve(DIST, 'index.html');

if (!existsSync(indice)) {
  console.error('No hay dist/index.html. Corre primero: npm run build');
  process.exit(1);
}

const html = readFileSync(indice, 'utf8');
const referencias = new Set(
  [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map((m) => m[1].replace(/^[./]*/, ''))
);

const gz = (buf) => gzipSync(buf, { level: 9 }).length;
const filas = [['index.html', gz(Buffer.from(html))]];

for (const ref of referencias) {
  const ruta = resolve(DIST, ref);
  if (existsSync(ruta)) filas.push([ref, gz(readFileSync(ruta))]);
}

const total = filas.reduce((suma, [, bytes]) => suma + bytes, 0);
for (const [nombre, bytes] of filas.sort((a, b) => b[1] - a[1])) {
  console.log(`  ${(bytes / 1024).toFixed(1).padStart(7)} KB gzip  ${nombre}`);
}
const kb = total / 1024;
console.log(`\nCarga inicial: ${kb.toFixed(1)} KB gzip · presupuesto ${LIMITE_KB} KB`);

if (kb > LIMITE_KB) {
  console.error(`✗ Se pasó por ${(kb - LIMITE_KB).toFixed(1)} KB.`);
  process.exit(1);
}
console.log(`✓ Dentro del presupuesto (sobran ${(LIMITE_KB - kb).toFixed(1)} KB).`);
