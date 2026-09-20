import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { consentimientoVigente, inicializarConsentimiento, type Consentimiento } from '@/lib/privacidad';

interface ValorPrivacidad {
  consentimiento: Consentimiento | null;
  consentido: boolean;
  listo: boolean;
  recargar: () => Promise<void>;
}

const Contexto = createContext<ValorPrivacidad | null>(null);

export function ProveedorPrivacidad({ children }: { children: ReactNode }) {
  const [consentimiento, setConsentimiento] = useState<Consentimiento | null>(null);
  const [listo, setListo] = useState(false);

  const recargar = useCallback(async () => {
    setConsentimiento(await inicializarConsentimiento());
    setListo(true);
  }, []);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const valor = useMemo<ValorPrivacidad>(
    () => ({ consentimiento, consentido: consentimientoVigente(consentimiento), listo, recargar }),
    [consentimiento, listo, recargar]
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function usarPrivacidad() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('usarPrivacidad debe usarse dentro de <ProveedorPrivacidad>');
  return contexto;
}
