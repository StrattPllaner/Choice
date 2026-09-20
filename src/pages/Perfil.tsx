import { SelectorTema } from '@/components/SelectorTema';
import { usarSesion } from '@/features/sesion/usarSesion';
import { almacenaEnDispositivo } from '@/lib/storage';

export default function Perfil() {
  const { sesion, actualizar } = usarSesion();

  return (
    <div className="contenedor-app space-y-5">
      <h1 className="text-2xl">Mi perfil</h1>

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

      <SelectorTema />

      {!almacenaEnDispositivo && (
        <p className="tarjeta text-sm text-texto-suave">
          Tu navegador no está guardando datos, así que la app va a olvidar tus respuestas al cerrarla.
        </p>
      )}
    </div>
  );
}
