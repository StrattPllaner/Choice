/* Service worker de NOMBREAPP — escrito a mano (sin Workbox: 0 KB extra en el bundle).
   Estrategias:
   - navegación  → caché primero con revalidación en segundo plano (abre al instante offline)
   - /assets/*   → caché primero (nombres con hash: nunca cambian de contenido)
   - /datos/*    → caché primero con revalidación (lectura completa offline)
   - lo demás    → red con respaldo de caché                                        */

const VERSION = 'v3';
const CACHE_SHELL = `nombreapp-shell-${VERSION}`;
const CACHE_DATOS = `nombreapp-datos-${VERSION}`;
const CACHES_VIGENTES = [CACHE_SHELL, CACHE_DATOS];

const BASE = new URL('./', self.registration.scope).pathname;
const ruta = (p) => BASE + p;

const SHELL = [
  ruta(''),
  ruta('index.html'),
  ruta('manifest.webmanifest'),
  ruta('iconos/icono-192.png'),
  ruta('iconos/icono-512.png'),
  ruta('iconos/icono-maskable-512.png'),
];

// los datos de carreras se precargan en la instalación: la app sirve para leer sin internet
const DATOS = [ruta('datos/carreras.json'), ruta('datos/areas.json'), ruta('datos/becas.json')];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    (async () => {
      const [shell, datos] = await Promise.all([caches.open(CACHE_SHELL), caches.open(CACHE_DATOS)]);
      // addAll falla en bloque si un recurso falta; por eso van de uno en uno y tolerante
      await Promise.all([precargar(shell, SHELL), precargar(datos, DATOS)]);
    })()
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    (async () => {
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.disable();
      }
      const nombres = await caches.keys();
      await Promise.all(nombres.filter((n) => !CACHES_VIGENTES.includes(n)).map((n) => caches.delete(n)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (evento) => {
  if (evento.data === 'ACTIVAR_YA') self.skipWaiting();
});

self.addEventListener('fetch', (evento) => {
  const peticion = evento.request;
  if (peticion.method !== 'GET') return;

  const url = new URL(peticion.url);
  if (url.origin !== self.location.origin) return; // no tocamos terceros

  if (peticion.mode === 'navigate') {
    // las páginas para compartir (/c/<id>.html) son documentos propios con sus etiquetas
    // Open Graph: si les servimos el shell de la SPA, el enlace compartido se rompe
    if (url.pathname.startsWith(ruta('c/'))) {
      evento.respondWith(redConRespaldo(peticion, CACHE_SHELL));
      return;
    }
    evento.respondWith(responderNavegacion(peticion));
    return;
  }

  if (url.pathname.startsWith(ruta('assets/'))) {
    evento.respondWith(cachePrimero(peticion, CACHE_SHELL));
    return;
  }

  if (url.pathname.startsWith(ruta('datos/'))) {
    evento.respondWith(cacheYRevalida(peticion, CACHE_DATOS));
    return;
  }

  evento.respondWith(redConRespaldo(peticion, CACHE_SHELL));
});

/* ── helpers ─────────────────────────────────────────────────────────── */

async function precargar(cache, rutas) {
  await Promise.all(
    rutas.map(async (r) => {
      try {
        await cache.add(new Request(r, { cache: 'reload' }));
      } catch (_) {
        /* un recurso opcional que falte no debe tumbar la instalación */
      }
    })
  );
}

async function responderNavegacion(peticion) {
  const cache = await caches.open(CACHE_SHELL);
  const indice = ruta('index.html');
  const enCache = (await cache.match(indice)) || (await cache.match(ruta('')));
  const desdeRed = fetch(peticion)
    .then((respuesta) => {
      if (respuesta.ok) cache.put(indice, respuesta.clone());
      return respuesta;
    })
    .catch(() => null);

  // SPA: cualquier ruta se resuelve con el shell cacheado
  return enCache || (await desdeRed) || new Response('Sin conexión', { status: 503 });
}

async function cachePrimero(peticion, nombreCache) {
  const cache = await caches.open(nombreCache);
  const enCache = await cache.match(peticion);
  if (enCache) return enCache;
  const respuesta = await fetch(peticion);
  if (respuesta.ok) cache.put(peticion, respuesta.clone());
  return respuesta;
}

async function cacheYRevalida(peticion, nombreCache) {
  const cache = await caches.open(nombreCache);
  const enCache = await cache.match(peticion);
  const red = fetch(peticion)
    .then((respuesta) => {
      if (respuesta.ok) cache.put(peticion, respuesta.clone());
      return respuesta;
    })
    .catch(() => null);
  return enCache || (await red) || new Response('[]', { headers: { 'Content-Type': 'application/json' }, status: 200 });
}

async function redConRespaldo(peticion, nombreCache) {
  try {
    const respuesta = await fetch(peticion);
    if (respuesta.ok) {
      const cache = await caches.open(nombreCache);
      cache.put(peticion, respuesta.clone());
    }
    return respuesta;
  } catch (_) {
    const enCache = await caches.match(peticion);
    return enCache || new Response('Sin conexión', { status: 503 });
  }
}
