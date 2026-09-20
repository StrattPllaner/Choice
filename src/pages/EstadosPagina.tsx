import { EsqueletoFicha, EsqueletoLista, EsqueletoMapa, EsqueletoPanel } from '@/components/Esqueleto';
import {
  EstadoError,
  VacioBusqueda,
  VacioComparador,
  VacioGuardadas,
  VacioMapa,
  VacioMediciones,
} from '@/components/Estados';

/** Todos los estados juntos: es la pantalla donde se nota si alguno quedó genérico. */

function Bloque({ titulo, nota, children }: { titulo: string; nota?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg">{titulo}</h2>
      {nota && <p className="text-chico text-tinta-suave">{nota}</p>}
      <div className="rounded-tarjeta border border-borde bg-fondo p-3">{children}</div>
    </section>
  );
}

export default function EstadosPagina() {
  return (
    <div className="contenedor-app space-y-8 pb-10">
      <header className="space-y-2">
        <h1 className="text-xl">Estados</h1>
        <p className="text-tinta-suave">
          Carga, vacío, error y sin conexión. Si algo aquí se siente frío o genérico, está mal escrito.
        </p>
      </header>

      <Bloque
        titulo="Cargando"
        nota="Tienen la forma del contenido real. Si la carga tarda menos de 200ms no se muestran, para que no parpadee."
      >
        <div className="rejilla-ancha">
          <EsqueletoLista filas={2} />
          <EsqueletoFicha />
          <EsqueletoMapa />
          <EsqueletoPanel />
        </div>
      </Bloque>

      <Bloque titulo="Vacíos" nota="Uno por pantalla, con su propia ilustración y una acción concreta.">
        <div className="rejilla-ancha">
          <VacioGuardadas />
          <VacioBusqueda consulta="ingeniera espacial" onLimpiar={() => {}} />
          <VacioMapa />
          <VacioComparador />
          <VacioMediciones onEmpezar={() => {}} />
        </div>
      </Bloque>

      <Bloque titulo="Errores" nota="Sin códigos técnicos y siempre con reintentar.">
        <div className="rejilla-ancha">
          <EstadoError tipo="conexion" onReintentar={() => {}} />
          <EstadoError tipo="servidor" onReintentar={() => {}} />
          <EstadoError tipo="no-encontrado" onReintentar={() => {}} />
        </div>
      </Bloque>

      <Bloque titulo="Sin conexión" nota="Barra discreta arriba; se va sola al volver la señal.">
        <p role="status" className="bg-atencion-suave px-4 py-2 text-center text-chico text-tinta">
          Sin internet. Puedes seguir leyendo las carreras y tus respuestas se guardan en el celular.
        </p>
      </Bloque>
    </div>
  );
}
