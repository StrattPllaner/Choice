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

## Reglas del proyecto

- Ningún componente toca `localStorage`: todo pasa por `src/lib/storage.ts` (API asíncrona,
  lista para cambiar a backend sin tocar la UI).
- Los datos de carreras se leen con `fetch` desde `public/datos/`, nunca con `import` estático.
- Colores solo con tokens de Tailwind (`bg-superficie`, `text-texto-suave`…), nunca `#hex` suelto.
- Todo lo clickeable lleva la clase `.toque` (44×44 px mínimo).
