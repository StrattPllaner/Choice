import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Boton } from '@/components/Boton';
import { ETIQUETA_FORMA, otorgarConsentimiento, type FormaConsentimiento } from '@/lib/privacidad';

/** Flujo de consentimiento. Mientras no se complete, la app funciona pero NO guarda nada:
 *  la puerta está en la capa de almacenamiento (AlmacenConConsentimiento), no aquí. */
export function Consentimiento({ onListo }: { onListo: () => void }) {
  const [paso, setPaso] = useState<'edad' | 'tutor' | 'adulto'>('edad');
  const [nombreTutor, setNombreTutor] = useState('');
  const [parentesco, setParentesco] = useState('Madre, padre o tutor');
  const [forma, setForma] = useState<FormaConsentimiento>('app_con_tutor_presente');
  const [leido, setLeido] = useState(false);

  const confirmar = async (mayorDeEdad: boolean) => {
    await otorgarConsentimiento({
      forma: mayorDeEdad ? 'app_con_tutor_presente' : forma,
      nombreTutor: mayorDeEdad ? 'El propio alumno (mayor de edad)' : nombreTutor.trim(),
      parentesco: mayorDeEdad ? 'Titular' : parentesco,
      mayorDeEdad,
    });
    onListo();
  };

  if (paso === 'edad') {
    return (
      <div className="contenedor-app space-y-4">
        <h1 className="text-2xl">Antes de guardar nada</h1>
        <p className="text-texto-suave">
          Puedes usar la app y ver todas las carreras sin dar ningún dato. Para que se guarden tus
          respuestas necesitamos un permiso, porque la mayoría de quienes la usan son menores de edad.
        </p>
        <p className="tarjeta text-sm">
          Mientras no haya permiso, la app funciona igual pero olvida todo al cerrarla.
        </p>
        <div className="space-y-2">
          <Boton anchoCompleto onClick={() => setPaso('tutor')}>
            Tengo menos de 18 años
          </Boton>
          <Boton variante="secundario" anchoCompleto onClick={() => setPaso('adulto')}>
            Tengo 18 o más
          </Boton>
        </div>
        <p className="text-xs text-texto-suave">
          Lee primero el{' '}
          <Link to="/privacidad" className="text-marca underline">
            aviso de privacidad
          </Link>
          : dice qué guardamos, para qué y cómo borrarlo.
        </p>
      </div>
    );
  }

  if (paso === 'adulto') {
    return (
      <div className="contenedor-app space-y-4">
        <h1 className="text-2xl">Tu permiso</h1>
        <p className="text-texto-suave">
          Como eres mayor de edad, tú autorizas. Guardamos tus respuestas del mapa, las carreras que
          guardes y tus mediciones de avance, en este dispositivo y —si tu escuela tiene licencia— en la
          cuenta ligada a tu código de alumno. Nunca pedimos tu nombre completo, CURP, dirección ni
          teléfono.
        </p>
        <label className="tarjeta flex items-start gap-3 text-sm">
          <input type="checkbox" checked={leido} onChange={(e) => setLeido(e.target.checked)} className="mt-1 h-5 w-5" />
          <span>
            Leí el{' '}
            <Link to="/privacidad" className="text-marca underline">
              aviso de privacidad
            </Link>{' '}
            y autorizo que se guarden mis datos como ahí se explica.
          </span>
        </label>
        <Boton anchoCompleto disabled={!leido} onClick={() => confirmar(true)}>
          Autorizo
        </Boton>
      </div>
    );
  }

  return (
    <div className="contenedor-app space-y-4">
      <h1 className="text-2xl">Permiso de tu papá, mamá o tutor</h1>
      <p className="text-texto-suave">
        Pásale el celular a quien te cuida para que lea esto y lo autorice. Si prefieren hacerlo en papel,
        la escuela tiene el formato.
      </p>

      <div className="tarjeta space-y-2 text-sm">
        <p className="font-semibold">Qué se guarda de este alumno</p>
        <ul className="list-disc space-y-1 pl-5 text-texto-suave">
          <li>Sus respuestas del mapa de exploración y las carreras que guarde.</li>
          <li>Sus mediciones de avance (cuántas carreras conoce, qué tan seguro se siente).</li>
          <li>Su código de alumno, el que le asigna la escuela. No su nombre completo, ni CURP, ni dirección, ni teléfono, ni correo personal.</li>
        </ul>
        <p className="font-semibold">Quién lo ve</p>
        <p className="text-texto-suave">
          La escuela solo ve resultados del grupo completo, y solo si hay 10 o más respuestas. Nadie de la
          escuela puede ver lo que contestó un alumno en particular.
        </p>
        <p className="font-semibold">Se puede deshacer</p>
        <p className="text-texto-suave">
          En cualquier momento, desde la app, se pueden consultar, corregir o borrar todos los datos. El
          borrado es real.
        </p>
      </div>

      <div>
        <label htmlFor="nombre-tutor" className="block text-sm font-semibold">
          Nombre de quien autoriza
        </label>
        <input
          id="nombre-tutor"
          type="text"
          value={nombreTutor}
          onChange={(e) => setNombreTutor(e.target.value)}
          placeholder="Nombre de la madre, padre o tutor"
          className="toque mt-1 w-full rounded-xl2 border border-borde bg-superficie-2 px-3 py-3 text-base"
        />
        <p className="mt-1 text-xs text-texto-suave">
          Es lo único que pedimos, y solo para poder acreditar que hubo permiso.
        </p>
      </div>

      <div>
        <label htmlFor="parentesco" className="block text-sm font-semibold">
          Parentesco
        </label>
        <input
          id="parentesco"
          type="text"
          value={parentesco}
          onChange={(e) => setParentesco(e.target.value)}
          className="toque mt-1 w-full rounded-xl2 border border-borde bg-superficie-2 px-3 py-3 text-base"
        />
      </div>

      <div>
        <label htmlFor="forma" className="block text-sm font-semibold">
          ¿Cómo se está dando el permiso?
        </label>
        <select
          id="forma"
          value={forma}
          onChange={(e) => setForma(e.target.value as FormaConsentimiento)}
          className="toque mt-1 w-full rounded-xl2 border border-borde bg-superficie-2 px-3 py-3 text-base"
        >
          {(Object.keys(ETIQUETA_FORMA) as FormaConsentimiento[]).map((valor) => (
            <option key={valor} value={valor}>
              {ETIQUETA_FORMA[valor]}
            </option>
          ))}
        </select>
      </div>

      <label className="tarjeta flex items-start gap-3 text-sm">
        <input type="checkbox" checked={leido} onChange={(e) => setLeido(e.target.checked)} className="mt-1 h-5 w-5" />
        <span>
          Leí el{' '}
          <Link to="/privacidad" className="text-marca underline">
            aviso de privacidad
          </Link>{' '}
          y autorizo el tratamiento de los datos de este alumno como ahí se explica.
        </span>
      </label>

      <Boton anchoCompleto disabled={!leido || nombreTutor.trim().length < 3} onClick={() => confirmar(false)}>
        Autorizo
      </Boton>
      <p className="text-xs text-texto-suave">
        Se guarda la fecha y la forma del permiso. Se puede retirar cuando quieran, desde Mis datos.
      </p>
    </div>
  );
}
