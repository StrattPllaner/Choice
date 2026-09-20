# NOMBREAPP

PWA de exploración vocacional para prepa (México). Lectura 100% offline, pensada para celulares
de gama baja en 3G y pantallas de 360 px.

## Correr

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # iconos + tsc + vite build + presupuesto de peso
npm run preview    # sirve dist/ (aquí SÍ se registra el service worker)
```

En línea: **https://strattpllaner.github.io/Choice/**

> `dist/index.html` NO se puede abrir con doble clic (`file://`): Chrome bloquea los módulos ES
> por CORS y la pantalla sale en blanco. Siempre por servidor (`npm run preview`) o por la URL.

### Publicar en GitHub Pages

```bash
npm run build
cd dist && touch .nojekyll && git init -q -b gh-pages && git add -A \
  && git commit -qm "Publicar build" \
  && git push -qf https://github.com/StrattPllaner/Choice.git gh-pages:gh-pages && rm -rf .git
```

El build usa `base: './'`, así que el mismo `dist/` sirve en cualquier subcarpeta. El ruteo es
por hash (`/#/explorar`) porque Pages no reescribe rutas.

## Estructura

```
public/
  manifest.webmanifest   manifest de instalación
  sw.js                  service worker (shell + datos precacheados)
  datos/*.json           catálogo de carreras y áreas (URL estable = precacheable)
  iconos/*.png           generados por scripts/generar-iconos.mjs
src/
  components/            UI reutilizable (Marco, NavInferior, Boton, Iconos…)
  features/sesion/       estado del alumno (contexto + hook)
  data/                  tipos y cargador del catálogo
  lib/                   storage, sesion, tema, formato, registro del SW
  pages/                 una pantalla por ruta (todas perezosas menos Inicio)
scripts/
  generar-iconos.mjs     PNG del manifest sin dependencias
  verificar-peso.mjs     falla el build si la carga inicial pasa de 200 KB gzip
```

## Datos del catálogo

Fuente de verdad: `src/data/*.json` (se edita a mano). `npm run datos` valida y publica una copia
minificada en `public/datos/`, que es lo que baja el celular y lo que precachea el service worker.

**Regla no negociable:** ningún dato duro se publica sin fuente citada. No es un acuerdo, es el tipo:
todo dato duro es `Dato<T> = { valor, fuentes: [Fuente, ...] } | null`. Si no hay fuente, el campo va
en `null` y la UI muestra "Dato no disponible". Nunca se estima.

- `npm run validar-datos` falla el build si aparece un valor sin fuente, una beca sin respaldo,
  un mapa de materias marcado como verificado sin plan de estudios citado, o un `martesTipico`
  de más de 120 palabras.
- `verificado` y `pendientes` no se escriben a mano: los recalcula el validador (`npm run datos`).
- Fuentes permitidas: microdatos ENOE (INEGI), ANUIES, SEP, becas de gob.mx y planes de estudio
  publicados. **IMCO Compara Carreras solo se enlaza y se cita** (`tipo: "referencia"`); el validador
  rechaza cualquier otro uso de ese dominio.
- Los mapas de materias marcados `plantilla` son materias típicas de la carrera en México, no el plan
  de una universidad concreta. Para pasarlos a `verificado` hay que citar el plan publicado.

Estado de la semilla: 30 carreras (14 licenciaturas, 6 ingenierías, 3 TSU, 4 técnicas, 3
certificaciones). Los campos descriptivos están llenos; los 7 datos duros por carrera están en `null`
a la espera de ser procesados desde ENOE/ANUIES.

## Perfil de exploración (no es un test)

22 reactivos en cuatro bloques (intereses 40%, materias 25%, forma de trabajo 15%, valores 20%),
menos de 7 minutos, se pausa y se retoma solo. El resultado es un **mapa de áreas, mínimo tres**,
nunca "tu carrera es X". Se presenta siempre con el aviso de que es una guía, no un diagnóstico.

- Lógica de puntuación: `src/features/perfil/puntuacion.ts`, explicada en
  [`docs/puntuacion-perfil.md`](docs/puntuacion-perfil.md) para que sea auditable.
- Pesos de los reactivos: `src/features/perfil/reactivos.ts` (una sola tabla, a la vista).
- Pruebas: `npm run probar-puntuacion` (corre en el build).
- Historial versionado en `src/lib/perfil.ts`: cada intento se guarda como versión nueva con
  fecha, grado y versión del algoritmo, para comparar primero contra tercero de prepa.

## Compartir por WhatsApp

`npm run tarjetas` genera `dist/c/<id>.html`: una página estática por carrera, solo con etiquetas
Open Graph, que redirige a la ficha en la app. WhatsApp no ejecuta JavaScript, así que sin estas
páginas un enlace a una SPA con hash nunca tendría vista previa. El service worker las excluye del
fallback del shell para no romperlas.

## Reglas del proyecto

- Ningún componente toca `localStorage`: todo pasa por `src/lib/storage.ts` (API asíncrona,
  lista para cambiar a backend sin tocar la UI).
- Los datos de carreras se leen con `fetch` desde `public/datos/`, nunca con `import` estático.
- Colores solo con tokens de Tailwind (`bg-superficie`, `text-texto-suave`…), nunca `#hex` suelto.
- Todo lo clickeable lleva la clase `.toque` (44×44 px mínimo).
