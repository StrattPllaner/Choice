/** Estado de carga anunciado a lectores de pantalla; sin animaciones costosas. */
export function Cargando({ etiqueta = 'Cargando…' }: { etiqueta?: string }) {
  return (
    <div role="status" aria-live="polite" className="contenedor-app py-10 text-center text-texto-suave">
      {etiqueta}
    </div>
  );
}

/** Esqueleto para listas: evita el salto de layout en conexiones lentas. */
export function Esqueleto({ lineas = 3 }: { lineas?: number }) {
  return (
    <div aria-hidden="true" className="space-y-3">
      {Array.from({ length: lineas }).map((_, i) => (
        <div key={i} className="h-20 rounded-xl2 bg-superficie-2" />
      ))}
    </div>
  );
}
