import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Cargando } from '@/components/Cargando';
import { Grafica } from '@/features/roi/Grafica';
import {
  ETIQUETA_DEDICACION,
  compararRutas,
  describirSupuestos,
  type DedicacionTrabajo,
  type Ruta,
} from '@/features/roi/calculo';
import { cargarCarreras } from '@/lib/carreras';
import { tieneFuente } from '@/data/reglas.js';
import type { Carrera } from '@/data/tipos';

const pesos = (monto: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(monto);

interface Entradas {
  carreraId: string;
  tipo: 'publica' | 'privada';
  colegiatura: number;
  gastos: number;
  ingresoEsperado: number;
  dedicacion: DedicacionTrabajo;
}

const ENTRADAS_BASE: Entradas = {
  carreraId: '',
  tipo: 'publica',
  colegiatura: 0,
  gastos: 2500,
  ingresoEsperado: 12000,
  dedicacion: 'nada',
};

function ControlRuta({
  titulo,
  carreras,
  entradas,
  onCambio,
}: {
  titulo: string;
  carreras: Carrera[];
  entradas: Entradas;
  onCambio: (entradas: Entradas) => void;
}) {
  const carrera = carreras.find((c) => c.id === entradas.carreraId);
  const id = titulo.replace(/\s+/g, '-').toLowerCase();

  return (
    <div className="tarjeta space-y-3">
      <h3 className="text-base font-semibold">{titulo}</h3>

      <div>
        <label htmlFor={`${id}-carrera`} className="block text-sm font-semibold">
          Carrera
        </label>
        <select
          id={`${id}-carrera`}
          value={entradas.carreraId}
          onChange={(evento) => onCambio({ ...entradas, carreraId: evento.target.value })}
          className="toque mt-1 w-full rounded-xl2 border border-borde bg-superficie-2 px-3 py-3 text-base"
        >
          <option value="">Elige una carrera</option>
          {carreras.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre} ({c.duracionAnios} {c.duracionAnios === 1 ? 'año' : 'años'})
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold">Tipo de escuela</legend>
        <div className="mt-1 flex gap-2">
          {(['publica', 'privada'] as const).map((tipo) => (
            <button
              key={tipo}
              type="button"
              aria-pressed={entradas.tipo === tipo}
              onClick={() =>
                onCambio({ ...entradas, tipo, colegiatura: tipo === 'publica' ? 0 : Math.max(entradas.colegiatura, 3500) })
              }
              className={[
                'toque flex-1 rounded-xl2 border px-3 py-2 text-sm',
                entradas.tipo === tipo ? 'border-marca bg-marca-suave text-marca' : 'border-borde',
              ].join(' ')}
            >
              {tipo === 'publica' ? 'Pública' : 'Privada'}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor={`${id}-colegiatura`} className="flex justify-between text-sm font-semibold">
          <span>Colegiatura al mes</span>
          <span className="tabular-nums text-marca">{pesos(entradas.colegiatura)}</span>
        </label>
        <input
          id={`${id}-colegiatura`}
          type="range"
          min={0}
          max={20000}
          step={250}
          value={entradas.colegiatura}
          onChange={(evento) => onCambio({ ...entradas, colegiatura: Number(evento.target.value) })}
          className="mt-2 h-11 w-full accent-marca"
        />
        <p className="text-xs text-texto-suave">Muévelo para ver qué cambia si estudias en pública.</p>
      </div>

      <div>
        <label htmlFor={`${id}-gastos`} className="flex justify-between text-sm font-semibold">
          <span>Gastos de vida y transporte al mes</span>
          <span className="tabular-nums text-marca">{pesos(entradas.gastos)}</span>
        </label>
        <input
          id={`${id}-gastos`}
          type="range"
          min={0}
          max={15000}
          step={250}
          value={entradas.gastos}
          onChange={(evento) => onCambio({ ...entradas, gastos: Number(evento.target.value) })}
          className="mt-2 h-11 w-full accent-marca"
        />
      </div>

      <div>
        <label htmlFor={`${id}-ingreso`} className="block text-sm font-semibold">
          Lo que esperas ganar al mes cuando salgas
        </label>
        <input
          id={`${id}-ingreso`}
          type="number"
          inputMode="numeric"
          min={0}
          step={500}
          value={entradas.ingresoEsperado}
          onChange={(evento) => onCambio({ ...entradas, ingresoEsperado: Number(evento.target.value) })}
          className="toque mt-1 w-full rounded-xl2 border border-borde bg-superficie-2 px-3 py-3 text-base tabular-nums"
        />
        <p className="text-xs text-texto-suave">
          {carrera && tieneFuente(carrera.laboral.salarioEntradaMxn)
            ? 'Viene de la ficha, con fuente citada. Puedes cambiarlo.'
            : 'Todavía no tenemos este dato con fuente, así que el número es tuyo, no nuestro. Pregunta a alguien que ya trabaje de eso.'}
        </p>
      </div>

      <div>
        <label htmlFor={`${id}-dedicacion`} className="block text-sm font-semibold">
          ¿Vas a trabajar mientras estudias?
        </label>
        <select
          id={`${id}-dedicacion`}
          value={entradas.dedicacion}
          onChange={(evento) => onCambio({ ...entradas, dedicacion: evento.target.value as DedicacionTrabajo })}
          className="toque mt-1 w-full rounded-xl2 border border-borde bg-superficie-2 px-3 py-3 text-base"
        >
          {(Object.keys(ETIQUETA_DEDICACION) as DedicacionTrabajo[]).map((valor) => (
            <option key={valor} value={valor}>
              {ETIQUETA_DEDICACION[valor]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function Calculadora() {
  const [parametros] = useSearchParams();
  const [carreras, setCarreras] = useState<Carrera[] | null>(null);
  const [ingresoSinCarrera, setIngresoSinCarrera] = useState(6000);
  const [a, setA] = useState<Entradas>({ ...ENTRADAS_BASE, carreraId: parametros.get('a') ?? '' });
  const [b, setB] = useState<Entradas>({ ...ENTRADAS_BASE, carreraId: parametros.get('b') ?? '' });

  useEffect(() => {
    let vigente = true;
    cargarCarreras()
      .then((datos) => vigente && setCarreras(datos))
      .catch(() => vigente && setCarreras([]));
    return () => {
      vigente = false;
    };
  }, []);

  // si la ficha tiene sueldo con fuente, se usa como punto de partida
  useEffect(() => {
    if (!carreras) return;
    for (const [entradas, set] of [
      [a, setA],
      [b, setB],
    ] as const) {
      const carrera = carreras.find((c) => c.id === entradas.carreraId);
      const dato = carrera?.laboral.salarioEntradaMxn;
      if (carrera && tieneFuente(dato)) {
        const valor = (dato as { valor: { min: number; max: number } }).valor;
        set({ ...entradas, ingresoEsperado: Math.round((valor.min + valor.max) / 2) });
      }
    }
    // solo al cambiar de carrera
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carreras, a.carreraId, b.carreraId]);

  const comparacion = useMemo(() => {
    if (!carreras) return null;
    const construir = (entradas: Entradas, sufijo: string): Ruta | null => {
      const carrera = carreras.find((c) => c.id === entradas.carreraId);
      if (!carrera) return null;
      return {
        id: `${carrera.id}-${sufijo}`,
        nombre: `${carrera.nombre} (${entradas.tipo === 'publica' ? 'pública' : 'privada'})`,
        duracionAnios: carrera.duracionAnios,
        colegiaturaMensualMxn: entradas.colegiatura,
        gastosMensualesMxn: entradas.gastos,
        ingresoEsperadoMensualMxn: entradas.ingresoEsperado,
        origenIngreso: tieneFuente(carrera.laboral.salarioEntradaMxn) ? 'fuente' : 'supuesto',
        dedicacion: entradas.dedicacion,
      };
    };
    const rutas = [construir(a, 'a'), construir(b, 'b')].filter(Boolean) as Ruta[];
    if (rutas.length === 0) return null;
    return compararRutas(rutas, { ingresoSinCarreraMensualMxn: ingresoSinCarrera, horizonteAnios: 10 });
  }, [carreras, a, b, ingresoSinCarrera]);

  if (!carreras) return <Cargando etiqueta="Abriendo la calculadora…" />;

  return (
    <div className="contenedor-app space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl">¿Cuánto cuesta de verdad y en cuánto se recupera?</h1>
        <p className="text-texto-suave">
          Compara dos rutas: cuánto te cuesta cada una, cuánto dejas de ganar mientras estudias y cómo
          van las dos a los 5 y a los 10 años.
        </p>
      </header>

      <aside
        aria-label="Advertencia sobre las estimaciones"
        className="rounded-xl2 border-l-4 border-aviso bg-aviso/10 p-4 text-sm"
      >
        <p className="font-semibold">Son estimaciones, no promesas.</p>
        <p className="mt-1 text-texto-suave">
          Los resultados salen de los números que tú pones y de medianas nacionales cuando existen con
          fuente. Los casos individuales varían muchísimo: la ciudad, la escuela, los contactos y la
          suerte cambian todo. Nadie te está garantizando ningún sueldo ni ningún resultado.
        </p>
      </aside>

      <div>
        <label htmlFor="sin-carrera" className="block text-sm font-semibold">
          Si te pusieras a trabajar ya, ¿cuánto ganarías al mes?
        </label>
        <input
          id="sin-carrera"
          type="number"
          inputMode="numeric"
          min={0}
          step={500}
          value={ingresoSinCarrera}
          onChange={(evento) => setIngresoSinCarrera(Number(evento.target.value))}
          className="toque mt-1 w-full rounded-xl2 border border-borde bg-superficie-2 px-3 py-3 text-base tabular-nums"
        />
        <p className="text-xs text-texto-suave">
          De aquí sale el costo de oportunidad: lo que dejas de ganar por estar estudiando.
        </p>
      </div>

      <ControlRuta titulo="Ruta 1" carreras={carreras} entradas={a} onCambio={setA} />
      <ControlRuta titulo="Ruta 2 (opcional)" carreras={carreras} entradas={b} onCambio={setB} />

      {comparacion ? (
        <>
          <section aria-labelledby="resultados" className="space-y-4">
            <h2 id="resultados" className="text-lg">
              Qué sale con esos números
            </h2>

            {comparacion.rutas.map((resultado) => (
              <div key={resultado.ruta.id} className="tarjeta space-y-2 text-sm">
                <p className="text-base font-semibold">{resultado.ruta.nombre}</p>
                <dl className="space-y-1">
                  <div className="flex justify-between gap-3">
                    <dt className="text-texto-suave">Costo total de estudiar</dt>
                    <dd className="tabular-nums">{pesos(resultado.costoDirectoMxn)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-texto-suave">Lo que dejas de ganar mientras estudias</dt>
                    <dd className="tabular-nums">{pesos(resultado.costoOportunidadMxn)}</dd>
                  </div>
                  <div className="flex justify-between gap-3 border-t border-borde pt-1 font-semibold">
                    <dt>Inversión total</dt>
                    <dd className="tabular-nums">{pesos(resultado.inversionTotalMxn)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-texto-suave">Ingreso esperado al año</dt>
                    <dd className="tabular-nums">{pesos(resultado.ingresoAnualEsperadoMxn)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-texto-suave">Tiempo para recuperar la inversión</dt>
                    <dd className="tabular-nums">
                      {resultado.aniosParaRecuperar === null
                        ? 'No se recupera con estos números'
                        : `${resultado.aniosParaRecuperar} años después de salir`}
                    </dd>
                  </div>
                </dl>
                {resultado.aniosParaRecuperar === null && (
                  <p className="text-xs text-aviso">
                    Con los números que pusiste, ganarías lo mismo o menos que sin estudiar. Revisa el
                    ingreso esperado o compara con una ruta más corta.
                  </p>
                )}
              </div>
            ))}
          </section>

          <section aria-labelledby="grafica" className="space-y-3">
            <h2 id="grafica" className="text-lg">
              Cómo van a los 5 y a los 10 años
            </h2>
            <Grafica comparacion={comparacion} />
            <ul className="space-y-1 text-sm">
              {comparacion.cortes.map((corte) => (
                <li key={corte.anio} className="tarjeta">
                  <p className="font-semibold">Al año {corte.anio}</p>
                  <ul className="mt-1 space-y-0.5 text-texto-suave">
                    {corte.valores.map((valor) => {
                      const ruta = comparacion.rutas.find((r) => r.ruta.id === valor.rutaId);
                      return (
                        <li key={valor.rutaId} className="flex justify-between gap-3">
                          <span>{ruta?.ruta.nombre}</span>
                          <span className="tabular-nums">{pesos(valor.monto)}</span>
                        </li>
                      );
                    })}
                    <li className="flex justify-between gap-3">
                      <span>Sin estudiar</span>
                      <span className="tabular-nums">{pesos(comparacion.referencia[corte.anio] ?? 0)}</span>
                    </li>
                  </ul>
                </li>
              ))}
            </ul>
            <p className="text-xs text-texto-suave">
              Quien va arriba a los 5 años no siempre va arriba a los 10: las rutas cortas empiezan a
              ganar antes, las largas suelen alcanzar después. Por eso están los dos cortes.
            </p>
          </section>

          <section aria-labelledby="supuestos" className="space-y-2">
            <h2 id="supuestos" className="text-lg">
              Los supuestos que se usaron
            </h2>
            <ul className="tarjeta list-disc space-y-2 pl-5 text-sm text-texto-suave">
              {describirSupuestos(comparacion).map((linea) => (
                <li key={linea}>{linea}</li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <p className="tarjeta text-sm text-texto-suave">
          Elige al menos una carrera arriba para ver los números.{' '}
          <Link to="/explorar" className="text-marca underline">
            Ver carreras
          </Link>
        </p>
      )}
      <p className="text-xs text-texto-suave">
        Modelo abierto: la aritmética completa está en <code>src/features/roi/calculo.ts</code>.
      </p>
    </div>
  );
}
