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

Para GitHub Pages u otro subdirectorio: `VITE_BASE=/nombreapp/ npm run build`.

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
