import { useEffect, useState } from 'react';

const CLAVE = 'nombreapp:celebrado';

/** Celebración breve al terminar algo importante. Solo CSS, sin confeti ni librerías,
 *  y una vez por sesión: la quinta vez ya no celebra, estorba. */
export function Celebracion({ texto }: { texto: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let yaCelebro = false;
    try {
      yaCelebro = sessionStorage.getItem(CLAVE) === '1';
      sessionStorage.setItem(CLAVE, '1');
    } catch {
      /* sin sessionStorage simplemente no se repite el control */
    }
    if (!yaCelebro) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <p
      role="status"
      className="celebra flex items-center justify-center gap-2 rounded-tarjeta bg-primario-suave px-4 py-3 text-base font-medium text-primario"
    >
      <span aria-hidden="true">✓</span>
      {texto}
    </p>
  );
}
