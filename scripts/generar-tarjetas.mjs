/** Una página estática por carrera en dist/c/<id>.html, solo con etiquetas Open Graph.
 *
 *  Por qué: la app es una SPA con ruteo por hash y WhatsApp no ejecuta JavaScript, así que
 *  jamás vería una vista previa de la ficha. Estas páginas sí la traen y mandan al usuario
 *  a la ficha dentro de la app. Es lo que hace compartible el producto. */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(RAIZ, 'dist');
const SALIDA = resolve(DIST, 'c');
const SITIO = (process.env.SITIO ?? 'https://strattpllaner.github.io/Choice/').replace(/\/?$/, '/');

const catalogo = JSON.parse(readFileSync(resolve(RAIZ, 'src/data/carreras.json'), 'utf8'));
mkdirSync(SALIDA, { recursive: true });

const escapar = (texto) =>
  texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const recortar = (texto, limite) => {
  if (texto.length <= limite) return texto;
  const corte = texto.slice(0, limite);
  return `${corte.slice(0, corte.lastIndexOf(' '))}…`;
};

for (const carrera of catalogo.carreras) {
  const titulo = `${carrera.nombre} · Vocatlas`;
  const descripcion = recortar(carrera.martesTipico, 180);
  const destino = `../#/carrera/${carrera.id}`;

  const html = `<!doctype html>
<html lang="es-MX">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapar(titulo)}</title>
    <meta name="description" content="${escapar(descripcion)}" />
    <link rel="canonical" href="${SITIO}c/${carrera.id}.html" />

    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Vocatlas" />
    <meta property="og:locale" content="es_MX" />
    <meta property="og:title" content="${escapar(carrera.nombre)}" />
    <meta property="og:description" content="${escapar(descripcion)}" />
    <meta property="og:url" content="${SITIO}c/${carrera.id}.html" />
    <meta property="og:image" content="${SITIO}iconos/portada-1200x630.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="theme-color" content="#1d4ed8" />

    <meta http-equiv="refresh" content="0; url=${destino}" />
    <script>window.location.replace('${destino}');</script>
    <style>
      body { font: 16px/1.6 system-ui, sans-serif; margin: 0; padding: 40px 24px; color: #111827; background: #fff; }
      a { color: #1d4ed8; }
      @media (prefers-color-scheme: dark) { body { background: #0b1220; color: #f0f4fc; } a { color: #7db0ff; } }
    </style>
  </head>
  <body>
    <h1>${escapar(carrera.nombre)}</h1>
    <p>${escapar(descripcion)}</p>
    <p><a href="${destino}">Abrir la ficha en Vocatlas</a></p>
  </body>
</html>
`;
  writeFileSync(resolve(SALIDA, `${carrera.id}.html`), html);
}

console.log(`tarjetas · ${catalogo.carreras.length} páginas para compartir en dist/c/`);
