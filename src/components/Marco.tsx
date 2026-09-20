import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { AvisoSinConexion } from './AvisoSinConexion';
import { Cargando } from './Cargando';
import { NavInferior } from './NavInferior';

/** Shell de la app: encabezado + contenido + navegación. Es lo único que se precachea
 *  como HTML; las pantallas llegan en trozos aparte. */
export function Marco() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#contenido" className="salta-al-contenido">
        Saltar al contenido
      </a>

      <header className="sticky top-0 z-40 border-b border-borde bg-superficie/95 backdrop-blur">
        <div className="contenedor-app flex h-14 items-center justify-between">
          <span className="text-lg font-bold tracking-tight">NOMBREAPP</span>
          <span className="text-xs text-texto-suave">Funciona sin internet</span>
        </div>
      </header>

      <AvisoSinConexion />

      <main id="contenido" tabIndex={-1} className="flex-1 py-5">
        <Suspense fallback={<Cargando />}>
          <Outlet />
        </Suspense>
      </main>

      <NavInferior />
    </div>
  );
}
