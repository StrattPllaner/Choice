/** Recorta las fuentes al juego de caracteres que de verdad usa la app en español mexicano.
 *  El subconjunto "latin" de Google trae glifos de idiomas que no usamos; en 3G eso se paga.
 *  Requiere fonttools (pip install fonttools brotli). Solo se corre al cambiar de fuente. */
import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// ASCII imprimible + acentos y signos del español + comillas, guiones y símbolos de la interfaz
const UNICODES =
  'U+0020-007E,U+00A0,U+00A1,U+00BF,U+00C0-00FF,U+0100-0101,U+2018-201D,U+2013,U+2014,U+2026,U+20AC,U+00D7,U+00B7,U+2022,U+2190-2193,U+2713,U+2605,U+2606,U+25CF';

for (const archivo of ['inter-latin.woff2', 'nunito-latin.woff2']) {
  const ruta = resolve(RAIZ, 'src/styles/fuentes', archivo);
  const antes = statSync(ruta).size;
  execFileSync('python3', [
    '-m', 'fontTools.subset', ruta,
    `--unicodes=${UNICODES}`,
    '--layout-features=kern,liga,ccmp,locl,mark,mkmk',
    '--flavor=woff2',
    '--no-hinting',
    '--desubroutinize',
    `--output-file=${ruta}`,
  ]);
  const despues = statSync(ruta).size;
  console.log(`fuente · ${archivo} · ${(antes / 1024).toFixed(1)} KB → ${(despues / 1024).toFixed(1)} KB`);
}
