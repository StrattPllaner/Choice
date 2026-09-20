import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { EsqueletoLista } from '@/components/Esqueleto';
import { VacioComparador } from '@/components/Estados';
import { ListaFuentes } from '@/components/Fuente';
import { DIMENSIONES, mejoresPorDimension } from '@/features/comparador/dimensiones';
import { cargarCarreras } from '@/lib/carreras';
import { leerHistorial, perfilVigente } from '@/lib/perfil';
import { ETIQUETA_NIVEL, type Carrera } from '@/data/tipos';
import type { ResultadoPerfil } from '@/features/perfil/puntuacion';

const MAXIMO = 3;
const NIVELES_CORTOS = ['tsu', 'tecnica', 'certificacion'];

/** Sugerencias: siempre incluyen al menos una ruta técnica o TSU.
 *  El sesgo por defecto en México es que la única ruta válida es la licenciatura;
 *  el comparador no lo va a reforzar. */
function sugerencias(elegidas: Carrera[], todas: Carrera[]): Carrera[] {
  const ids = new Set(elegidas.map((c) => c.id));
  const areas = new Set(elegidas.map((c) => c.area));
  const candidatas = todas.filter((c) => !ids.has(c.id));

  const mismaArea = candidatas.filter((c) => areas.has(c.area));
  const cortas = (mismaArea.length ? mismaArea : candidatas).filter((c) => NIVELES_CORTOS.includes(c.nivel));
  const largas = (mismaArea.length ? mismaArea : candidatas).filter((c) => !NIVELES_CORTOS.includes(c.nivel));

  const yaHayCorta = elegidas.some((c) => NIVELES_CORTOS.includes(c.nivel));
  const lista = yaHayCorta ? [...cortas.slice(0, 1), ...largas.slice(0, 2)] : [...cortas.slice(0, 2), ...largas.slice(0, 1)];
  return lista.slice(0, 3);
}

export default function Comparar() {
  const [parametros, setParametros] = useSearchParams();
  const [carreras, setCarreras] = useState<Carrera[] | null>(null);
  const [perfil, setPerfil] = useState<ResultadoPerfil | null>(null);
  const [copiado, setCopiado] = useState(false);
  const tiras = useRef<HTMLDivElement[]>([]);
  const sincronizando = useRef(false);

  const seleccionadas = useMemo(() => (parametros.get('c') ?? '').split(',').filter(Boolean), [parametros]);

  useEffect(() => {
    let vigente = true;
    Promise.all([cargarCarreras(), leerHistorial()])
      .then(([datos, historial]) => {
        if (!vigente) return;
        setCarreras(datos);
        setPerfil(perfilVigente(historial)?.resultado ?? null);
      })
      .catch(() => vigente && setCarreras([]));
    return () => {
      vigente = false;
    };
  }, []);

  /** Scroll horizontal sincronizado: todas las tiras se mueven juntas,
   *  si no, la comparación deja de estar alineada y no se entiende nada. */
  const registrar = useCallback((nodo: HTMLDivElement | null, indice: number) => {
    if (nodo) tiras.current[indice] = nodo;
  }, []);

  const alDesplazar = useCallback((indice: number) => {
    if (sincronizando.current) return;
    sincronizando.current = true;
    const origen = tiras.current[indice];
    if (origen) {
      for (const [i, tira] of tiras.current.entries()) {
        if (i !== indice && tira && tira.scrollLeft !== origen.scrollLeft) tira.scrollLeft = origen.scrollLeft;
      }
    }
    window.requestAnimationFrame(() => {
      sincronizando.current = false;
    });
  }, []);

  if (!carreras) return <div className="contenedor-app"><EsqueletoLista filas={3} /></div>;

  const elegidas = seleccionadas
    .map((id) => carreras.find((c) => c.id === id))
    .filter((c): c is Carrera => Boolean(c))
    .slice(0, MAXIMO);

  const cambiar = (ids: string[]) => setParametros(ids.length ? { c: ids.join(',') } : {});
  const quitar = (id: string) => cambiar(elegidas.filter((c) => c.id !== id).map((c) => c.id));
  const agregar = (id: string) => elegidas.length < MAXIMO && cambiar([...elegidas.map((c) => c.id), id]);

  const mejores = mejoresPorDimension(elegidas, perfil);
  const hayCorta = elegidas.some((c) => NIVELES_CORTOS.includes(c.nivel));

  const compartir = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: 'Comparación de carreras', url });
      else {
        await navigator.clipboard.writeText(url);
        setCopiado(true);
        window.setTimeout(() => setCopiado(false), 2500);
      }
    } catch {
      /* cancelado */
    }
  };

  return (
    <div className="contenedor-app space-y-5">
      <header className="space-y-2">
        <h1 className="text-xl">Comparar carreras</h1>
        <p className="text-tinta-suave">
          Hasta {MAXIMO} carreras, lado a lado, en las mismas cosas. No hay ganadora: se resalta en qué va
          mejor cada una y tú decides, porque esto no es solo números.
        </p>
      </header>

      {elegidas.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {elegidas.map((carrera) => (
            <li key={carrera.id}>
              <button
                type="button"
                onClick={() => quitar(carrera.id)}
                className="toque rounded-xl2 border border-primario bg-primario-suave px-3 py-2 text-chico text-primario"
              >
                {carrera.nombre} <span aria-hidden="true">×</span>
                <span className="sr-only">Quitar de la comparación</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {elegidas.length < MAXIMO && (
        <div>
          <label htmlFor="agregar" className="block text-chico font-semibold">
            Agregar carrera
          </label>
          <select
            id="agregar"
            value=""
            onChange={(evento) => evento.target.value && agregar(evento.target.value)}
            className="toque mt-1 w-full rounded-xl2 border border-borde bg-superficie-2 px-3 py-3 text-base"
          >
            <option value="">Elige una…</option>
            {carreras
              .filter((c) => !elegidas.some((e) => e.id === c.id))
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} · {ETIQUETA_NIVEL[c.nivel]}
                </option>
              ))}
          </select>
        </div>
      )}

      {elegidas.length >= 2 && !hayCorta && (
        <p className="rounded-xl2 border-l-4 border-primario bg-primario-suave p-3 text-chico">
          Estás comparando puras carreras largas. Mete también una técnica o un TSU: cuestan menos, se
          empieza a trabajar antes y no siempre se gana menos.
        </p>
      )}

      {elegidas.length >= 1 && (
        <section aria-labelledby="sugerencias" className="space-y-2">
          <h2 id="sugerencias" className="text-chico font-semibold">
            También puedes comparar con
          </h2>
          <ul className="flex flex-wrap gap-2">
            {sugerencias(elegidas, carreras).map((carrera) => (
              <li key={carrera.id}>
                <button
                  type="button"
                  onClick={() => agregar(carrera.id)}
                  disabled={elegidas.length >= MAXIMO}
                  className="toque rounded-xl2 border border-borde px-3 py-2 text-chico disabled:opacity-50"
                >
                  + {carrera.nombre}
                  <span className="ml-1 text-micro text-tinta-suave">{ETIQUETA_NIVEL[carrera.nivel]}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {elegidas.length < 2 ? (
        <VacioComparador />
      ) : (
        <>
          {/* encabezado de columnas, también sincronizado */}
          <div
            ref={(nodo) => registrar(nodo, 0)}
            onScroll={() => alDesplazar(0)}
            className="sticky top-14 z-30 -mx-4 overflow-x-auto bg-fondo px-4 pb-2"
          >
            <div className="flex gap-3">
              {elegidas.map((carrera) => (
                <div key={carrera.id} className="w-56 shrink-0 sm:w-64 lg:w-72">
                  <p className="text-chico font-semibold">{carrera.nombre}</p>
                  <p className="text-micro text-tinta-suave">{ETIQUETA_NIVEL[carrera.nivel]}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {DIMENSIONES.map((dimension, indice) => (
              <section key={dimension.id} aria-labelledby={`dim-${dimension.id}`}>
                <h2 id={`dim-${dimension.id}`} className="text-chico font-semibold">
                  {dimension.etiqueta}
                </h2>
                {dimension.ayuda && <p className="text-micro text-tinta-suave">{dimension.ayuda}</p>}

                <div
                  ref={(nodo) => registrar(nodo, indice + 1)}
                  onScroll={() => alDesplazar(indice + 1)}
                  className="-mx-4 mt-2 overflow-x-auto px-4"
                >
                  <div className="flex gap-3">
                    {elegidas.map((carrera) => {
                      const gana = mejores[dimension.id]?.includes(carrera.id) ?? false;
                      const texto = dimension.texto(carrera, perfil);
                      const sinDato = dimension.valor(carrera, perfil) === null;
                      const fuentes = dimension.fuentes?.(carrera) ?? [];
                      return (
                        <div
                          key={carrera.id}
                          className={[
                            'w-56 shrink-0 rounded-xl2 border p-3',
                            gana ? 'border-exito bg-exito-suave' : 'border-borde bg-superficie',
                          ].join(' ')}
                        >
                          <p className={sinDato ? 'text-chico text-tinta-suave' : 'text-chico font-medium'}>{texto}</p>
                          {gana && (
                            <p className="mt-1 text-micro font-semibold text-exito">
                              ✓ Va mejor aquí
                              <span className="sr-only"> que las otras carreras comparadas</span>
                            </p>
                          )}
                          {sinDato && dimension.porQueFalta && (
                            <p className="mt-1 text-micro text-tinta-suave">{dimension.porQueFalta}</p>
                          )}
                          <ListaFuentes fuentes={fuentes} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            ))}
          </div>

          <p className="tarjeta text-chico text-tinta-suave">
            Que una gane en varias cosas no la vuelve la correcta. El gusto, la vida que quieres y lo que
            puede tu familia pesan más que cualquiera de estos números.
          </p>

          <div className="space-y-2">
            <button
              type="button"
              onClick={compartir}
              className="toque w-full rounded-xl2 bg-primario px-5 py-3 font-semibold text-sobre-primario"
            >
              {copiado ? 'Enlace copiado' : 'Compartir esta comparación'}
            </button>
            <Link
              to={`/calculadora?a=${elegidas[0]?.id ?? ''}&b=${elegidas[1]?.id ?? ''}`}
              className="toque w-full rounded-xl2 border border-borde px-5 py-3 font-semibold"
            >
              Ver cuánto cuesta cada una
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
