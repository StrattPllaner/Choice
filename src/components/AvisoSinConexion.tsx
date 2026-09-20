import { useEffect, useState } from 'react';

/** Barra de sin conexión: discreta, dice qué SÍ se puede seguir haciendo
 *  (la app lee offline) y se va sola cuando vuelve la señal. */
export function AvisoSinConexion() {
  const [enLinea, setEnLinea] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));

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
    <p
      role="status"
      className="entra-pantalla bg-atencion-suave px-4 py-2 text-center text-chico text-tinta"
    >
      Sin internet. Puedes seguir leyendo las carreras y tus respuestas se guardan en el celular.
    </p>
  );
}
