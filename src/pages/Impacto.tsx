import { useEffect, useState } from 'react';
import { Boton } from '@/components/Boton';
import { EsqueletoLista } from '@/components/Esqueleto';
import { VacioMediciones } from '@/components/Estados';
import { FormularioImpacto } from '@/features/impacto/FormularioImpacto';
import { agregar, compararAgregados, type Medicion } from '@/features/impacto/calculo';
import { guardarMedicion, leerMediciones, siguienteMomento } from '@/lib/impacto';

export default function Impacto() {
  const [mediciones, setMediciones] = useState<Medicion[] | null>(null);
  const [contestando, setContestando] = useState(false);

  useEffect(() => {
    let vigente = true;
    leerMediciones().then((datos) => vigente && setMediciones(datos));
    return () => {
      vigente = false;
    };
  }, []);

  if (!mediciones) return <div className="contenedor-app"><EsqueletoLista filas={2} /></div>;

  const momento = siguienteMomento(mediciones);
  const inicial = mediciones.find((m) => m.momento === 'inicial');
  const ultimoSeguimiento = [...mediciones].reverse().find((m) => m.momento === 'seguimiento');

  if (contestando) {
    return (
      <FormularioImpacto
        momento={momento}
        onTerminar={async (respuestas) => {
          const medicion = await guardarMedicion(momento, respuestas);
          setMediciones((previas) => [...(previas ?? []), medicion]);
          setContestando(false);
          window.scrollTo({ top: 0 });
        }}
      />
    );
  }

  return (
    <div className="contenedor-app space-y-5">
      <h1 className="text-xl">Mi avance</h1>
      <p className="text-tinta-suave">
        Diez preguntas cortas sobre qué tanto conoces y qué tan seguro te sientes. Se contestan al empezar y
        se repiten más adelante para ver qué cambió.
      </p>

      {inicial && ultimoSeguimiento ? (
        <section aria-labelledby="mi-cambio" className="space-y-2">
          <h2 id="mi-cambio" className="text-lg">
            Cómo cambiaste
          </h2>
          <ul className="space-y-2 text-chico">
            {compararAgregados(agregar([inicial]), agregar([ultimoSeguimiento]))
              .filter((fila) => fila.cambio !== 0)
              .map((fila) => (
                <li key={fila.indicador} className="tarjeta flex justify-between gap-3">
                  <span>{fila.indicador}</span>
                  <span className={fila.subirEsBueno === fila.cambio > 0 ? 'text-exito' : 'text-tinta-suave'}>
                    {fila.cambio > 0 ? '+' : ''}
                    {fila.unidad === 'porcentaje' ? `${Math.round(fila.cambio)}%` : fila.cambio.toFixed(1)}
                  </span>
                </li>
              ))}
          </ul>
        </section>
      ) : null}

      {mediciones.length === 0 ? (
        <VacioMediciones onEmpezar={() => setContestando(true)} />
      ) : null}

      <div className="space-y-2">
        <Boton anchoCompleto onClick={() => setContestando(true)}>
          {momento === 'inicial' ? 'Contestar la primera medición' : 'Contestar la segunda medición'}
        </Boton>
        {mediciones.length > 0 && (
          <p className="text-micro text-tinta-suave">
            Llevas {mediciones.length} {mediciones.length === 1 ? 'medición' : 'mediciones'}. La última fue el{' '}
            {new Date(mediciones[mediciones.length - 1]!.fecha).toLocaleDateString('es-MX')}.
          </p>
        )}
      </div>

      <p className="tarjeta text-micro text-tinta-suave">
        Tu escuela solo ve resultados del grupo completo, y únicamente si hay al menos 10 respuestas. Nadie
        de tu escuela puede ver lo que tú contestaste.
      </p>
    </div>
  );
}
