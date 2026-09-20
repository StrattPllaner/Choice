import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Boton } from '@/components/Boton';
import { Cargando } from '@/components/Cargando';
import { usarSesion } from '@/features/sesion/usarSesion';
import {
  ETIQUETA_FORMA,
  borrarMisDatos,
  descargar,
  exportarMisDatos,
  leerAccesos,
  leerConsentimiento,
  revocarConsentimiento,
  type Acceso,
  type Consentimiento,
} from '@/lib/privacidad';

/** Derechos ARCO de verdad: ver, corregir, descargar y borrar. El borrado es real. */
export default function MisDatos() {
  const { sesion, actualizar, reiniciar } = usarSesion();
  const [consentimiento, setConsentimiento] = useState<Consentimiento | null | undefined>(undefined);
  const [accesos, setAccesos] = useState<Acceso[]>([]);
  const [confirmando, setConfirmando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    Promise.all([leerConsentimiento(), leerAccesos()]).then(([c, a]) => {
      setConsentimiento(c);
      setAccesos(a.slice(-20).reverse());
    });
  }, []);

  if (consentimiento === undefined) return <Cargando etiqueta="Abriendo tus datos…" />;

  return (
    <div className="contenedor-app space-y-6 pb-6">
      <header className="space-y-2">
        <h1 className="text-2xl">Mis datos</h1>
        <p className="text-texto-suave">
          Todo lo que guardamos de ti, y los botones para descargarlo o borrarlo. Sin trámites.
        </p>
      </header>

      <section aria-labelledby="permiso" className="tarjeta space-y-2 text-sm">
        <h2 id="permiso" className="text-base font-semibold">
          Permiso
        </h2>
        {consentimiento?.otorgado && !consentimiento.revocado ? (
          <>
            <p className="text-texto-suave">
              Autorizado el {new Date(consentimiento.fecha).toLocaleDateString('es-MX')} por{' '}
              {consentimiento.nombreTutor} ({consentimiento.parentesco}).
            </p>
            <p className="text-texto-suave">Forma: {ETIQUETA_FORMA[consentimiento.forma]}.</p>
            <p className="text-xs text-texto-suave">Aviso de privacidad versión {consentimiento.versionAviso}.</p>
          </>
        ) : (
          <p className="text-texto-suave">
            No hay permiso activo, así que nada se está guardando en este dispositivo.
          </p>
        )}
      </section>

      <section aria-labelledby="rectificar" className="space-y-2">
        <h2 id="rectificar" className="text-lg">
          Corregir (rectificación)
        </h2>
        <div className="tarjeta space-y-3 text-sm">
          <div>
            <label htmlFor="codigo" className="block font-semibold">
              Código de alumno
            </label>
            <input
              id="codigo"
              type="text"
              value={sesion?.escuela ?? ''}
              onChange={(evento) => actualizar({ escuela: evento.target.value || null })}
              placeholder="El que te dio tu escuela"
              className="toque mt-1 w-full rounded-xl2 border border-borde bg-superficie-2 px-3 py-3 text-base"
            />
            <p className="mt-1 text-xs text-texto-suave">
              Con esto te identificamos. No usamos tu nombre completo.
            </p>
          </div>
          <p className="text-xs text-texto-suave">
            Tu nombre de saludo, grado y estado se corrigen en{' '}
            <Link to="/perfil" className="text-marca underline">
              Mi perfil
            </Link>
            .
          </p>
        </div>
      </section>

      <section aria-labelledby="acceso" className="space-y-2">
        <h2 id="acceso" className="text-lg">
          Ver y descargar (acceso)
        </h2>
        <Boton
          variante="secundario"
          anchoCompleto
          onClick={async () => {
            descargar('mis-datos-nombreapp.json', await exportarMisDatos());
            setMensaje('Descargamos un archivo con todo lo que guardamos de ti.');
          }}
        >
          Descargar todos mis datos
        </Boton>
      </section>

      <section aria-labelledby="borrar" className="space-y-2">
        <h2 id="borrar" className="text-lg">
          Borrar (cancelación)
        </h2>
        <div className="tarjeta space-y-3 text-sm">
          <p className="text-texto-suave">
            Se borra de verdad: tus respuestas, tu mapa, tus carreras guardadas y tus mediciones. No queda una
            copia marcada como inactiva. Esto no se puede deshacer.
          </p>
          {confirmando ? (
            <div className="space-y-2">
              <p className="font-semibold">¿Seguro? Esto no se puede deshacer.</p>
              <Boton
                anchoCompleto
                onClick={async () => {
                  await borrarMisDatos();
                  reiniciar();
                  setConfirmando(false);
                  setMensaje('Listo: se borraron todos tus datos de este dispositivo.');
                }}
              >
                Sí, borrar todo
              </Boton>
              <Boton variante="secundario" anchoCompleto onClick={() => setConfirmando(false)}>
                Mejor no
              </Boton>
            </div>
          ) : (
            <Boton variante="secundario" anchoCompleto onClick={() => setConfirmando(true)}>
              Borrar todos mis datos
            </Boton>
          )}
          <Boton
            variante="texto"
            onClick={async () => {
              await revocarConsentimiento();
              reiniciar();
              setConsentimiento(await leerConsentimiento());
              setMensaje('Retiramos el permiso y borramos lo guardado.');
            }}
          >
            Retirar el permiso y borrar todo
          </Boton>
        </div>
      </section>

      <section aria-labelledby="bitacora" className="space-y-2">
        <h2 id="bitacora" className="text-lg">
          Quién ha visto tus datos
        </h2>
        {accesos.length === 0 ? (
          <p className="tarjeta text-sm text-texto-suave">Todavía no hay movimientos registrados.</p>
        ) : (
          <ul className="tarjeta space-y-1 text-xs text-texto-suave">
            {accesos.map((acceso) => (
              <li key={`${acceso.fecha}-${acceso.recurso}`}>
                {new Date(acceso.fecha).toLocaleString('es-MX')} · {acceso.rol} · {acceso.operacion} ·{' '}
                {acceso.recurso}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p role="status" aria-live="polite" className="text-sm text-exito">
        {mensaje}
      </p>

      <Link to="/privacidad" className="block text-sm text-marca underline">
        Leer el aviso de privacidad completo
      </Link>
    </div>
  );
}
