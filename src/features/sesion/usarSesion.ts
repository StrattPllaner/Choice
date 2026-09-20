import { useContext } from 'react';
import { SesionContexto } from './SesionContexto';

export function usarSesion() {
  const contexto = useContext(SesionContexto);
  if (!contexto) throw new Error('usarSesion debe usarse dentro de <ProveedorSesion>');
  return contexto;
}
