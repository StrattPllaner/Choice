/** Registro del service worker. Solo en producción y después de `load`:
 *  en 3G no compite con el render inicial. */
export function registrarSW(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    const url = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker.register(url, { scope: import.meta.env.BASE_URL }).catch(() => {
      /* sin SW la app sigue funcionando en línea */
    });
  });

  let recargando = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (recargando) return;
    recargando = true;
    window.location.reload();
  });
}

export function estaEnLinea(): boolean {
  return typeof navigator === 'undefined' ? true : navigator.onLine;
}
