import { useState } from 'react';
import { BarraProgreso } from '@/components/BarraProgreso';
import { Boton } from '@/components/Boton';
import {
  REACTIVOS_IMPACTO,
  TOTAL_REACTIVOS_IMPACTO,
  contarRenglones,
  type ReactivoImpacto,
} from './instrumento';
import type { MomentoMedicion } from './calculo';

function Reactivo({
  reactivo,
  valor,
  onCambio,
}: {
  reactivo: ReactivoImpacto;
  valor: number | undefined;
  onCambio: (valor: number) => void;
}) {
  const [texto, setTexto] = useState('');

  if (reactivo.tipo === 'conteo') {
    return (
      <div className="space-y-2">
        <label htmlFor={reactivo.id} className="block text-base font-semibold">
          {reactivo.texto}
        </label>
        {reactivo.ayuda && <p className="text-micro text-tinta-suave">{reactivo.ayuda}</p>}
        <textarea
          id={reactivo.id}
          rows={4}
          placeholder={reactivo.placeholder}
          value={texto}
          onChange={(evento) => {
            setTexto(evento.target.value);
            onCambio(Math.min(contarRenglones(evento.target.value), reactivo.maximoConteo ?? 20));
          }}
          className="w-full rounded-xl2 border border-borde bg-superficie-2 p-3 text-base"
        />
        <p className="text-chico text-tinta-suave">Llevas {valor ?? 0}.</p>
      </div>
    );
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-base font-semibold">{reactivo.texto}</legend>
      {reactivo.ayuda && <p className="text-micro text-tinta-suave">{reactivo.ayuda}</p>}
      <div className="flex flex-col gap-2">
        {reactivo.opciones?.map((opcion) => (
          <button
            key={opcion.valor}
            type="button"
            aria-pressed={valor === opcion.valor}
            onClick={() => onCambio(opcion.valor)}
            className={[
              'toque w-full justify-start rounded-xl2 border px-4 py-3 text-left text-base',
              valor === opcion.valor ? 'border-primario bg-primario-suave text-primario' : 'border-borde',
            ].join(' ')}
          >
            {opcion.etiqueta}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function FormularioImpacto({
  momento,
  onTerminar,
}: {
  momento: MomentoMedicion;
  onTerminar: (respuestas: Record<string, number>) => void;
}) {
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [indice, setIndice] = useState(0);
  const reactivo = REACTIVOS_IMPACTO[indice]!;
  const esUltimo = indice === TOTAL_REACTIVOS_IMPACTO - 1;
  const contestado = respuestas[reactivo.id] !== undefined;

  return (
    <div className="contenedor-app space-y-5">
      <p className="text-chico font-medium text-primario">
        {momento === 'inicial' ? 'Primera medición' : 'Segunda medición'}
      </p>
      <BarraProgreso actual={indice + 1} total={TOTAL_REACTIVOS_IMPACTO} etiqueta="Avance de la medición" />

      <Reactivo
        reactivo={reactivo}
        valor={respuestas[reactivo.id]}
        onCambio={(valor) => setRespuestas((previas) => ({ ...previas, [reactivo.id]: valor }))}
      />

      <div className="flex gap-2">
        <Boton variante="secundario" onClick={() => setIndice((i) => Math.max(0, i - 1))} disabled={indice === 0}>
          Atrás
        </Boton>
        <Boton
          anchoCompleto
          disabled={!contestado}
          onClick={() => {
            if (esUltimo) onTerminar(respuestas);
            else setIndice((i) => i + 1);
          }}
        >
          {esUltimo ? 'Terminar' : 'Siguiente'}
        </Boton>
      </div>

      <p className="text-micro text-tinta-suave">
        De las preguntas abiertas solo guardamos cuántas cosas escribiste, no lo que escribiste. Tu escuela
        ve resultados del grupo, nunca los tuyos.
      </p>
    </div>
  );
}
