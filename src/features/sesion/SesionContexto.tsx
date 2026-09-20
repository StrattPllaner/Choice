import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  alternarFavorita,
  guardarSesion,
  leerSesion,
  marcarVista,
  sesionNueva,
  type SesionAlumno,
} from '@/lib/sesion';

interface ValorSesion {
  sesion: SesionAlumno | null;
  cargando: boolean;
  actualizar: (cambios: Partial<SesionAlumno>) => void;
  alternarFavorita: (idCarrera: string) => void;
  registrarVista: (idCarrera: string) => void;
  reiniciar: () => void;
}

export const SesionContexto = createContext<ValorSesion | null>(null);

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<SesionAlumno | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vigente = true;
    leerSesion().then((s) => {
      if (!vigente) return;
      setSesion(s);
      setCargando(false);
    });
    return () => {
      vigente = false;
    };
  }, []);

  // escritura optimista: la UI no espera al disco
  const persistir = useCallback((siguiente: SesionAlumno) => {
    setSesion(siguiente);
    void guardarSesion(siguiente);
  }, []);

  const valor = useMemo<ValorSesion>(
    () => ({
      sesion,
      cargando,
      actualizar: (cambios) => sesion && persistir({ ...sesion, ...cambios }),
      alternarFavorita: (id) => sesion && persistir(alternarFavorita(sesion, id)),
      registrarVista: (id) => sesion && persistir(marcarVista(sesion, id)),
      reiniciar: () => persistir(sesionNueva()),
    }),
    [sesion, cargando, persistir]
  );

  return <SesionContexto.Provider value={valor}>{children}</SesionContexto.Provider>;
}
