import type { Fuente as TipoFuente } from '@/data/tipos';

const ETIQUETA_TIPO: Record<TipoFuente['tipo'], string> = {
  inegi_enoe: 'INEGI · ENOE',
  inegi_otro: 'INEGI',
  anuies: 'ANUIES',
  sep: 'SEP',
  gobmx_becas: 'gob.mx',
  plan_estudios: 'Plan de estudios',
  referencia: 'Referencia',
};

/** La fuente va junto al dato, visible y con enlace. La credibilidad del producto
 *  depende de que se vea de dónde salió cada número, no de un pie de página. */
export function Fuente({ fuente }: { fuente: TipoFuente }) {
  return (
    <p className="text-micro text-tinta-suave">
      Fuente:{' '}
      <a
        href={fuente.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primario underline underline-offset-2"
      >
        {fuente.nombre}
      </a>{' '}
      ({ETIQUETA_TIPO[fuente.tipo]}, {fuente.anio})
      <span className="sr-only"> (se abre en otra pestaña)</span>
      {fuente.nota && <span className="mt-0.5 block">{fuente.nota}</span>}
    </p>
  );
}

export function ListaFuentes({ fuentes }: { fuentes: TipoFuente[] }) {
  if (fuentes.length === 0) return null;
  return (
    <div className="mt-2 space-y-1">
      {fuentes.map((fuente) => (
        <Fuente key={fuente.url} fuente={fuente} />
      ))}
    </div>
  );
}
