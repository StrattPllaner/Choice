/** Aviso visible (no en letras chiquitas) de que esto no es un diagnóstico.
 *  Va en el cuestionario y en los resultados, siempre arriba del contenido. */
export function AvisoGuia({ compacto = false }: { compacto?: boolean }) {
  return (
    <aside
      aria-label="Aviso sobre qué es esta herramienta"
      className="rounded-xl2 border-l-4 border-atencion bg-atencion-suave p-4 text-chico text-tinta"
    >
      <p className="font-semibold">Esto es una guía para explorar, no un diagnóstico.</p>
      {!compacto && (
        <p className="mt-1 text-tinta-suave">
          No es un test psicológico ni vocacional profesional: nadie te está midiendo ni diciendo para
          qué sirves. Son tus propias respuestas ordenadas para darte un punto de partida. Va a cambiar
          conforme conozcas más, y eso está bien. Si necesitas orientación de verdad, busca a la
          orientadora de tu escuela.
        </p>
      )}
    </aside>
  );
}
