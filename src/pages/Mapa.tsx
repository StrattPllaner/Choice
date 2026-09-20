import { useCallback, useEffect, useState } from 'react';
import { AvisoGuia } from '@/components/AvisoGuia';
import { Boton } from '@/components/Boton';
import { Cargando } from '@/components/Cargando';
import { Cuestionario } from '@/features/perfil/Cuestionario';
import { MapaAfinidad } from '@/features/perfil/MapaAfinidad';
import { TOTAL_REACTIVOS } from '@/features/perfil/reactivos';
import type { Respuestas } from '@/features/perfil/puntuacion';
import { usarSesion } from '@/features/sesion/usarSesion';
import {
  guardarNuevaVersion,
  leerBorrador,
  leerHistorial,
  perfilVigente,
  primerPerfil,
  borrarBorrador,
  type Borrador,
  type VersionPerfil,
} from '@/lib/perfil';

type Vista = 'cargando' | 'inicio' | 'cuestionario' | 'resultado';

export default function Mapa() {
  const { sesion } = usarSesion();
  const [vista, setVista] = useState<Vista>('cargando');
  const [historial, setHistorial] = useState<VersionPerfil[]>([]);
  const [borrador, setBorrador] = useState<Borrador | null>(null);
  const [actual, setActual] = useState<VersionPerfil | null>(null);

  const recargar = useCallback(async () => {
    const [versiones, pendiente] = await Promise.all([leerHistorial(), leerBorrador()]);
    setHistorial(versiones);
    setBorrador(pendiente);
    const vigente = perfilVigente(versiones);
    setActual(vigente);
    setVista(vigente && !pendiente ? 'resultado' : 'inicio');
  }, []);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const terminar = async (respuestas: Respuestas) => {
    const version = await guardarNuevaVersion(respuestas, sesion?.grado ?? null);
    setActual(version);
    setHistorial((previas) => [...previas, version]);
    setBorrador(null);
    setVista('resultado');
    window.scrollTo({ top: 0 });
  };

  if (vista === 'cargando') return <Cargando etiqueta="Abriendo tu mapa…" />;

  if (vista === 'cuestionario') {
    return (
      <Cuestionario
        borrador={borrador}
        onTerminar={terminar}
        onSalir={() => {
          void recargar();
          setVista('inicio');
        }}
      />
    );
  }

  if (vista === 'resultado' && actual) {
    return (
      <MapaAfinidad
        version={actual}
        primera={primerPerfil(historial)}
        onRehacer={() => {
          void borrarBorrador();
          setBorrador(null);
          setVista('cuestionario');
        }}
      />
    );
  }

  const contestadas = borrador ? Object.keys(borrador.respuestas).length : 0;

  return (
    <div className="contenedor-app space-y-5">
      <h1 className="text-2xl">Arma tu mapa de exploración</h1>
      <p className="text-texto-suave">
        Son {TOTAL_REACTIVOS} preguntas cortas sobre lo que te late, lo que se te da, cómo te gusta
        trabajar y qué te importa. Se contesta en menos de 7 minutos y puedes pausarlo.
      </p>

      <AvisoGuia />

      {borrador && contestadas > 0 ? (
        <div className="space-y-2">
          <p className="tarjeta text-sm">
            Tienes {contestadas} de {TOTAL_REACTIVOS} preguntas contestadas.
          </p>
          <Boton anchoCompleto onClick={() => setVista('cuestionario')}>
            Seguir donde me quedé
          </Boton>
          <Boton
            variante="secundario"
            anchoCompleto
            onClick={() => {
              void borrarBorrador();
              setBorrador(null);
              setVista('cuestionario');
            }}
          >
            Empezar de nuevo
          </Boton>
        </div>
      ) : (
        <Boton anchoCompleto onClick={() => setVista('cuestionario')}>
          {historial.length > 0 ? 'Contestar otra vez' : 'Empezar'}
        </Boton>
      )}

      {historial.length > 0 && (
        <section aria-labelledby="titulo-historial" className="space-y-2">
          <h2 id="titulo-historial" className="text-lg">
            Tus mapas anteriores
          </h2>
          <ul className="space-y-2 text-sm">
            {[...historial].reverse().map((version) => (
              <li key={version.version}>
                <button
                  type="button"
                  onClick={() => {
                    setActual(version);
                    setVista('resultado');
                  }}
                  className="tarjeta toque w-full justify-between text-left"
                >
                  <span>
                    Versión {version.version} ·{' '}
                    {new Date(version.fecha).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                    {version.grado ? ` · ${version.grado}° de prepa` : ''}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
