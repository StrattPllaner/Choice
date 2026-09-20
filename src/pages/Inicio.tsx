import { BotonEnlace } from '@/components/Boton';
import { usarSesion } from '@/features/sesion/usarSesion';

/** Pantalla de entrada: sin datos que cargar, para que el primer pintado no dependa de la red. */
export default function Inicio() {
  const { sesion } = usarSesion();
  const nombre = sesion?.nombre;

  return (
    <div className="contenedor-app space-y-6">
      <section aria-labelledby="titulo-inicio" className="space-y-3">
        <p className="text-sm font-medium text-marca">
          {nombre ? `Qué onda, ${nombre}` : 'Bienvenida o bienvenido'}
        </p>
        <h1 id="titulo-inicio" className="text-2xl">
          ¿Qué vas a estudiar cuando salgas de la prepa?
        </h1>
        <p className="text-texto-suave">
          Aquí puedes ver a qué se dedica cada carrera, qué se estudia y qué dicen los datos. Sin palabras
          raras y sin necesitar internet.
        </p>
      </section>

      <div className="space-y-3">
        <BotonEnlace a="/mapa" anchoCompleto>
          Armar mi mapa
        </BotonEnlace>
        <BotonEnlace a="/explorar" variante="secundario" anchoCompleto>
          Ver carreras
        </BotonEnlace>
      </div>

      <section aria-labelledby="titulo-ayuda" className="tarjeta">
        <h2 id="titulo-ayuda" className="text-base">
          Tus respuestas se quedan en este celular
        </h2>
        <p className="mt-1 text-sm text-texto-suave">
          No pedimos correo ni contraseña. Nadie de tu escuela ve lo que contestas.
        </p>
      </section>
    </div>
  );
}
