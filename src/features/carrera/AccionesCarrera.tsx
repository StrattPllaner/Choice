import { useState } from 'react';
import type { Carrera } from '@/data/tipos';
import { usarSesion } from '@/features/sesion/usarSesion';

/** URL que se comparte: una página estática por carrera (dist/c/<id>.html) que sí trae
 *  etiquetas Open Graph, para que WhatsApp arme la tarjeta de vista previa. Esa página
 *  manda al usuario a la ficha dentro de la app. */
export function urlCompartible(carrera: Carrera): string {
  const base = `${window.location.origin}${import.meta.env.BASE_URL}`.replace(/\/+$/, '/');
  return `${base}c/${carrera.id}.html`;
}

export function AccionesCarrera({ carrera }: { carrera: Carrera }) {
  const { sesion, alternarFavorita } = usarSesion();
  const [copiado, setCopiado] = useState(false);
  const guardada = sesion?.favoritas.includes(carrera.id) ?? false;

  const texto = `${carrera.nombre}: qué se estudia, qué se gana y dónde. Mira la ficha en NOMBREAPP 👇`;
  const url = urlCompartible(carrera);

  const compartir = async () => {
    // en celular abre la hoja del sistema (WhatsApp incluido); si no existe, va directo a WhatsApp
    if (navigator.share) {
      try {
        await navigator.share({ title: carrera.nombre, text: texto, url });
        return;
      } catch {
        /* el usuario canceló: no hacemos nada */
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${texto} ${url}`)}`, '_blank', 'noopener');
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2500);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => alternarFavorita(carrera.id)}
          aria-pressed={guardada}
          className={[
            'toque flex-1 gap-2 rounded-xl2 border px-4 py-3 text-sm font-semibold',
            guardada ? 'border-marca bg-marca-suave text-marca' : 'border-borde text-texto',
          ].join(' ')}
        >
          {guardada ? '★ Guardada en mis carreras' : '☆ Guardar en mis carreras'}
        </button>
        <button
          type="button"
          onClick={compartir}
          className="toque gap-2 rounded-xl2 bg-marca px-4 py-3 text-sm font-semibold text-sobre-marca"
        >
          Compartir
        </button>
      </div>
      <button type="button" onClick={copiar} className="toque w-full text-xs text-texto-suave underline">
        {copiado ? 'Enlace copiado' : 'Copiar enlace de esta ficha'}
      </button>
      <p role="status" aria-live="polite" className="sr-only">
        {guardada ? 'Carrera guardada en mis carreras' : ''}
      </p>
    </div>
  );
}
