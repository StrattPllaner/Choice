import { useEffect, useState } from 'react';

/** Devuelve true solo si la espera pasa de `ms`.
 *
 *  Si los datos llegan en 80ms, mostrar un esqueleto y quitarlo produce un parpadeo
 *  que se siente peor que no mostrar nada. Debajo del umbral, la pantalla se queda quieta.
 */
export function useEsperaLarga(activo: boolean, ms = 200): boolean {
  const [largo, setLargo] = useState(false);

  useEffect(() => {
    if (!activo) {
      setLargo(false);
      return;
    }
    const temporizador = window.setTimeout(() => setLargo(true), ms);
    return () => window.clearTimeout(temporizador);
  }, [activo, ms]);

  return largo;
}
