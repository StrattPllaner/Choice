import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AvisoGuia } from '@/components/AvisoGuia';
import { cargarAreas } from '@/lib/carreras';
import type { Area } from '@/data/tipos';
import { compararPerfiles } from './puntuacion';
import type { VersionPerfil } from '@/lib/perfil';

/** Resultados. Nunca dice "tu carrera es X": muestra un mapa de áreas para explorar,
 *  siempre tres o más, y el número se explica como afinidad relativa, no como pronóstico. */
export function MapaAfinidad({
  version,
  primera,
  onRehacer,
}: {
  version: VersionPerfil;
  primera: VersionPerfil | null;
  onRehacer: () => void;
}) {
  const [areas, setAreas] = useState<Area[] | null>(null);
  const { resultado } = version;

  useEffect(() => {
    let vigente = true;
    cargarAreas()
      .then((datos) => vigente && setAreas(datos))
      .catch(() => vigente && setAreas([]));
    return () => {
      vigente = false;
    };
  }, []);

  const nombreArea = (id: string) => areas?.find((a) => a.id === id)?.nombre ?? id;
  const maximo = Math.max(...resultado.afinidades.map((a) => a.puntaje), 1);
  const hayComparacion = primera && primera.version !== version.version;
  const mismoAlgoritmo = primera?.versionAlgoritmo === version.versionAlgoritmo;

  return (
    <div className="contenedor-app space-y-6">
      <header className="space-y-2">
        <p className="text-chico font-medium text-primario">Tu mapa · versión {version.version}</p>
        <h1 className="text-xl">Esto es lo que tus respuestas sugieren explorar primero</h1>
        <p className="medida text-tinta-suave">
          No es una recomendación de carrera ni una predicción. Son áreas por donde te conviene empezar
          a ver, y siempre son varias: casi nadie encaja en una sola.
        </p>
      </header>

      <AvisoGuia />

      {resultado.confianza === 'baja' && resultado.motivoConfianza && (
        <p role="status" className="tarjeta text-chico">
          {resultado.motivoConfianza}
        </p>
      )}

      <section aria-labelledby="titulo-sugeridas" className="space-y-3">
        <h2 id="titulo-sugeridas" className="text-lg">
          Empieza por estas {resultado.sugeridas.length} áreas
        </h2>
        <ul className="rejilla">
          {resultado.sugeridas.map((area) => (
            <li key={area}>
              <Link to={`/explorar?area=${area}`} className="tarjeta block">
                <span className="font-semibold">{nombreArea(area)}</span>
                <span className="mt-1 block text-chico text-tinta-suave">
                  {areas?.find((a) => a.id === area)?.descripcion ?? 'Ver carreras de esta área'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="titulo-mapa" className="space-y-3">
        <h2 id="titulo-mapa" className="text-lg">
          Tu mapa completo
        </h2>
        <ul className="space-y-3">
          {resultado.afinidades.map((afinidad) => (
            <li key={afinidad.area}>
              <div className="flex items-baseline justify-between gap-3 text-chico">
                <span className="font-medium">{nombreArea(afinidad.area)}</span>
                <span className="text-tinta-suave">{afinidad.puntaje}</span>
              </div>
              <div
                role="img"
                aria-label={`${nombreArea(afinidad.area)}: afinidad ${afinidad.puntaje} de 100`}
                className="mt-1 h-3 w-full overflow-hidden rounded-full bg-superficie-2"
              >
                <div
                  className="h-full rounded-full bg-primario"
                  style={{ width: `${Math.round((afinidad.puntaje / maximo) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
        <p className="text-micro text-tinta-suave">
          El número compara tus áreas entre sí. No es un porcentaje de éxito ni qué tan bueno vas a ser.
        </p>
      </section>

      {hayComparacion && primera && (
        <section aria-labelledby="titulo-cambio" className="space-y-2">
          <h2 id="titulo-cambio" className="text-lg">
            Cómo cambiaste desde la primera vez
          </h2>
          <p className="text-chico text-tinta-suave">
            Primera vez: {new Date(primera.fecha).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
            {primera.grado ? ` (${primera.grado}° de prepa)` : ''} · Ahora:{' '}
            {new Date(version.fecha).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
            {version.grado ? ` (${version.grado}° de prepa)` : ''}
          </p>
          {!mismoAlgoritmo && (
            <p className="text-chico text-atencion">
              Ojo: los dos mapas se calcularon con versiones distintas del método, así que la comparación
              es aproximada.
            </p>
          )}
          <ul className="space-y-1 text-chico">
            {compararPerfiles(primera.resultado, resultado)
              .filter((cambio) => cambio.cambio !== 0)
              .slice(0, 4)
              .map((cambio) => (
                <li key={cambio.area} className="flex justify-between gap-3 tarjeta py-2">
                  <span>{nombreArea(cambio.area)}</span>
                  <span className={cambio.cambio > 0 ? 'text-exito' : 'text-tinta-suave'}>
                    {cambio.cambio > 0 ? 'subió' : 'bajó'} {Math.abs(cambio.cambio)} puntos
                  </span>
                </li>
              ))}
          </ul>
        </section>
      )}

      <div className="space-y-2">
        <Link to="/explorar" className="toque ondulado w-full rounded-chico bg-primario px-5 py-3 font-semibold text-sobre-primario">
          Ver carreras de estas áreas
        </Link>
        <button
          type="button"
          onClick={onRehacer}
          className="toque ondulado w-full rounded-chico border border-borde px-5 py-3 font-semibold"
        >
          Contestar otra vez
        </button>
        <p className="text-micro text-tinta-suave">
          Puedes volver a contestarlo cuando quieras. Guardamos cada versión para que veas cómo cambias.
        </p>
      </div>
    </div>
  );
}
