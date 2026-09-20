import { useCallback, useEffect, useState } from 'react';
import { Boton } from '@/components/Boton';
import { Cargando } from '@/components/Cargando';
import {
  MINIMO_GRUPO,
  cargarAreas,
  cargarCambioImpacto,
  cargarCarrerasExploradas,
  cargarCobertura,
  cargarLicencia,
  cargarSinRumbo,
  csvPanel,
  type AreaGeneracion,
  type CambioImpacto,
  type CarreraExplorada,
  type Cobertura,
  type EstadoLicencia,
  type SinRumbo,
} from '@/features/panel/datos';
import { descargar, registrarAcceso } from '@/lib/privacidad';
import { obtenerSupabase, perfilUsuario, supabaseConfigurado, type PerfilUsuario } from '@/lib/supabase';

interface Datos {
  cobertura: Cobertura | null;
  sinRumbo: SinRumbo | null;
  areas: AreaGeneracion[];
  impacto: CambioImpacto[];
  carreras: CarreraExplorada[];
  licencia: EstadoLicencia | null;
}

function Acceso({ onEntrar }: { onEntrar: () => void }) {
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [entrando, setEntrando] = useState(false);

  const entrar = async () => {
    setEntrando(true);
    setError('');
    const supabase = await obtenerSupabase();
    if (!supabase) {
      setError('El panel no está configurado en esta instalación.');
      setEntrando(false);
      return;
    }
    const { error: fallo } = await supabase.auth.signInWithPassword({ email: correo, password: clave });
    setEntrando(false);
    if (fallo) setError('No pudimos entrar con esos datos.');
    else onEntrar();
  };

  return (
    <div className="contenedor-app space-y-4">
      <h1 className="text-2xl">Panel de la escuela</h1>
      <p className="text-texto-suave">Acceso para orientación y dirección.</p>
      <div className="tarjeta space-y-3">
        <div>
          <label htmlFor="correo" className="block text-sm font-semibold">Correo institucional</label>
          <input
            id="correo"
            type="email"
            autoComplete="username"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="toque mt-1 w-full rounded-xl2 border border-borde bg-superficie-2 px-3 py-3 text-base"
          />
        </div>
        <div>
          <label htmlFor="clave" className="block text-sm font-semibold">Contraseña</label>
          <input
            id="clave"
            type="password"
            autoComplete="current-password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            className="toque mt-1 w-full rounded-xl2 border border-borde bg-superficie-2 px-3 py-3 text-base"
          />
        </div>
        <Boton anchoCompleto disabled={entrando} onClick={entrar}>
          {entrando ? 'Entrando…' : 'Entrar'}
        </Boton>
        {error && <p role="alert" className="text-sm text-error">{error}</p>}
      </div>
      <p className="text-xs text-texto-suave">
        Este panel solo muestra resultados del grupo. No existe ninguna pantalla, consulta ni exportación
        que devuelva la respuesta de un alumno en particular.
      </p>
    </div>
  );
}

function Tarjeta({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="tarjeta space-y-2">
      <h2 className="text-base font-semibold">{titulo}</h2>
      {children}
    </section>
  );
}

const SinDatosSuficientes = ({ n }: { n: number }) => (
  <p className="text-sm text-texto-suave">
    No se muestra: hay {n} respuestas y el mínimo para publicar es {MINIMO_GRUPO}. Con menos, un promedio
    permitiría identificar a un alumno.
  </p>
);

export default function Panel() {
  const [perfil, setPerfil] = useState<PerfilUsuario | null | undefined>(undefined);
  const [datos, setDatos] = useState<Datos | null>(null);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    const usuario = await perfilUsuario();
    setPerfil(usuario);
    if (!usuario || usuario.rol === 'alumno') return;

    try {
      const [cobertura, sinRumbo, areas, impacto, carreras, licencia] = await Promise.all([
        cargarCobertura(usuario.plantel_id),
        cargarSinRumbo(usuario.plantel_id),
        cargarAreas(usuario.plantel_id),
        cargarCambioImpacto(usuario.plantel_id),
        cargarCarrerasExploradas(usuario.plantel_id),
        cargarLicencia(usuario.plantel_id),
      ]);
      setDatos({ cobertura, sinRumbo, areas, impacto, carreras, licencia });
      await registrarAcceso(usuario.rol, 'agregados_del_plantel', 'leer');
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No pudimos cargar el panel.');
    }
  }, []);

  useEffect(() => {
    if (!supabaseConfigurado) {
      setPerfil(null);
      return;
    }
    void cargar();
  }, [cargar]);

  if (!supabaseConfigurado) {
    return (
      <div className="contenedor-app space-y-3">
        <h1 className="text-2xl">Panel de la escuela</h1>
        <p className="tarjeta text-sm text-texto-suave">
          Esta instalación corre en modo local, sin backend. El panel necesita las variables
          <code className="mx-1">VITE_SUPABASE_URL</code> y <code className="mx-1">VITE_SUPABASE_ANON_KEY</code>
          y las migraciones de <code>supabase/migrations</code> aplicadas.
        </p>
      </div>
    );
  }

  if (perfil === undefined) return <Cargando etiqueta="Abriendo el panel…" />;
  if (perfil === null) return <Acceso onEntrar={() => void cargar()} />;
  if (perfil.rol === 'alumno') {
    return (
      <div className="contenedor-app">
        <p className="tarjeta text-sm">Tu cuenta es de alumno: este panel es para orientación y dirección.</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="contenedor-app">
        <p role="alert" className="tarjeta text-sm text-error">{error}</p>
      </div>
    );
  }
  if (!datos) return <Cargando etiqueta="Cargando agregados…" />;

  const { licencia } = datos;
  const bloqueoSuave = licencia && !licencia.vigente;

  const exportarCsv = async () => {
    const csv = csvPanel([
      {
        titulo: 'Cobertura',
        encabezados: ['alumnos', 'con_perfil'],
        filas: [[datos.cobertura?.alumnos ?? 0, datos.cobertura?.con_perfil ?? 0]],
      },
      {
        titulo: 'Áreas hacia las que se inclina la generación',
        encabezados: ['area', 'alumnos', 'porcentaje'],
        filas: datos.areas.map((a) => [a.area, a.alumnos, a.porcentaje]),
      },
      {
        titulo: 'Cambio entre primera y segunda medición',
        encabezados: ['indicador', 'n_inicial', 'n_seguimiento', 'inicial', 'seguimiento', 'cambio'],
        filas: datos.impacto.map((i) => [i.indicador, i.n_inicial, i.n_seguimiento, i.inicial, i.seguimiento, i.cambio]),
      },
      {
        titulo: 'Carreras más exploradas',
        encabezados: ['carrera', 'alumnos'],
        filas: datos.carreras.map((c) => [c.carrera_id, c.alumnos]),
      },
    ]);
    descargar(`panel-nombreapp-${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv');
    await registrarAcceso(perfil.rol, 'agregados_del_plantel', 'exportar');
  };

  return (
    <div className="contenedor-app space-y-5 pb-6">
      <header className="space-y-1">
        <h1 className="text-2xl">Panel de la escuela</h1>
        <p className="text-sm text-texto-suave">
          Datos agregados del plantel. Nunca información de un alumno identificable.
        </p>
      </header>

      {licencia && (
        <div
          className={[
            'rounded-xl2 border-l-4 p-3 text-sm',
            licencia.vigente ? 'border-exito bg-exito/10' : 'border-aviso bg-aviso/10',
          ].join(' ')}
        >
          {licencia.vigente ? (
            <p>
              Licencia vigente hasta el {new Date(licencia.fecha_fin).toLocaleDateString('es-MX')} (
              {licencia.dias_restantes} días). {licencia.alumnos_registrados} de {licencia.alumnos_permitidos}{' '}
              alumnos registrados.
            </p>
          ) : (
            <p>
              <strong>La licencia venció</strong> el {new Date(licencia.fecha_fin).toLocaleDateString('es-MX')}.
              {licencia.en_gracia
                ? ' Sigues viendo el panel durante el periodo de gracia; los datos de los alumnos no se borran ni se bloquean.'
                : ' El panel quedó en solo lectura. Los alumnos siguen usando la app y sus datos siguen intactos.'}
            </p>
          )}
          {licencia.alumnos_registrados > licencia.alumnos_permitidos && (
            <p className="mt-1">
              Hay más alumnos registrados que los permitidos por la licencia. Avísanos para ampliarla; no
              bloqueamos a nadie por esto.
            </p>
          )}
        </div>
      )}

      <Tarjeta titulo="Alumnos con su perfil completo">
        {datos.cobertura && datos.cobertura.publicable ? (
          <p className="text-2xl font-semibold tabular-nums">
            {datos.cobertura.con_perfil}
            <span className="text-base font-normal text-texto-suave"> de {datos.cobertura.alumnos} alumnos</span>
          </p>
        ) : (
          <SinDatosSuficientes n={datos.cobertura?.alumnos ?? 0} />
        )}
      </Tarjeta>

      <Tarjeta titulo="Siguen sin rumbo definido">
        {datos.sinRumbo?.publicable ? (
          <>
            <p className="text-2xl font-semibold tabular-nums">{datos.sinRumbo.porcentaje}%</p>
            <p className="text-xs text-texto-suave">
              Alumnos que reportan 1 o 2 en seguridad de su decisión, sobre {datos.sinRumbo.n} respuestas.
            </p>
          </>
        ) : (
          <SinDatosSuficientes n={datos.sinRumbo?.n ?? 0} />
        )}
      </Tarjeta>

      <Tarjeta titulo="Hacia dónde se inclina la generación">
        {datos.areas.length === 0 ? (
          <SinDatosSuficientes n={datos.cobertura?.con_perfil ?? 0} />
        ) : (
          <ul className="space-y-2">
            {datos.areas.map((area) => (
              <li key={area.area}>
                <div className="flex justify-between text-sm">
                  <span>{area.area}</span>
                  <span className="tabular-nums text-texto-suave">{area.porcentaje}%</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-superficie-2">
                  <div className="h-full rounded-full bg-serie-a" style={{ width: `${area.porcentaje}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>

      <Tarjeta titulo="Cómo cambió el grupo entre las dos mediciones">
        {datos.impacto.length === 0 || datos.impacto[0]?.publicable === false ? (
          <SinDatosSuficientes n={datos.impacto[0]?.n_inicial ?? 0} />
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-borde text-xs text-texto-suave">
                <th scope="col" className="py-1">Indicador</th>
                <th scope="col" className="py-1 text-right">Antes</th>
                <th scope="col" className="py-1 text-right">Después</th>
                <th scope="col" className="py-1 text-right">Cambio</th>
              </tr>
            </thead>
            <tbody>
              {datos.impacto.map((fila) => (
                <tr key={fila.indicador} className="border-b border-borde/50">
                  <th scope="row" className="py-1 pr-2 font-normal">{fila.indicador}</th>
                  <td className="py-1 text-right tabular-nums">{fila.inicial}</td>
                  <td className="py-1 text-right tabular-nums">{fila.seguimiento}</td>
                  <td className="py-1 text-right tabular-nums">{fila.cambio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Tarjeta>

      <Tarjeta titulo="Carreras más exploradas">
        {datos.carreras.length === 0 ? (
          <SinDatosSuficientes n={datos.cobertura?.alumnos ?? 0} />
        ) : (
          <ol className="space-y-1 text-sm">
            {datos.carreras.map((carrera) => (
              <li key={carrera.carrera_id} className="flex justify-between gap-3">
                <span>{carrera.carrera_id}</span>
                <span className="tabular-nums text-texto-suave">{carrera.alumnos} alumnos</span>
              </li>
            ))}
          </ol>
        )}
        <p className="text-xs text-texto-suave">
          Las carreras que nadie abrió no aparecen aquí: son justo las que conviene presentarle a la
          generación. Se identifican comparando esta lista contra el catálogo completo.
        </p>
      </Tarjeta>

      <div className="space-y-2 print:hidden">
        <Boton anchoCompleto disabled={Boolean(bloqueoSuave && !licencia?.en_gracia)} onClick={exportarCsv}>
          Descargar CSV
        </Boton>
        <Boton variante="secundario" anchoCompleto onClick={() => window.print()}>
          Imprimir o guardar como PDF
        </Boton>
        <p className="text-xs text-texto-suave">
          El PDF sale del diálogo de impresión del navegador: sin librerías extra y con los mismos datos
          que ves aquí.
        </p>
      </div>
    </div>
  );
}
