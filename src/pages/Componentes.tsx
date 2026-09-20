import { useState } from 'react';
import { Acordeon } from '@/components/Acordeon';
import { usarAvisos } from '@/components/Avisos';
import { BarraProgreso } from '@/components/BarraProgreso';
import { Boton, type TamanoBoton, type VarianteBoton } from '@/components/Boton';
import { Campo, CampoLargo, Selector } from '@/components/Campo';
import { Celebracion } from '@/components/Celebracion';
import { Chip } from '@/components/Chip';
import { HojaInferior, Modal } from '@/components/Dialogos';
import { Insignia } from '@/components/Insignia';
import { Pestanas } from '@/components/Pestanas';
import { Tarjeta, TarjetaEnlace } from '@/components/Tarjeta';

/** Catálogo de componentes con todos sus estados, para revisarlos sin navegar la app. */

const VARIANTES: VarianteBoton[] = ['primario', 'secundario', 'fantasma', 'destructivo'];
const TAMANOS: TamanoBoton[] = ['chico', 'medio', 'grande'];

function Seccion({ titulo, nota, children }: { titulo: string; nota?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg">{titulo}</h2>
        {nota && <p className="text-chico text-tinta-suave">{nota}</p>}
      </div>
      {children}
    </section>
  );
}

export default function Componentes() {
  const { mostrar } = usarAvisos();
  const [cargando, setCargando] = useState(false);
  const [chips, setChips] = useState<string[]>(['salud']);
  const [texto, setTexto] = useState('');
  const [conError, setConError] = useState('');
  const [largo, setLargo] = useState('');
  const [seleccion, setSeleccion] = useState('publica');
  const [hoja, setHoja] = useState(false);
  const [modal, setModal] = useState(false);
  const [progreso, setProgreso] = useState(7);

  const alternarChip = (id: string) =>
    setChips((previos) => (previos.includes(id) ? previos.filter((c) => c !== id) : [...previos, id]));

  return (
    <div className="contenedor-app space-y-10 pb-10">
      <header className="space-y-2">
        <h1 className="text-xl">Componentes</h1>
        <p className="text-tinta-suave">
          Cada uno con sus estados: reposo, hover, foco, presionado, cargando, deshabilitado y error.
          Prueba con el tabulador: el foco siempre se ve.
        </p>
      </header>

      <Seccion
        titulo="Botón"
        nota="Al presionar: scale(0.97) en 120ms con la curva de salida y regreso en 180ms con la de entrada. En escritorio, hover levanta 1px."
      >
        {VARIANTES.map((variante) => (
          <div key={variante} className="space-y-2">
            <h3 className="text-chico font-medium text-tinta-suave">{variante}</h3>
            <div className="flex flex-wrap items-center gap-2">
              {TAMANOS.map((tamano) => (
                <Boton key={tamano} variante={variante} tamano={tamano}>
                  {tamano}
                </Boton>
              ))}
              <Boton variante={variante} disabled>
                deshabilitado
              </Boton>
            </div>
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-2">
          <Boton
            cargando={cargando}
            onClick={() => {
              setCargando(true);
              window.setTimeout(() => setCargando(false), 1800);
            }}
          >
            Guardar cambios
          </Boton>
          <span className="text-micro text-tinta-suave">
            El texto se queda y el ancho no cambia: la pantalla no salta bajo el dedo.
          </span>
        </div>
      </Seccion>

      <Seccion titulo="Tarjeta" nota="Al pasar el cursor: sube 2px y pasa a la sombra siguiente, en 180ms.">
        <Tarjeta>
          <p className="font-medium">Tarjeta en reposo</p>
          <p className="text-chico text-tinta-suave">Sombra 1, radio de tarjeta.</p>
        </Tarjeta>
        <TarjetaEnlace a="/componentes">
          <p className="font-medium">Tarjeta interactiva</p>
          <p className="text-chico text-tinta-suave">Se eleva al pasar el cursor.</p>
        </TarjetaEnlace>
      </Seccion>

      <Seccion titulo="Chip de filtro" nota="Al seleccionar, un rebote de scale(1.03) que regresa: confirma el toque.">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'salud', etiqueta: 'Salud', cuenta: 6 },
            { id: 'tecnica', etiqueta: 'Carrera técnica', cuenta: 4 },
            { id: 'tsu', etiqueta: 'TSU', cuenta: 3 },
            { id: 'bloqueado', etiqueta: 'Deshabilitado' },
          ].map((chip) => (
            <Chip
              key={chip.id}
              etiqueta={chip.etiqueta}
              cuenta={chip.cuenta}
              seleccionado={chips.includes(chip.id)}
              deshabilitado={chip.id === 'bloqueado'}
              onCambio={() => alternarChip(chip.id)}
            />
          ))}
        </div>
      </Seccion>

      <Seccion titulo="Campos" nota="Etiqueta flotante que se mueve con transform. El error va debajo, con role alert.">
        <Campo etiqueta="Tu nombre o apodo" valor={texto} onCambio={setTexto} ayuda="Es opcional." />
        <Campo
          etiqueta="Código de alumno"
          valor={conError}
          onCambio={setConError}
          error="Ese código no es de esta escuela. Revísalo con tu orientadora."
        />
        <Campo etiqueta="Deshabilitado" valor="" onCambio={() => {}} disabled />
        <CampoLargo etiqueta="¿Qué carreras puedes nombrar?" valor={largo} onCambio={setLargo} ayuda="Una por renglón." />
        <Selector
          etiqueta="Tipo de escuela"
          valor={seleccion}
          onCambio={setSeleccion}
          opciones={[
            { valor: 'publica', etiqueta: 'Pública' },
            { valor: 'privada', etiqueta: 'Privada' },
          ]}
        />
      </Seccion>

      <Seccion titulo="Barra de progreso" nota="El relleno se escala con transform, no con width.">
        <BarraProgreso actual={progreso} total={22} etiqueta="Avance del cuestionario" />
        <div className="flex gap-2">
          <Boton tamano="chico" variante="secundario" onClick={() => setProgreso((n) => Math.max(0, n - 3))}>
            Menos
          </Boton>
          <Boton tamano="chico" variante="secundario" onClick={() => setProgreso((n) => Math.min(22, n + 3))}>
            Más
          </Boton>
        </div>
      </Seccion>

      <Seccion titulo="Pestañas" nota="Flechas, Home y End para moverse. Solo la activa es tabulable.">
        <Pestanas
          pestanas={[
            { id: 'que', etiqueta: 'Qué estudias', contenido: <p>Materias por semestre, con las difíciles marcadas.</p> },
            { id: 'cuanto', etiqueta: 'Cuánto se gana', contenido: <p>Mediana al entrar y a cinco años, con su fuente.</p> },
            { id: 'donde', etiqueta: 'Dónde', contenido: <p>Escuelas cerca de ti y cuánto cuesta.</p> },
          ]}
        />
      </Seccion>

      <Seccion titulo="Hoja inferior y modal" nota="Atrapan el foco y lo devuelven al cerrar. Escape cierra.">
        <div className="flex gap-2">
          <Boton variante="secundario" onClick={() => setHoja(true)}>
            Abrir hoja
          </Boton>
          <Boton variante="secundario" onClick={() => setModal(true)}>
            Abrir modal
          </Boton>
        </div>
        <HojaInferior
          abierto={hoja}
          titulo="Filtrar carreras"
          descripcion="Elige lo que te importa y aplícalo."
          onCerrar={() => setHoja(false)}
          pie={
            <>
              <Boton variante="secundario" anchoCompleto onClick={() => setHoja(false)}>
                Cancelar
              </Boton>
              <Boton anchoCompleto onClick={() => setHoja(false)}>
                Aplicar
              </Boton>
            </>
          }
        >
          <div className="flex flex-wrap gap-2">
            <Chip etiqueta="Duran 2 años o menos" seleccionado onCambio={() => {}} />
            <Chip etiqueta="Con beca" seleccionado={false} onCambio={() => {}} />
          </div>
        </HojaInferior>
        <Modal
          abierto={modal}
          titulo="¿Borrar todos tus datos?"
          descripcion="Esto no se puede deshacer."
          onCerrar={() => setModal(false)}
          pie={
            <>
              <Boton variante="fantasma" onClick={() => setModal(false)}>
                Mejor no
              </Boton>
              <Boton variante="destructivo" onClick={() => setModal(false)}>
                Sí, borrar
              </Boton>
            </>
          }
        >
          <p className="text-chico text-tinta-suave">
            Se borran tus respuestas, tu mapa y tus carreras guardadas.
          </p>
        </Modal>
      </Seccion>

      <Seccion titulo="Aviso emergente" nota="Confirmación inmediata, con opción de deshacer.">
        <div className="flex flex-wrap gap-2">
          <Boton variante="secundario" onClick={() => mostrar({ texto: 'Guardada en tus carreras', tono: 'exito' })}>
            Éxito
          </Boton>
          <Boton variante="secundario" onClick={() => mostrar({ texto: 'No se pudo guardar. Lo intentamos de nuevo solo.', tono: 'error' })}>
            Error
          </Boton>
          <Boton
            variante="secundario"
            onClick={() =>
              mostrar({
                texto: 'La quitamos de tus carreras',
                tono: 'neutro',
                accion: { etiqueta: 'Deshacer', alActivar: () => mostrar({ texto: 'Listo, la regresamos', tono: 'exito' }) },
              })
            }
          >
            Con deshacer
          </Boton>
        </div>
      </Seccion>

      <Seccion titulo="Acordeón">
        <div className="tarjeta py-0">
          <Acordeon titulo="¿Qué es un TSU?" abiertoInicial>
            Son dos años, muy prácticos, y sales con un título que ya se cobra. Puedes seguir a ingeniería después.
          </Acordeon>
          <Acordeon titulo="¿Y si me equivoco de carrera?">
            Pasa seguido y se puede corregir. Por eso conviene ver de cerca a qué se dedica la gente antes de entrar.
          </Acordeon>
        </div>
      </Seccion>

      <Seccion titulo="Insignia">
        <div className="flex flex-wrap gap-2">
          <Insignia>Neutro</Insignia>
          <Insignia tono="primario">Área sugerida</Insignia>
          <Insignia tono="exito">Con beca</Insignia>
          <Insignia tono="atencion">Materia filtro</Insignia>
          <Insignia tono="error">Dato faltante</Insignia>
          <Insignia tono="acento">Nuevo</Insignia>
        </div>
      </Seccion>

      <Seccion titulo="Celebración" nota="Solo CSS, una vez por sesión, discreta.">
        <Celebracion texto="Listo, ya tienes tu mapa" />
      </Seccion>
    </div>
  );
}
