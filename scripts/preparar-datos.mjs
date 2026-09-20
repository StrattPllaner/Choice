/** Publica los datos: src/data/*.json (fuente de verdad, se edita a mano)
 *  → public/datos/*.json (URL estable que el service worker precachea). */
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DESTINO = resolve(RAIZ, 'public/datos');
mkdirSync(DESTINO, { recursive: true });

// se minifica al publicar: el JSON de src/ se lee y edita a mano, el de public/ lo baja el celular
for (const archivo of ['carreras.json', 'areas.json', 'becas.json']) {
  const origen = resolve(RAIZ, 'src/data', archivo);
  const destino = resolve(DESTINO, archivo);
  writeFileSync(destino, JSON.stringify(JSON.parse(readFileSync(origen, 'utf8'))));
  const antes = statSync(origen).size / 1024;
  const despues = statSync(destino).size / 1024;
  console.log(`datos · ${archivo} · ${antes.toFixed(1)} KB → ${despues.toFixed(1)} KB`);
}
