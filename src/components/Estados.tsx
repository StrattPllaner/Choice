import type { ReactNode } from 'react';
import { Boton, BotonEnlace } from './Boton';
import {
  IlustracionBusqueda,
  IlustracionComparar,
  IlustracionGuardadas,
  IlustracionMapa,
  IlustracionNoEncontrado,
  IlustracionSinConexion,
} from './Ilustraciones';

/** Estados vacíos y de error.
 *
 *  Cada pantalla trae su propio texto: un "no hay datos" genérico no le dice a nadie
 *  qué hacer. El tono nunca culpa ("no has hecho nada"), describe ("aquí van a aparecer").
 */

function Contenedor({
  ilustracion,
  titulo,
  mensaje,
  children,
}: {
  ilustracion: ReactNode;
  titulo: string;
  mensaje: string;
  children?: ReactNode;
}) {
  return (
    <div className="entra flex flex-col items-center gap-4 px-4 py-10 text-center">
      <span aria-hidden="true">{ilustracion}</span>
      <div className="space-y-1">
        <h2 className="text-md">{titulo}</h2>
        <p className="mx-auto max-w-[32ch] text-base text-tinta-suave">{mensaje}</p>
      </div>
      {children}
    </div>
  );
}

/* ── Vacíos, uno por pantalla ─────────────────────────────────────────── */

export const VacioGuardadas = () => (
  <Contenedor
    ilustracion={<IlustracionGuardadas />}
    titulo="Aquí van a aparecer tus carreras"
    mensaje="Cuando encuentres una que te lata, tócale la estrella y se queda guardada para volver."
  >
    <BotonEnlace a="/explorar" tamano="medio">
      Ver carreras
    </BotonEnlace>
  </Contenedor>
);

export const VacioBusqueda = ({ consulta, onLimpiar }: { consulta: string; onLimpiar: () => void }) => (
  <Contenedor
    ilustracion={<IlustracionBusqueda />}
    titulo="No encontramos nada con eso"
    mensaje={`Nada coincide con "${consulta}". Prueba con menos palabras o quita algún filtro.`}
  >
    <Boton variante="secundario" onClick={onLimpiar}>
      Quitar la búsqueda
    </Boton>
  </Contenedor>
);

export const VacioMapa = () => (
  <Contenedor
    ilustracion={<IlustracionMapa />}
    titulo="Todavía no armas tu mapa"
    mensaje="Son 22 preguntas cortas. Al terminar vas a ver por dónde te conviene empezar a explorar."
  >
    <BotonEnlace a="/mapa">Armar mi mapa</BotonEnlace>
  </Contenedor>
);

export const VacioComparador = () => (
  <Contenedor
    ilustracion={<IlustracionComparar />}
    titulo="Elige dos carreras para compararlas"
    mensaje="Se ven lado a lado en lo mismo: duración, costo, sueldo y qué tan peleado está el trabajo."
  >
    <BotonEnlace a="/explorar" variante="secundario">
      Buscar carreras
    </BotonEnlace>
  </Contenedor>
);

export const VacioMediciones = ({ onEmpezar }: { onEmpezar: () => void }) => (
  <Contenedor
    ilustracion={<IlustracionMapa />}
    titulo="Aquí vas a ver cómo cambias"
    mensaje="Contesta la primera medición hoy y repítela más adelante para comparar."
  >
    <Boton onClick={onEmpezar}>Contestar la primera</Boton>
  </Contenedor>
);

/* ── Errores ──────────────────────────────────────────────────────────── */

export type TipoError = 'conexion' | 'servidor' | 'no-encontrado';

const ERRORES: Record<TipoError, { titulo: string; mensaje: string; ilustracion: ReactNode }> = {
  conexion: {
    titulo: 'No hay internet',
    mensaje: 'Lo que ya habías abierto sigue disponible. Esto se carga solo cuando vuelva la señal.',
    ilustracion: <IlustracionSinConexion />,
  },
  servidor: {
    titulo: 'Algo se atoró de nuestro lado',
    mensaje: 'No es tu conexión ni tu celular. Vuelve a intentar en un momento.',
    ilustracion: <IlustracionSinConexion />,
  },
  'no-encontrado': {
    titulo: 'No encontramos esto',
    mensaje: 'Puede que el enlace esté mal escrito o que la ficha haya cambiado de nombre.',
    ilustracion: <IlustracionNoEncontrado />,
  },
};

export function EstadoError({
  tipo,
  onReintentar,
  accionAlterna,
}: {
  tipo: TipoError;
  onReintentar?: () => void;
  accionAlterna?: ReactNode;
}) {
  const { titulo, mensaje, ilustracion } = ERRORES[tipo];
  return (
    <div role="alert">
      <Contenedor ilustracion={ilustracion} titulo={titulo} mensaje={mensaje}>
        <div className="flex flex-wrap justify-center gap-2">
          {onReintentar && <Boton onClick={onReintentar}>Reintentar</Boton>}
          {accionAlterna}
        </div>
      </Contenedor>
    </div>
  );
}

/** Traduce un fallo cualquiera a uno de los tres tipos, sin enseñar códigos. */
export function tipoDeError(fallo: unknown): TipoError {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return 'conexion';
  const mensaje = fallo instanceof Error ? fallo.message : String(fallo ?? '');
  if (/404|no encontr|not found/i.test(mensaje)) return 'no-encontrado';
  if (/fetch|network|red|conexi/i.test(mensaje)) return 'conexion';
  return 'servidor';
}
