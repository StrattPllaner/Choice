import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { EsqueletoLista } from '@/components/Esqueleto';
import { EstadoError, VacioBusqueda } from '@/components/Estados';
import { useEsperaLarga } from '@/lib/retraso';
import {
  cargarCarreras,
  filtrarCarreras,
  ordenarCarreras,
  type FiltrosCarrera,
} from '@/lib/carreras';
import { ETIQUETA_NIVEL, type Carrera, type IdArea, type Nivel } from '@/data/tipos';

const NIVELES: Nivel[] = ['licenciatura', 'ingenieria', 'tsu', 'tecnica', 'certificacion'];

export default function Explorar() {
  const [carreras, setCarreras] = useState<Carrera[] | null>(null);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);
  const esperaLarga = useEsperaLarga(carreras === null && !error);
  const [parametros] = useSearchParams();
  const areaInicial = parametros.get('area') as IdArea | null;
  const [filtros, setFiltros] = useState<FiltrosCarrera>(areaInicial ? { areas: [areaInicial] } : {});

  useEffect(() => {
    let vigente = true;
    setError(false);
    cargarCarreras()
      .then((datos) => vigente && setCarreras(datos))
      .catch(() => vigente && setError(true));
    return () => {
      vigente = false;
    };
  }, [intento]);

  const resultado = useMemo(
    () => (carreras ? ordenarCarreras(filtrarCarreras(carreras, filtros)) : []),
    [carreras, filtros]
  );

  const alternarNivel = (nivel: Nivel) =>
    setFiltros((previos) => {
      const actuales = previos.niveles ?? [];
      const niveles = actuales.includes(nivel) ? actuales.filter((n) => n !== nivel) : [...actuales, nivel];
      return { ...previos, niveles };
    });

  if (error) {
    return (
      <div className="contenedor-app">
        <EstadoError
          tipo={navigator.onLine ? 'servidor' : 'conexion'}
          onReintentar={() => setIntento((n) => n + 1)}
        />
      </div>
    );
  }

  return (
    <div className="contenedor-app space-y-4">
      <h1 className="text-xl">Explorar carreras</h1>

      <div className="max-w-lectura">
        <label htmlFor="buscar" className="block text-chico font-semibold">
          Busca por nombre
        </label>
        <input
          id="buscar"
          type="search"
          inputMode="search"
          enterKeyHint="search"
          placeholder="Enfermería, soldadura, sistemas…"
          onChange={(evento) => setFiltros((p) => ({ ...p, texto: evento.target.value }))}
          className="toque mt-1 w-full rounded-chico border border-borde bg-superficie-2 px-4 py-3 text-base"
        />
      </div>

      {filtros.areas?.length ? (
        <p className="flex items-center gap-2 text-chico">
          <span className="rounded-full bg-primario-suave px-3 py-1 text-primario">Filtrando por área</span>
          <button
            type="button"
            onClick={() => setFiltros((p) => ({ ...p, areas: [] }))}
            className="underline text-tinta-suave"
          >
            Quitar filtro
          </button>
        </p>
      ) : null}

      <fieldset>
        <legend className="text-chico font-semibold">Tipo de carrera</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {NIVELES.map((nivel) => {
            const activo = filtros.niveles?.includes(nivel) ?? false;
            return (
              <button
                key={nivel}
                type="button"
                aria-pressed={activo}
                onClick={() => alternarNivel(nivel)}
                className={[
                  'toque ondulado rounded-chico border px-4 py-2 text-chico',
                  activo ? 'border-primario bg-primario-suave text-primario' : 'border-borde text-tinta',
                ].join(' ')}
              >
                {ETIQUETA_NIVEL[nivel]}
              </button>
            );
          })}
        </div>
      </fieldset>

      {!carreras ? (
        esperaLarga ? <EsqueletoLista filas={5} /> : null
      ) : (
        <>
          <p role="status" className="text-chico text-tinta-suave">
            {resultado.length} de {carreras.length} carreras
          </p>
          <ul className="rejilla">
            {resultado.map((carrera) => (
              <li key={carrera.id} className="entra">
                <Link to={`/carrera/${carrera.id}`} className="tarjeta block">
                  <span className="text-base font-semibold">{carrera.nombre}</span>
                  <span className="mt-1 block text-chico text-tinta-suave">
                    {ETIQUETA_NIVEL[carrera.nivel]} · {carrera.duracionAnios}{' '}
                    {carrera.duracionAnios === 1 ? 'año' : 'años'}
                    {!carrera.verificado && ' · datos laborales pendientes'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {resultado.length === 0 && (
            <VacioBusqueda
              consulta={filtros.texto ?? ''}
              onLimpiar={() => setFiltros({})}
            />
          )}
        </>
      )}
    </div>
  );
}
