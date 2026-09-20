import { useId, useState, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

/** Campo con etiqueta flotante y mensaje de error.
 *
 *  La etiqueta sube cuando hay foco o contenido; nunca desaparece, porque un
 *  placeholder como etiqueta deja al usuario adivinando qué escribió dónde.
 *  La etiqueta se mueve con transform (no con top), para no provocar reflow.
 */
interface Comunes {
  etiqueta: string;
  ayuda?: string;
  error?: string;
  valor: string;
  onCambio: (valor: string) => void;
}

const CONTENEDOR = 'relative';
const CAJA =
  'peer w-full rounded-chico border bg-superficie-2 px-4 pb-2 pt-6 text-base text-tinta ' +
  'anillo-foco placeholder-transparent transition-colors duration-estado ease-entrada ' +
  'disabled:opacity-50';

function claseCaja(hayError: boolean) {
  return `${CAJA} ${hayError ? 'border-error' : 'border-borde-fuerte'}`;
}

function Etiqueta({ id, texto, flotando }: { id: string; texto: string; flotando: boolean }) {
  return (
    <label
      htmlFor={id}
      className={[
        'pointer-events-none absolute left-4 top-4 origin-left text-base text-tinta-suave',
        'transition-transform duration-estado ease-entrada',
        flotando ? 'translate-y-[-10px] scale-[0.78]' : '',
      ].join(' ')}
    >
      {texto}
    </label>
  );
}

export function Campo({
  etiqueta,
  ayuda,
  error,
  valor,
  onCambio,
  ...resto
}: Comunes & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  const id = useId();
  const [enfocado, setEnfocado] = useState(false);
  const flotando = enfocado || valor.length > 0;

  return (
    <div className={CONTENEDOR}>
      <input
        id={id}
        value={valor}
        onChange={(evento) => onCambio(evento.target.value)}
        onFocus={() => setEnfocado(true)}
        onBlur={() => setEnfocado(false)}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${id}-error` : ayuda ? `${id}-ayuda` : undefined}
        placeholder={etiqueta}
        className={claseCaja(Boolean(error))}
        {...resto}
      />
      <Etiqueta id={id} texto={etiqueta} flotando={flotando} />
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-chico text-error">
          {error}
        </p>
      ) : ayuda ? (
        <p id={`${id}-ayuda`} className="mt-1 text-chico text-tinta-suave">
          {ayuda}
        </p>
      ) : null}
    </div>
  );
}

export function CampoLargo({
  etiqueta,
  ayuda,
  error,
  valor,
  onCambio,
  ...resto
}: Comunes & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'>) {
  const id = useId();
  const [enfocado, setEnfocado] = useState(false);
  const flotando = enfocado || valor.length > 0;

  return (
    <div className={CONTENEDOR}>
      <textarea
        id={id}
        value={valor}
        onChange={(evento) => onCambio(evento.target.value)}
        onFocus={() => setEnfocado(true)}
        onBlur={() => setEnfocado(false)}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${id}-error` : ayuda ? `${id}-ayuda` : undefined}
        placeholder={etiqueta}
        className={`${claseCaja(Boolean(error))} min-h-[7rem]`}
        {...resto}
      />
      <Etiqueta id={id} texto={etiqueta} flotando={flotando} />
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-chico text-error">
          {error}
        </p>
      ) : ayuda ? (
        <p id={`${id}-ayuda`} className="mt-1 text-chico text-tinta-suave">
          {ayuda}
        </p>
      ) : null}
    </div>
  );
}

export function Selector({
  etiqueta,
  ayuda,
  error,
  valor,
  onCambio,
  opciones,
  ...resto
}: Comunes & {
  opciones: { valor: string; etiqueta: string }[];
} & Omit<InputHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'>) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="block text-chico font-medium text-tinta">
        {etiqueta}
      </label>
      <select
        id={id}
        value={valor}
        onChange={(evento) => onCambio(evento.target.value)}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${id}-error` : ayuda ? `${id}-ayuda` : undefined}
        className={[
          'toque anillo-foco mt-1 w-full rounded-chico border bg-superficie-2 px-4 py-3 text-base text-tinta',
          error ? 'border-error' : 'border-borde-fuerte',
        ].join(' ')}
        {...(resto as object)}
      >
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-chico text-error">
          {error}
        </p>
      ) : ayuda ? (
        <p id={`${id}-ayuda`} className="mt-1 text-chico text-tinta-suave">
          {ayuda}
        </p>
      ) : null}
    </div>
  );
}
