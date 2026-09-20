import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SelectorTema } from '@/components/SelectorTema';
import { usarSesion } from '@/features/sesion/usarSesion';
import { cargarCarreras } from '@/lib/carreras';
import { almacenaEnDispositivo } from '@/lib/storage';
import { ETIQUETA_NIVEL, type Carrera } from '@/data/tipos';

const ESTADOS = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua',
  'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México', 'Guanajuato', 'Guerrero',
  'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla',
  'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas',
  'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
];

export default function Perfil() {
  const { sesion, actualizar } = usarSesion();
  const [guardadas, setGuardadas] = useState<Carrera[]>([]);

  useEffect(() => {
    let vigente = true;
    if (!sesion?.favoritas.length) {
      setGuardadas([]);
      return;
    }
    cargarCarreras()
      .then((carreras) => {
        if (vigente) setGuardadas(carreras.filter((c) => sesion.favoritas.includes(c.id)));
      })
      .catch(() => vigente && setGuardadas([]));
    return () => {
      vigente = false;
    };
  }, [sesion?.favoritas]);

  return (
    <div className="contenedor-app space-y-5">
      <h1 className="text-2xl">Mi perfil</h1>

      <section aria-labelledby="mis-carreras" className="space-y-2">
        <h2 id="mis-carreras" className="text-lg">
          Mis carreras
        </h2>
        {guardadas.length === 0 ? (
          <p className="tarjeta text-sm text-texto-suave">
            Todavía no guardas ninguna.{' '}
            <Link to="/explorar" className="text-marca underline">
              Explora carreras
            </Link>{' '}
            y guarda las que te llamen con la estrella.
          </p>
        ) : (
          <ul className="space-y-2">
            {guardadas.map((carrera) => (
              <li key={carrera.id}>
                <Link to={`/carrera/${carrera.id}`} className="tarjeta block">
                  <span className="font-semibold">{carrera.nombre}</span>
                  <span className="mt-1 block text-sm text-texto-suave">{ETIQUETA_NIVEL[carrera.nivel]}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="tarjeta space-y-2">
        <label htmlFor="nombre" className="block text-sm font-semibold">
          ¿Cómo te llamamos?
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          autoComplete="given-name"
          enterKeyHint="done"
          value={sesion?.nombre ?? ''}
          onChange={(evento) => actualizar({ nombre: evento.target.value || null })}
          placeholder="Tu nombre o apodo"
          className="toque w-full rounded-xl2 border border-borde bg-superficie-2 px-4 py-3 text-base text-texto placeholder:text-texto-suave"
        />
        <p className="text-xs text-texto-suave">Es opcional. Solo se usa para saludarte.</p>
      </div>

      <div className="tarjeta space-y-3">
        <div>
          <label htmlFor="estado" className="block text-sm font-semibold">
            ¿En qué estado vives?
          </label>
          <select
            id="estado"
            value={sesion?.estado ?? ''}
            onChange={(evento) => actualizar({ estado: evento.target.value || null })}
            className="toque mt-1 w-full rounded-xl2 border border-borde bg-superficie-2 px-4 py-3 text-base"
          >
            <option value="">Prefiero no decir</option>
            {ESTADOS.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-texto-suave">
            Sirve para mostrarte primero las escuelas que te quedan cerca.
          </p>
        </div>

        <div>
          <label htmlFor="grado" className="block text-sm font-semibold">
            ¿En qué grado vas?
          </label>
          <select
            id="grado"
            value={sesion?.grado ?? ''}
            onChange={(evento) =>
              actualizar({ grado: evento.target.value ? (Number(evento.target.value) as 1 | 2 | 3) : null })
            }
            className="toque mt-1 w-full rounded-xl2 border border-borde bg-superficie-2 px-4 py-3 text-base"
          >
            <option value="">Sin decir</option>
            <option value="1">1° de prepa</option>
            <option value="2">2° de prepa</option>
            <option value="3">3° de prepa</option>
          </select>
          <p className="mt-1 text-xs text-texto-suave">
            Se guarda con tu mapa para que puedas comparar cómo cambias de primero a tercero.
          </p>
        </div>
      </div>

      <SelectorTema />

      <nav aria-label="Privacidad y avance" className="tarjeta space-y-2 text-sm">
        <Link to="/impacto" className="block text-marca underline">Mi avance (mediciones)</Link>
        <Link to="/mis-datos" className="block text-marca underline">Mis datos: ver, corregir o borrar</Link>
        <Link to="/privacidad" className="block text-marca underline">Aviso de privacidad</Link>
        <Link to="/panel" className="block text-texto-suave underline">Panel de la escuela (orientación y dirección)</Link>
      </nav>

      {!almacenaEnDispositivo && (
        <p className="tarjeta text-sm text-texto-suave">
          Tu navegador no está guardando datos, así que la app va a olvidar tus respuestas al cerrarla.
        </p>
      )}
    </div>
  );
}
