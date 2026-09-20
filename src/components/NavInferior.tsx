import { NavLink } from 'react-router-dom';
import { IconoExplorar, IconoInicio, IconoMapa, IconoPerfil } from './Iconos';

const enlaces = [
  { a: '/', etiqueta: 'Inicio', Icono: IconoInicio },
  { a: '/explorar', etiqueta: 'Explorar', Icono: IconoExplorar },
  { a: '/mapa', etiqueta: 'Mi mapa', Icono: IconoMapa },
  { a: '/perfil', etiqueta: 'Mi perfil', Icono: IconoPerfil },
];

/** Navegación abajo: alcance del pulgar en celulares de 360px y una mano. */
export function NavInferior() {
  return (
    <nav
      aria-label="Secciones de la app"
      className="sticky bottom-0 z-40 border-t border-borde bg-superficie pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-contenido">
        {enlaces.map(({ a, etiqueta, Icono }) => (
          <li key={a} className="flex-1">
            <NavLink
              to={a}
              end={a === '/'}
              className={({ isActive }) =>
                [
                  'toque w-full flex-col gap-1 px-1 py-2 text-micro font-medium',
                  isActive ? 'text-primario' : 'text-tinta-suave',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <Icono className="h-6 w-6" />
                  <span aria-current={isActive ? 'page' : undefined}>{etiqueta}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
