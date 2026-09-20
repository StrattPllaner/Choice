/** Genera los iconos PNG del manifest sin dependencias (zlib de Node).
 *  Así el repo no carga binarios y el diseño se cambia en una línea. */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SALIDA = resolve(RAIZ, 'public/iconos');

const MARCA = [29, 78, 216]; // --c-marca
const BLANCO = [255, 255, 255];

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function trozo(tipo, datos) {
  const largo = Buffer.alloc(4);
  largo.writeUInt32BE(datos.length);
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(cuerpo));
  return Buffer.concat([largo, cuerpo, crc]);
}

function png(ancho, alto, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(ancho, 0);
  ihdr.writeUInt32BE(alto, 4);
  ihdr[8] = 8; // bits por canal
  ihdr[9] = 6; // RGBA
  const filas = Buffer.alloc((ancho * 4 + 1) * alto);
  for (let y = 0; y < alto; y++) {
    filas[y * (ancho * 4 + 1)] = 0; // filtro "none"
    rgba.copy(filas, y * (ancho * 4 + 1) + 1, y * ancho * 4, (y + 1) * ancho * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    trozo('IHDR', ihdr),
    trozo('IDAT', deflateSync(filas, { level: 9 })),
    trozo('IEND', Buffer.alloc(0)),
  ]);
}

const distanciaASegmento = (px, py, ax, ay, bx, by) => {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
};

/** Flecha hacia arriba: "avanzar", el mensaje de la app. */
function dibujar(size, { maskable }) {
  const rgba = Buffer.alloc(size * size * 4);
  const radio = maskable ? 0 : 0.2; // maskable va a sangre; el sistema recorta
  const escala = maskable ? 0.62 : 0.8; // zona segura del 80% en maskable
  const grosor = 0.1 * escala;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x + 0.5) / size;
      const v = (y + 0.5) / size;
      const i = (y * size + x) * 4;

      // fondo con esquinas redondeadas
      const dx = Math.max(radio - u, u - (1 - radio), 0);
      const dy = Math.max(radio - v, v - (1 - radio), 0);
      const dentro = Math.hypot(dx, dy) <= radio || (dx === 0 && dy === 0);
      if (!dentro) continue;

      rgba[i] = MARCA[0];
      rgba[i + 1] = MARCA[1];
      rgba[i + 2] = MARCA[2];
      rgba[i + 3] = 255;

      const cu = (u - 0.5) / escala + 0.5;
      const cv = (v - 0.5) / escala + 0.5;
      const enFlecha =
        distanciaASegmento(cu, cv, 0.5, 0.26, 0.24, 0.55) < grosor / 2 ||
        distanciaASegmento(cu, cv, 0.5, 0.26, 0.76, 0.55) < grosor / 2 ||
        distanciaASegmento(cu, cv, 0.5, 0.28, 0.5, 0.78) < grosor / 2;

      if (enFlecha) {
        rgba[i] = BLANCO[0];
        rgba[i + 1] = BLANCO[1];
        rgba[i + 2] = BLANCO[2];
      }
    }
  }
  return png(size, size, rgba);
}

mkdirSync(SALIDA, { recursive: true });
const archivos = [
  ['icono-192.png', dibujar(192, { maskable: false })],
  ['icono-512.png', dibujar(512, { maskable: false })],
  ['icono-maskable-512.png', dibujar(512, { maskable: true })],
];
for (const [nombre, datos] of archivos) {
  writeFileSync(resolve(SALIDA, nombre), datos);
  console.log(`icono ${nombre} · ${(datos.length / 1024).toFixed(1)} KB`);
}
