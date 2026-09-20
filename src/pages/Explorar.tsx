import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cargando, Esqueleto } from '@/components/Cargando';
import {
  cargarCarreras,
  filtrarCarreras,
  ordenarCarreras,
  type FiltrosCarrera,
} from '@/lib/carreras';
import { ETIQUETA_NIVEL, type Carrera, type Nivel } from '@/data/tipos';

const NIVELES: Nivel[] = ['licenciatura', 'ingenieria', 'tsu', 'tecnica', 'certificacion'];

export default function Explorar() {
  const [carreras, setCarreras] = useState<Carrera[] | null>(null);
  const [error, setError] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosCarrera>({});

  useEffect(() => {
    let vigente = true;
    cargarCarreras()
      .then((datos) => vigente && setCarreras(datos))
      .catch(() => vigente && setError(true));
    return () => {
      vigente = false;
    };
  }, []);

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
        <p className="tarjeta">No pudimos cargar las carreras. Revisa tu internet y vuelve a entrar.</p>
      </div>
    );
  }

  return (
    <div className="contenedor-app space-y-4">
      <h1 className="text-2xl">Explorar carreras</h1>

      <div>
        <label htmlFor="buscar" className="block text-sm font-semibold">
          Busca por nombre
        </label>
        <input
          id="buscar"
          type="search"
          inputMode="search"
          enterKeyHint="search"
          placeholder="Enfermería, soldadura, sistemas…"
          onChange={(evento) => setFiltros((p) => ({ ...p, texto: evento.target.value }))}
          className="toque mt-1 w-full rounded-xl2 border border-borde bg-superficie-2 px-4 py-3 text-base"
        />
      </div>

      <fieldset>
        <legend className="text-sm font-semibold">Tipo de carrera</legend>
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
                  'toque rounded-xl2 border px-4 py-2 text-sm',
                  activo ? 'border-marca bg-marca-suave text-marca' : 'border-borde text-texto',
                ].join(' ')}
              >
                {ETIQUETA_NIVEL[nivel]}
              </button>
            );
          })}
        </div>
      </fieldset>

      {!carreras ? (
        <>
          <Cargando etiqueta="Cargando carreras…" />
          <Esqueleto lineas={4} />
        </>
      ) : (
        <>
          <p role="status" className="text-sm text-texto-suave">
            {resultado.length} de {carreras.length} carreras
          </p>
          <ul className="space-y-3">
            {resultado.map((carrera) => (
              <li key={carrera.id}>
                <Link to={`/carrera/${carrera.id}`} className="tarjeta block">
                  <span className="text-base font-semibold">{carrera.nombre}</span>
                  <span className="mt-1 block text-sm text-texto-suave">
                    {ETIQUETA_NIVEL[carrera.nivel]} · {carrera.duracionAnios}{' '}
                    {carrera.duracionAnios === 1 ? 'año' : 'años'}
                    {!carrera.verificado && ' · datos laborales pendientes'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {resultado.length === 0 && (
            <p className="tarjeta text-texto-suave">No encontramos carreras con esa búsqueda.</p>
          )}
        </>
      )}
    </div>
  );
}
