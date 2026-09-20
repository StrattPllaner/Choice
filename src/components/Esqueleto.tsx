/** Esqueletos con la forma del contenido real.
 *
 *  Un círculo girando no dice nada; un esqueleto con la silueta de lo que viene hace
 *  que la llegada del contenido se sienta instantánea. El brillo se desplaza con
 *  transform (translateX), nunca con background-position, que repinta toda la caja.
 */

function Bloque({ className = '' }: { className?: string }) {
  return (
    <span className={`relative block overflow-hidden rounded-chico bg-superficie-2 ${className}`}>
      <span
        aria-hidden="true"
        className="brilla absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-superficie) 70%, transparent), transparent)',
        }}
      />
    </span>
  );
}

function Envoltura({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className="space-y-3">
      <span className="sr-only">{etiqueta}</span>
      <span aria-hidden="true" className="block space-y-3">
        {children}
      </span>
    </div>
  );
}

/** Lista de carreras: título, línea de metadatos. */
export function EsqueletoLista({ filas = 4 }: { filas?: number }) {
  return (
    <Envoltura etiqueta="Cargando carreras">
      {Array.from({ length: filas }).map((_, i) => (
        <span key={i} className="tarjeta block space-y-2">
          <Bloque className="h-5 w-3/5" />
          <Bloque className="h-4 w-2/5" />
        </span>
      ))}
    </Envoltura>
  );
}

/** Ficha de carrera: encabezado, párrafo del martes, bloques de datos. */
export function EsqueletoFicha() {
  return (
    <Envoltura etiqueta="Cargando la ficha">
      <Bloque className="h-4 w-2/5" />
      <Bloque className="h-8 w-4/5" />
      <Bloque className="h-4 w-3/5" />
      <span className="tarjeta mt-4 block space-y-2">
        <Bloque className="h-4 w-full" />
        <Bloque className="h-4 w-full" />
        <Bloque className="h-4 w-5/6" />
        <Bloque className="h-4 w-2/3" />
      </span>
      <span className="tarjeta block space-y-3">
        <Bloque className="h-4 w-1/3" />
        <Bloque className="h-6 w-1/2" />
        <Bloque className="h-3 w-3/4" />
      </span>
    </Envoltura>
  );
}

/** Mapa de afinidad: barras. */
export function EsqueletoMapa() {
  return (
    <Envoltura etiqueta="Cargando tu mapa">
      <Bloque className="h-8 w-4/5" />
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="block space-y-1">
          <Bloque className="h-4 w-1/2" />
          <Bloque className="h-3 w-full" />
        </span>
      ))}
    </Envoltura>
  );
}

/** Pantalla genérica mientras llega el trozo de código de una ruta. */
export function EsqueletoPantalla() {
  return (
    <div className="contenedor-app">
      <Envoltura etiqueta="Cargando">
        <Bloque className="h-8 w-3/5" />
        <Bloque className="h-4 w-4/5" />
        <Bloque className="h-4 w-2/3" />
        <span className="tarjeta block space-y-2">
          <Bloque className="h-4 w-full" />
          <Bloque className="h-4 w-5/6" />
        </span>
      </Envoltura>
    </div>
  );
}

/** Panel: tarjetas de indicadores. */
export function EsqueletoPanel() {
  return (
    <Envoltura etiqueta="Cargando el panel">
      {Array.from({ length: 3 }).map((_, i) => (
        <span key={i} className="tarjeta block space-y-2">
          <Bloque className="h-4 w-1/3" />
          <Bloque className="h-8 w-1/4" />
        </span>
      ))}
    </Envoltura>
  );
}
