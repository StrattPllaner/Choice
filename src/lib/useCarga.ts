import { useCallback, useEffect, useState } from 'react';
import { useEsperaLarga } from './retraso';
import { tipoDeError, type TipoError } from '@/components/Estados';

/** Carga de datos con los tres estados que siempre se olvidan: espera larga,
 *  error tipificado y reintento. Así ninguna pantalla los improvisa a su manera. */
export function useCarga<T>(cargar: () => Promise<T>, dependencias: unknown[] = []) {
  const [datos, setDatos] = useState<T | null>(null);
  const [error, setError] = useState<TipoError | null>(null);
  const [cargando, setCargando] = useState(true);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setError(null);
    cargar()
      .then((resultado) => {
        if (!vigente) return;
        setDatos(resultado);
        setCargando(false);
      })
      .catch((fallo) => {
        if (!vigente) return;
        setError(tipoDeError(fallo));
        setCargando(false);
      });
    return () => {
      vigente = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencias, intento]);

  const reintentar = useCallback(() => setIntento((n) => n + 1), []);
  const esperaLarga = useEsperaLarga(cargando);

  return { datos, error, cargando, esperaLarga, reintentar };
}
