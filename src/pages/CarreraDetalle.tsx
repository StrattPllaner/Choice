import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BloqueDato } from '@/components/BloqueDato';
import { EsqueletoFicha } from '@/components/Esqueleto';
import { EstadoError } from '@/components/Estados';
import { useEsperaLarga } from '@/lib/retraso';
import { ListaFuentes } from '@/components/Fuente';
import { AccionesCarrera } from '@/features/carrera/AccionesCarrera';
import { MapaMaterias } from '@/features/carrera/MapaMaterias';
import { senalDuracion, senalesPara } from '@/features/perfil/senales';
import { usarSesion } from '@/features/sesion/usarSesion';
import {
  cargarAreas,
  cargarBecas,
  cargarCarrera,
  becasDe,
  estadoDeDatos,
  formatearPorcentaje,
  formatearRango,
} from '@/lib/carreras';
import { leerHistorial, perfilVigente, type VersionPerfil } from '@/lib/perfil';
import {
  ETIQUETA_MODALIDAD,
  ETIQUETA_NIVEL,
  ETIQUETA_SATURACION,
  type Area,
  type Beca,
  type Carrera,
} from '@/data/tipos';

/** Motivos de "dato no disponible". Se dice de dónde tendría que salir el dato,
 *  para que se vea que es un pendiente con plan, no un hueco. */
const PORQUE = {
  salario:
    'Todavía no procesamos los microdatos de la ENOE para esta carrera. Preferimos dejarlo vacío antes que inventar un número.',
  desempleo:
    'Sale de los microdatos de la ENOE del INEGI. En cuanto esté procesado con su cita, aparece aquí.',
  saturacion:
    'Se calcula cruzando egresados (ANUIES) contra empleo (ENOE). Sin ese cruce hecho y citado, no lo publicamos.',
  costos:
    'Los costos cambian por escuela y por estado; vamos a publicarlos solo con la cuota oficial de cada institución como fuente.',
  instituciones:
    'Estamos armando la lista de escuelas por estado con datos de SEP y ANUIES. Mientras, pregunta en tu prepa por la oferta de tu zona.',
} as const;

export default function CarreraDetalle() {
  const { id } = useParams();
  const { sesion, registrarVista } = usarSesion();
  const [carrera, setCarrera] = useState<Carrera | null | undefined>(undefined);
  const [areas, setAreas] = useState<Area[]>([]);
  const [becas, setBecas] = useState<Beca[]>([]);
  const [perfil, setPerfil] = useState<VersionPerfil | null>(null);

  useEffect(() => {
    let vigente = true;
    if (!id) return;
    Promise.all([cargarCarrera(id), cargarAreas(), cargarBecas(), leerHistorial()])
      .then(([ficha, todasAreas, todasBecas, historial]) => {
        if (!vigente) return;
        setCarrera(ficha ?? null);
        setAreas(todasAreas);
        setBecas(todasBecas);
        setPerfil(perfilVigente(historial));
        if (ficha) registrarVista(ficha.id);
      })
      .catch(() => vigente && setCarrera(null));
    return () => {
      vigente = false;
    };
    // registrarVista cambia en cada render del proveedor; solo nos interesa el id
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const esperaLarga = useEsperaLarga(carrera === undefined);

  const senales = useMemo(() => {
    if (!carrera || !perfil) return [];
    const lista = senalesPara(carrera.area, perfil.respuestas);
    const duracion = senalDuracion(carrera.duracionAnios, perfil.respuestas);
    return duracion ? [...lista, duracion] : lista;
  }, [carrera, perfil]);

  if (carrera === undefined) return esperaLarga ? <div className="contenedor-app"><EsqueletoFicha /></div> : null;

  if (carrera === null) {
    return (
      <div className="contenedor-app">
        <EstadoError
          tipo={navigator.onLine ? 'no-encontrado' : 'conexion'}
          accionAlterna={
            <Link to="/explorar" className="toque anillo-foco rounded-chico border border-borde-fuerte px-5 py-3 font-medium">
              Ver todas las carreras
            </Link>
          }
        />
      </div>
    );
  }

  const area = areas.find((a) => a.id === carrera.area);
  const becasAplicables = becasDe(carrera, becas);
  const datos = estadoDeDatos(carrera);
  const posicionEnMapa = perfil?.resultado.afinidades.findIndex((a) => a.area === carrera.area) ?? -1;
  const enSugeridas = perfil?.resultado.sugeridas.includes(carrera.area) ?? false;

  return (
    <article className="contenedor-app pb-4">
      <header className="medida space-y-2">
        <p className="text-chico text-tinta-suave">
          {area?.nombre ?? carrera.area} · {ETIQUETA_NIVEL[carrera.nivel]}
        </p>
        <h1 className="text-xl">{carrera.nombre}</h1>
        <p className="text-chico text-tinta-suave">
          {carrera.duracionAnios} {carrera.duracionAnios === 1 ? 'año' : 'años'} ·{' '}
          {carrera.modalidades.map((m) => ETIQUETA_MODALIDAD[m]).join(' · ')}
        </p>
        {carrera.nombresAlternativos.length > 0 && (
          <p className="text-micro text-tinta-suave">También la llaman: {carrera.nombresAlternativos.join(', ')}</p>
        )}
      </header>

      <div className="mt-4 max-w-dialogo">
        <AccionesCarrera carrera={carrera} />
      </div>

      {/* En pantalla ancha, lo que se lee va a la izquierda y los datos de decisión
          (dónde, cuánto cuesta, becas) quedan a la derecha, fijos al hacer scroll. */}
      <div className="columnas-ficha mt-7">
        <div className="min-w-0 space-y-7">

      {/* 1 ── Un martes cualquiera */}
      <section aria-labelledby="s1" className="space-y-2">
        <h2 id="s1" className="text-lg">
          Un martes cualquiera en este trabajo
        </h2>
        <p className="tarjeta medida text-base leading-relaxed">{carrera.martesTipico}</p>
      </section>

      {/* 2 ── Qué estudias */}
      <section aria-labelledby="s2" className="space-y-3">
        <h2 id="s2" className="text-lg">
          Qué estudias
        </h2>
        <MapaMaterias carrera={carrera} />
      </section>

      {/* 3 ── Qué se te va a dificultar */}
      <section aria-labelledby="s3" className="space-y-3">
        <h2 id="s3" className="text-lg">
          Qué se te va a dificultar
        </h2>

        {perfil ? (
          <div className="rounded-xl2 border-l-4 border-primario bg-primario-suave p-4 text-chico">
            <p className="font-semibold text-primario">Según tu mapa</p>
            <p className="mt-1">
              {enSugeridas
                ? `Esta área salió entre las que te sugerimos explorar primero (lugar ${posicionEnMapa + 1} de ${perfil.resultado.afinidades.length}).`
                : `Esta área quedó en el lugar ${posicionEnMapa + 1} de ${perfil.resultado.afinidades.length} en tu mapa. Eso no la descarta: es información para que entres con los ojos abiertos.`}
            </p>
            {senales.length > 0 && (
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {senales.map((senal) => (
                  <li key={senal}>{senal}</li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-micro text-tinta-suave">
              Esto sale de lo que tú contestaste, no de una evaluación profesional.
            </p>
          </div>
        ) : (
          <p className="tarjeta text-chico">
            <Link to="/mapa" className="text-primario underline">
              Arma tu mapa
            </Link>{' '}
            y esta parte se personaliza con lo que contestaste.
          </p>
        )}

        <div className="tarjeta space-y-3 text-chico">
          <p>{carrera.quienBatalla.resumen}</p>
          <div>
            <p className="font-semibold">Aguas si te identificas con esto</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-tinta-suave">
              {carrera.quienBatalla.senales.map((senal) => (
                <li key={senal}>{senal}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold">Qué sí ayuda</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-tinta-suave">
              {carrera.quienBatalla.queAyuda.map((ayuda) => (
                <li key={ayuda}>{ayuda}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 4 ── Cuánto se gana */}
      <section aria-labelledby="s4" className="space-y-3">
        <h2 id="s4" className="text-lg">
          Cuánto se gana
        </h2>
        <div className="tarjeta space-y-3">
          <BloqueDato
            etiqueta="Al entrar"
            dato={carrera.laboral.salarioEntradaMxn}
            porQueFalta={PORQUE.salario}
            aclaracion="Es la mediana: la mitad gana menos y la mitad más. No es el mejor caso ni lo que sale en las noticias."
          >
            {(rango) => formatearRango(rango)}
          </BloqueDato>
          <BloqueDato
            etiqueta="A cinco años"
            dato={carrera.laboral.salarioCincoAniosMxn}
            porQueFalta={PORQUE.salario}
            aclaracion="También es mediana, con unos cinco años de experiencia. Depende muchísimo de la ciudad y del lugar donde trabajes."
          >
            {(rango) => formatearRango(rango)}
          </BloqueDato>
        </div>
      </section>

      {/* 5 ── Saturación e informalidad */}
      <section aria-labelledby="s5" className="space-y-3">
        <h2 id="s5" className="text-lg">
          Qué tan peleado está el trabajo
        </h2>
        <div className="tarjeta space-y-3">
          <BloqueDato
            etiqueta="Saturación"
            dato={carrera.laboral.saturacion}
            porQueFalta={PORQUE.saturacion}
            aclaracion="Compara cuántos egresan contra cuánto empleo hay."
          >
            {(nivel) => ETIQUETA_SATURACION[nivel]}
          </BloqueDato>
          <BloqueDato
            etiqueta="Desempleo entre egresados"
            dato={carrera.laboral.tasaDesempleo}
            porQueFalta={PORQUE.desempleo}
          >
            {(tasa) => formatearPorcentaje(tasa)}
          </BloqueDato>
          <BloqueDato
            etiqueta="Termina en la informalidad"
            dato={carrera.laboral.tasaInformalidad}
            porQueFalta={PORQUE.desempleo}
            aclaracion="Sin contrato, sin seguro social y sin prestaciones."
          >
            {(tasa) => formatearPorcentaje(tasa)}
          </BloqueDato>
        </div>
      </section>

        </div>

        <aside className="columna-apoyo space-y-7">

      {/* 6 ── Dónde se estudia y cuánto cuesta */}
      <section aria-labelledby="s6" className="space-y-3">
        <h2 id="s6" className="text-lg">
          Dónde se estudia y cuánto cuesta
        </h2>
        <div className="tarjeta space-y-3">
          <BloqueDato
            etiqueta={sesion?.estado ? `Escuelas en ${sesion.estado}` : 'Dónde se estudia'}
            dato={carrera.dondeEstudiar}
            porQueFalta={PORQUE.instituciones}
          >
            {(instituciones) => {
              const cercanas = sesion?.estado
                ? instituciones.filter((i) => i.estado === sesion.estado)
                : instituciones;
              const lista = cercanas.length > 0 ? cercanas : instituciones;
              return (
                <ul className="space-y-1">
                  {lista.map((institucion) => (
                    <li key={`${institucion.nombre}-${institucion.estado}`}>
                      {institucion.nombre} · {institucion.tipo === 'publica' ? 'Pública' : 'Privada'} ·{' '}
                      {institucion.ciudad ? `${institucion.ciudad}, ` : ''}
                      {institucion.estado}
                    </li>
                  ))}
                </ul>
              );
            }}
          </BloqueDato>
          {!sesion?.estado && (
            <p className="text-micro text-tinta-suave">
              <Link to="/perfil" className="text-primario underline">
                Dinos en qué estado vives
              </Link>{' '}
              para mostrarte primero lo que te queda cerca.
            </p>
          )}
          <BloqueDato
            etiqueta="Costo en pública"
            dato={carrera.costos.publicaMxn}
            porQueFalta={PORQUE.costos}
            aclaracion="Incluye inscripción, materiales y transporte: lo que de verdad sale del bolsillo."
          >
            {(rango) => formatearRango(rango)}
          </BloqueDato>
          <BloqueDato
            etiqueta="Costo en privada"
            dato={carrera.costos.privadaMxn}
            porQueFalta={PORQUE.costos}
            aclaracion="Colegiaturas de lista, sin beca."
          >
            {(rango) => formatearRango(rango)}
          </BloqueDato>
        </div>
      </section>

      {/* 7 ── Becas y apoyos */}
      <section aria-labelledby="s7" className="space-y-3">
        <h2 id="s7" className="text-lg">
          Becas y apoyos para esta ruta
        </h2>
        {becasAplicables.length === 0 ? (
          <p className="tarjeta text-chico text-tinta-suave">
            Todavía no tenemos becas verificadas para este nivel. Pregunta en tu escuela: casi siempre hay
            apoyos estatales que no están publicados en un solo lugar.
          </p>
        ) : (
          <ul className="space-y-3">
            {becasAplicables.map((beca) => (
              <li key={beca.id} className="tarjeta space-y-2">
                <p className="font-semibold">{beca.nombre}</p>
                <p className="text-micro text-tinta-suave">{beca.institucion}</p>
                <BloqueDato etiqueta="Monto" dato={beca.montoMxn} porQueFalta="La convocatoria vigente no publica monto.">
                  {(rango) => formatearRango(rango)}
                </BloqueDato>
                <p className="text-chico">{beca.requisitosResumen}</p>
                <ListaFuentes fuentes={beca.fuentes} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="space-y-2 border-t border-borde pt-4 text-micro text-tinta-suave">
        <p>
          Datos duros con fuente: {datos.conFuente} de {datos.total}.{' '}
          {datos.verificada
            ? 'Esta ficha está completa.'
            : 'Lo que falta aparece como "dato no disponible": preferimos eso a inventarlo.'}
        </p>
        <p>Ficha actualizada el {new Date(carrera.actualizado).toLocaleDateString('es-MX')}.</p>
        <ListaFuentes fuentes={carrera.fuentes} />
      </footer>

        </aside>
      </div>
    </article>
  );
}
