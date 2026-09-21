import { useCallback, useRef, type PointerEvent } from 'react';

/** Onda de clic: sale del punto exacto donde tocaste y se desvanece.
 *
 *  Es lo único que necesita JavaScript (25 líneas) y solo para saber dónde caiste;
 *  la animación es CSS pura y anima únicamente transform y opacity. Con
 *  prefers-reduced-motion activo, la regla global la deja en nada.
 */
export function usarPulso<T extends HTMLElement>() {
  const nodo = useRef<T | null>(null);

  const alPresionar = useCallback((evento: PointerEvent<T>) => {
    const elemento = evento.currentTarget;
    const caja = elemento.getBoundingClientRect();
    elemento.style.setProperty('--px', `${evento.clientX - caja.left}px`);
    elemento.style.setProperty('--py', `${evento.clientY - caja.top}px`);

    // reiniciar la animación: quitar, forzar reflujo y volver a poner
    elemento.classList.remove('pulsa');
    void elemento.offsetWidth;
    elemento.classList.add('pulsa');
  }, []);

  const alTerminar = useCallback((evento: PointerEvent<T>) => {
    const elemento = evento.currentTarget;
    window.setTimeout(() => elemento.classList.remove('pulsa'), 420);
  }, []);

  return {
    ref: nodo,
    propsPulso: {
      onPointerDown: alPresionar,
      onPointerUp: alTerminar,
      onPointerLeave: alTerminar,
    },
  };
}
