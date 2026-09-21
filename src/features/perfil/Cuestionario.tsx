import { useEffect, useRef, useState } from 'react';
import { AvisoGuia } from '@/components/AvisoGuia';
import { BarraProgreso } from '@/components/BarraProgreso';
import { Boton } from '@/components/Boton';
import { guardarBorrador, type Borrador } from '@/lib/perfil';
import { ETIQUETA_BLOQUE, INTRO_BLOQUE, OPCIONES, REACTIVOS, TOTAL_REACTIVOS, type Respuesta } from './reactivos';
import type { Respuestas } from './puntuacion';

interface Props {
  borrador: Borrador | null;
  onTerminar: (respuestas: Respuestas) => void;
  onSalir: () => void;
}

/** Una pregunta por pantalla: menos scroll, tap grande y avance inmediato.
 *  Cada respuesta guarda borrador, así que cerrar la app nunca pierde el avance. */
export function Cuestionario({ borrador, onTerminar, onSalir }: Props) {
  const [respuestas, setRespuestas] = useState<Respuestas>(borrador?.respuestas ?? {});
  const [indice, setIndice] = useState(Math.min(borrador?.indice ?? 0, TOTAL_REACTIVOS - 1));
  const tituloRef = useRef<HTMLHeadingElement>(null);

  const reactivo = REACTIVOS[indice]!;
  const esUltimo = indice === TOTAL_REACTIVOS - 1;
  const primeroDelBloque = indice === 0 || REACTIVOS[indice - 1]!.bloque !== reactivo.bloque;

  // al cambiar de pregunta el foco vuelve al título: el lector de pantalla lee la nueva
  useEffect(() => {
    tituloRef.current?.focus();
  }, [indice]);

  const responder = (valor: Respuesta) => {
    const siguientes = { ...respuestas, [reactivo.id]: valor };
    setRespuestas(siguientes);
    const siguienteIndice = Math.min(indice + 1, TOTAL_REACTIVOS - 1);
    void guardarBorrador(siguientes, esUltimo ? indice : siguienteIndice);
    if (esUltimo) onTerminar(siguientes);
    else setIndice(siguienteIndice);
  };

  return (
    <div className="contenedor-app space-y-5">
      <AvisoGuia compacto />
      <BarraProgreso actual={indice + 1} total={TOTAL_REACTIVOS} etiqueta="Avance del cuestionario" />

      {primeroDelBloque && (
        <div className="rounded-tarjeta bg-primario-suave p-3">
          <p className="text-chico font-semibold text-primario">{ETIQUETA_BLOQUE[reactivo.bloque]}</p>
          <p className="text-chico text-tinta-suave">{INTRO_BLOQUE[reactivo.bloque]}</p>
        </div>
      )}

      <h1 ref={tituloRef} tabIndex={-1} className="text-xl">
        {reactivo.texto}
      </h1>

      <fieldset>
        <legend className="sr-only">Elige qué tanto va contigo</legend>
        <div className="space-y-2">
          {OPCIONES.map((opcion) => {
            const elegida = respuestas[reactivo.id] === opcion.valor;
            return (
              <button
                key={opcion.valor}
                type="button"
                aria-pressed={elegida}
                onClick={() => responder(opcion.valor)}
                className={[
                  'toque ondulado w-full justify-between rounded-chico border px-5 py-4 text-left text-base',
                  elegida ? 'border-primario bg-primario-suave text-primario' : 'border-borde bg-superficie text-tinta',
                ].join(' ')}
              >
                <span>{opcion.etiqueta}</span>
                {elegida && <span aria-hidden="true">✓</span>}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex gap-2">
        <Boton variante="secundario" onClick={() => setIndice((i) => Math.max(0, i - 1))} disabled={indice === 0}>
          Atrás
        </Boton>
        <Boton variante="fantasma" onClick={onSalir}>
          Pausar y seguir después
        </Boton>
      </div>

      <p className="text-micro text-tinta-suave">
        Se va guardando solo. Puedes cerrar la app y retomar donde te quedaste.
      </p>
    </div>
  );
}
