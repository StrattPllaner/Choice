type TonoInsignia = 'neutro' | 'primario' | 'exito' | 'atencion' | 'error' | 'acento';

const TONOS: Record<TonoInsignia, string> = {
  neutro: 'bg-superficie-2 text-tinta-suave',
  primario: 'bg-primario-suave text-primario',
  exito: 'bg-exito-suave text-exito',
  atencion: 'bg-atencion-suave text-atencion',
  error: 'bg-error-suave text-error',
  acento: 'bg-acento-suave text-acento-texto',
};

/** Etiqueta chica. Nunca comunica solo con color: siempre lleva texto. */
export function Insignia({ children, tono = 'neutro' }: { children: React.ReactNode; tono?: TonoInsignia }) {
  return (
    <span className={`inline-flex items-center rounded-lleno px-3 py-1 text-micro font-medium ${TONOS[tono]}`}>
      {children}
    </span>
  );
}
