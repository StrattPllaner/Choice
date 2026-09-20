/** Valida contra WCAG AA cada par de texto y fondo del sistema de diseño.
 *  Corre en el build: si alguien mete un color que no pasa, no se publica. */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(resolve(RAIZ, 'src/styles/tokens.css'), 'utf8');

/** Los tres bloques: claro, oscuro por preferencia del sistema y oscuro forzado. */
function tokensDe(bloque) {
  const mapa = {};
  for (const [, nombre, valor] of bloque.matchAll(/--(color-[a-z0-9-]+):\s*(#[0-9a-f]{6})\s*;/gi)) {
    mapa[nombre] = valor.toLowerCase();
  }
  return mapa;
}

const claro = tokensDe(css.slice(0, css.indexOf('@media (prefers-color-scheme: dark)')));
const oscuro = tokensDe(css.slice(css.indexOf("[data-tema='oscuro']")));

const canal = (v) => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminancia = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * canal((n >> 16) & 255) + 0.7152 * canal((n >> 8) & 255) + 0.0722 * canal(n & 255);
};
const contraste = (a, b) => {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

/** [texto, fondo, mínimo, para qué sirve]. 4.5 = texto normal, 3 = texto grande o borde de control. */
const PARES = [
  ['color-tinta', 'color-fondo', 4.5, 'cuerpo sobre el lienzo'],
  ['color-tinta', 'color-superficie', 4.5, 'cuerpo en tarjeta'],
  ['color-tinta', 'color-superficie-2', 4.5, 'cuerpo en campo de texto'],
  ['color-tinta-suave', 'color-fondo', 4.5, 'texto secundario'],
  ['color-tinta-suave', 'color-superficie', 4.5, 'texto secundario en tarjeta'],
  ['color-tinta-suave', 'color-superficie-2', 4.5, 'ayuda dentro de un campo'],
  ['color-tinta-tenue', 'color-fondo', 3, 'metadatos (solo texto grande o bold)'],
  ['color-primario', 'color-fondo', 4.5, 'enlaces y acciones de texto'],
  ['color-primario', 'color-superficie', 4.5, 'enlaces en tarjeta'],
  ['color-primario', 'color-primario-suave', 4.5, 'texto sobre selección'],
  ['color-sobre-primario', 'color-primario', 4.5, 'texto del botón primario'],
  ['color-sobre-primario', 'color-primario-fuerte', 4.5, 'botón primario presionado'],
  ['color-sobre-acento', 'color-acento', 4.5, 'texto sobre el acento'],
  ['color-acento-texto', 'color-fondo', 4.5, 'acento usado como texto'],
  ['color-acento-texto', 'color-acento-suave', 4.5, 'texto sobre acento suave'],
  ['color-tinta', 'color-acento-suave', 4.5, 'cuerpo sobre acento suave'],
  ['color-exito', 'color-fondo', 4.5, 'confirmaciones'],
  ['color-exito', 'color-exito-suave', 4.5, 'texto en aviso de éxito'],
  ['color-atencion', 'color-fondo', 4.5, 'avisos de atención'],
  ['color-atencion', 'color-atencion-suave', 4.5, 'texto en aviso de atención'],
  ['color-error', 'color-fondo', 4.5, 'mensajes de error'],
  ['color-error', 'color-error-suave', 4.5, 'texto en aviso de error'],
  ['color-borde-fuerte', 'color-fondo', 3, 'borde de control (WCAG 1.4.11)'],
  ['color-foco', 'color-fondo', 3, 'anillo de foco'],
  ['color-serie-a', 'color-superficie', 3, 'serie A de gráficas'],
  ['color-serie-b', 'color-superficie', 3, 'serie B de gráficas'],
];

let fallas = 0;
for (const [modo, tokens] of [
  ['claro', claro],
  ['oscuro', oscuro],
]) {
  console.log(`\n${modo}:`);
  for (const [texto, fondo, minimo, uso] of PARES) {
    const a = tokens[texto];
    const b = tokens[fondo];
    if (!a || !b) {
      console.error(`  ✗ falta token: ${!a ? texto : fondo}`);
      fallas++;
      continue;
    }
    const razon = contraste(a, b);
    const pasa = razon >= minimo;
    if (!pasa) fallas++;
    console.log(
      `  ${pasa ? '✓' : '✗'} ${razon.toFixed(2)}:1 (min ${minimo}) · ${texto} sobre ${fondo} · ${uso}`
    );
  }
}

console.log(
  fallas === 0
    ? '\n✓ Contraste: todos los pares pasan WCAG AA.'
    : `\n✗ ${fallas} par(es) no pasan AA. Corrige el token antes de publicar.`
);
process.exit(fallas === 0 ? 0 : 1);
