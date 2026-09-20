import { useEffect, useState } from 'react';
import { guardarTema, leerTema, type Tema } from '@/lib/tema';

const opciones: { valor: Tema; etiqueta: string }[] = [
  { valor: 'sistema', etiqueta: 'Como mi celular' },
  { valor: 'claro', etiqueta: 'Claro' },
  { valor: 'oscuro', etiqueta: 'Oscuro' },
];

export function SelectorTema() {
  const [tema, setTema] = useState<Tema>('sistema');

  useEffect(() => {
    void leerTema().then(setTema);
  }, []);

  return (
    <fieldset className="tarjeta">
      <legend className="px-1 text-sm font-semibold">Colores de la app</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {opciones.map(({ valor, etiqueta }) => (
          <label
            key={valor}
            className={[
              'toque cursor-pointer rounded-xl2 border px-4 py-2 text-sm',
              tema === valor ? 'border-marca bg-marca-suave text-marca' : 'border-borde text-texto',
            ].join(' ')}
          >
            <input
              type="radio"
              name="tema"
              value={valor}
              checked={tema === valor}
              onChange={() => {
                setTema(valor);
                void guardarTema(valor);
              }}
              className="sr-only"
            />
            {etiqueta}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
