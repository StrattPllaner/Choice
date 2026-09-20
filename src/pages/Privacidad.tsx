import { MATRIZ_ACCESOS, VERSION_AVISO } from '@/lib/privacidad';

/** Aviso de privacidad integral, conforme a la LFPDPPP y su Reglamento.
 *  Escrito para que lo entienda un adolescente de 15 y también su mamá. Los datos de la
 *  razón social se llenan antes de publicar en producción. */
export default function Privacidad() {
  return (
    <div className="contenedor-app space-y-6 pb-6">
      <header className="space-y-2">
        <h1 className="text-xl">Aviso de privacidad</h1>
        <p className="text-chico text-tinta-suave">
          Versión {VERSION_AVISO} · última actualización: 20 de septiembre de 2026
        </p>
        <p className="text-tinta-suave">
          Aquí te decimos, sin rodeos, qué guardamos de ti, para qué, quién lo ve y cómo lo borras.
        </p>
      </header>

      <section aria-labelledby="responsable" className="tarjeta space-y-2 text-chico">
        <h2 id="responsable" className="text-base font-semibold">
          Quién es responsable de tus datos
        </h2>
        <p className="text-tinta-suave">
          [PENDIENTE antes de producción: razón social, domicilio fiscal y correo de contacto del
          responsable]. Este aviso se emite conforme a la Ley Federal de Protección de Datos Personales en
          Posesión de los Particulares, su Reglamento y los Lineamientos del Aviso de Privacidad.
        </p>
      </section>

      <section aria-labelledby="que-datos" className="space-y-2">
        <h2 id="que-datos" className="text-lg">
          Qué datos recabamos
        </h2>
        <ul className="tarjeta list-disc space-y-2 pl-5 text-chico text-tinta-suave">
          <li>
            <strong className="text-tinta">Tu código de alumno</strong>, el que te da tu escuela. Con eso te
            identificamos.
          </li>
          <li>
            <strong className="text-tinta">Tu grado y tu estado</strong>, si los quieres poner. Son opcionales.
          </li>
          <li>
            <strong className="text-tinta">Tus respuestas</strong> del mapa de exploración y de las mediciones
            de avance.
          </li>
          <li>
            <strong className="text-tinta">Las carreras que guardas y las que abres</strong> dentro de la app.
          </li>
          <li>
            <strong className="text-tinta">El nombre de quien te dio permiso</strong> (tu mamá, papá o tutor) y
            la fecha, solo para poder acreditar ese permiso.
          </li>
        </ul>
        <p className="tarjeta text-chico">
          <strong>Lo que NO te pedimos:</strong> nombre completo, CURP, dirección, teléfono, correo personal,
          fotos ni calificaciones. No los necesitamos, así que no los guardamos.
        </p>
      </section>

      <section aria-labelledby="para-que" className="space-y-2">
        <h2 id="para-que" className="text-lg">
          Para qué los usamos
        </h2>
        <div className="tarjeta space-y-2 text-chico text-tinta-suave">
          <p className="font-semibold text-tinta">Finalidades necesarias (sin esto la app no sirve)</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Guardar tu mapa y tus carreras para que sigan ahí cuando vuelvas.</li>
            <li>Mostrarte cómo cambiaron tus respuestas con el tiempo.</li>
            <li>
              Darle a tu escuela resultados <strong className="text-tinta">del grupo completo</strong>, nunca los
              tuyos por separado.
            </li>
          </ul>
          <p className="font-semibold text-tinta">Finalidades que puedes rechazar</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Usar datos agregados y anónimos para mejorar el contenido de las fichas.</li>
            <li>Usar datos agregados y anónimos en reportes del proyecto social.</li>
          </ul>
          <p>
            Puedes negarte a estas últimas desde <strong className="text-tinta">Mis datos</strong> sin perder
            nada de la app.
          </p>
        </div>
      </section>

      <section aria-labelledby="quien-ve" className="space-y-2">
        <h2 id="quien-ve" className="text-lg">
          Quién ve qué
        </h2>
        <div className="tarjeta space-y-3 text-chico">
          {(Object.keys(MATRIZ_ACCESOS) as (keyof typeof MATRIZ_ACCESOS)[])
            .filter((rol) => rol !== 'sistema')
            .map((rol) => (
              <div key={rol}>
                <p className="font-semibold capitalize">{rol === 'direccion' ? 'Dirección' : rol}</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-tinta-suave">
                  {MATRIZ_ACCESOS[rol].map((acceso) => (
                    <li key={acceso.recurso}>
                      {acceso.recurso} ({acceso.operaciones.join(', ')}). {acceso.detalle}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          <p className="text-tinta-suave">
            Regla que está en el código, no solo aquí: si un grupo tiene menos de 10 respuestas, la escuela
            no ve ningún número de ese grupo, porque con tan pocos se podría adivinar quién contestó qué.
          </p>
        </div>
      </section>

      <section aria-labelledby="donde" className="space-y-2">
        <h2 id="donde" className="text-lg">
          Dónde se guardan y por cuánto tiempo
        </h2>
        <ul className="tarjeta list-disc space-y-1 pl-5 text-chico text-tinta-suave">
          <li>En tu propio celular o computadora, para que la app funcione sin internet.</li>
          <li>
            Si tu escuela tiene licencia, también en nuestra base de datos en la nube (Supabase), con acceso
            restringido por reglas a nivel de renglón.
          </li>
          <li>Se conservan mientras dure la licencia de tu escuela y hasta 12 meses después.</li>
          <li>Si pides que se borren, se borran de inmediato y de verdad. No queda una copia marcada como "inactiva".</li>
        </ul>
      </section>

      <section aria-labelledby="arco" className="space-y-2">
        <h2 id="arco" className="text-lg">
          Tus derechos (ARCO)
        </h2>
        <div className="tarjeta space-y-2 text-chico text-tinta-suave">
          <p>
            Tienes derecho a <strong className="text-tinta">acceder</strong> a tus datos,{' '}
            <strong className="text-tinta">rectificarlos</strong> si están mal,{' '}
            <strong className="text-tinta">cancelarlos</strong> (que se borren) y{' '}
            <strong className="text-tinta">oponerte</strong> a ciertos usos. También puedes retirar el permiso
            cuando quieras.
          </p>
          <p>
            No tienes que mandar un correo ni esperar: está todo en la pantalla{' '}
            <strong className="text-tinta">Mis datos</strong>, dentro de la app. Ahí puedes ver todo lo que
            guardamos, descargarlo, corregirlo o borrarlo.
          </p>
          <p>
            Si prefieres hacerlo por escrito, escribe a [PENDIENTE: correo del responsable]. Contestamos en un
            máximo de 20 días hábiles, como marca la ley.
          </p>
        </div>
      </section>

      <section aria-labelledby="cambios" className="space-y-2">
        <h2 id="cambios" className="text-lg">
          Cambios a este aviso
        </h2>
        <p className="tarjeta text-chico text-tinta-suave">
          Si cambiamos algo importante, te lo avisamos dentro de la app antes de que siga guardándose
          información, y te volvemos a pedir permiso. Cada consentimiento queda registrado con la versión del
          aviso que se te mostró (esta es la {VERSION_AVISO}).
        </p>
      </section>
    </div>
  );
}
