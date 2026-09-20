import { useEffect, useState } from 'react';

/** Barra discreta cuando no hay internet: la app se puede seguir leyendo. */
export function AvisoSinConexion() {
  const [enLinea, setEnLinea] = useState(() => navigator.onLine);

  useEffect(() => {
    const conectado = () => setEnLinea(true);
    const desconectado = () => setEnLinea(false);
    window.addEventListener('online', conectado);
    window.addEventListener('offline', desconectado);
    return () => {
      window.removeEventListener('online', conectado);
      window.removeEventListener('offline', desconectado);
    };
  }, []);

  if (enLinea) return null;

  return (
    <p role="status" className="bg-aviso/15 px-4 py-2 text-center text-sm text-texto">
      Sin internet. Puedes seguir leyendo lo que ya se descargó.
    </p>
  );
}
