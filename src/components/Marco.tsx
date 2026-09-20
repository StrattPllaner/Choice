import { Suspense } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { usarPrivacidad } from '@/features/privacidad/ProveedorPrivacidad';
import { AvisoSinConexion } from './AvisoSinConexion';
import { EsqueletoPantalla } from './Esqueleto';
import { NavInferior } from './NavInferior';

/** Shell de la app: encabezado + contenido + navegación. Es lo único que se precachea
 *  como HTML; las pantallas llegan en trozos aparte. */
export function Marco() {
  const { consentido, listo } = usarPrivacidad();
  const location = useLocation();

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#contenido" className="salta-al-contenido">
        Saltar al contenido
      </a>

      <header className="sticky top-0 z-40 border-b border-borde bg-superficie backdrop-blur">
        <div className="contenedor-app flex h-14 items-center justify-between">
          <span className="text-lg font-bold tracking-tight">NOMBREAPP</span>
          <span className="text-micro text-tinta-suave">Funciona sin internet</span>
        </div>
      </header>

      <AvisoSinConexion />

      {listo && !consentido && (
        <p className="bg-primario-suave px-4 py-2 text-center text-chico">
          Nada se está guardando todavía.{' '}
          <Link to="/consentimiento" className="font-semibold text-primario underline">
            Dar permiso
          </Link>{' '}
          para que tus respuestas no se pierdan.
        </p>
      )}

      <main id="contenido" tabIndex={-1} className="entra-pantalla flex-1 py-5" key={location.pathname}>
        <Suspense fallback={<EsqueletoPantalla />}>
          <Outlet />
        </Suspense>
      </main>

      <NavInferior />
    </div>
  );
}
