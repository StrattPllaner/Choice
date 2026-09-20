/** Trampa de foco para hojas y modales.
 *
 *  Mantiene el tabulador dentro del diálogo y devuelve el foco a donde estaba al cerrar.
 *  Sin librerías y en menos de 60 líneas: si necesitara más, el componente estaría mal.
 */

const SELECTOR_ENFOCABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function atraparFoco(contenedor: HTMLElement, alCerrar: () => void): () => void {
  const previo = document.activeElement as HTMLElement | null;

  const enfocables = () =>
    Array.from(contenedor.querySelectorAll<HTMLElement>(SELECTOR_ENFOCABLE)).filter(
      (nodo) => nodo.offsetParent !== null || nodo === document.activeElement
    );

  // el foco entra al diálogo: si no, el lector de pantalla se queda atrás
  (enfocables()[0] ?? contenedor).focus();

  const alTeclear = (evento: KeyboardEvent) => {
    if (evento.key === 'Escape') {
      evento.stopPropagation();
      alCerrar();
      return;
    }
    if (evento.key !== 'Tab') return;

    const lista = enfocables();
    if (lista.length === 0) return;
    const primero = lista[0]!;
    const ultimo = lista[lista.length - 1]!;

    if (evento.shiftKey && document.activeElement === primero) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primero.focus();
    }
  };

  contenedor.addEventListener('keydown', alTeclear);

  return () => {
    contenedor.removeEventListener('keydown', alTeclear);
    previo?.focus?.(); // el foco regresa a quien abrió
  };
}
