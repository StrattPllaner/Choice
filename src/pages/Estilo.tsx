import { useState } from 'react';

/** Página de revisión del sistema de diseño. No es parte del producto: sirve para
 *  mirar todos los tokens juntos y cachar incoherencias antes de que lleguen a una pantalla. */

const COLORES: { grupo: string; tokens: { nombre: string; uso: string; sobre?: string }[] }[] = [
  {
    grupo: 'Superficies',
    tokens: [
      { nombre: 'fondo', uso: 'Lienzo de la app' },
      { nombre: 'superficie', uso: 'Tarjetas y hojas' },
      { nombre: 'superficie-2', uso: 'Campos y zonas hundidas' },
      { nombre: 'borde', uso: 'Separaciones' },
      { nombre: 'borde-fuerte', uso: 'Bordes de control (3:1)' },
    ],
  },
  {
    grupo: 'Tinta',
    tokens: [
      { nombre: 'tinta', uso: 'Texto principal' },
      { nombre: 'tinta-suave', uso: 'Texto secundario' },
      { nombre: 'tinta-tenue', uso: 'Metadatos, solo texto grande' },
    ],
  },
  {
    grupo: 'Primario',
    tokens: [
      { nombre: 'primario', uso: 'Acciones y enlaces', sobre: 'sobre-primario' },
      { nombre: 'primario-fuerte', uso: 'Hover y presionado', sobre: 'sobre-primario' },
      { nombre: 'primario-suave', uso: 'Selección e info', sobre: 'primario' },
    ],
  },
  {
    grupo: 'Acento (con moderación)',
    tokens: [
      { nombre: 'acento', uso: 'Destacar una cosa', sobre: 'sobre-acento' },
      { nombre: 'acento-texto', uso: 'Acento como texto' },
      { nombre: 'acento-suave', uso: 'Fondo de realce', sobre: 'acento-texto' },
    ],
  },
  {
    grupo: 'Estados',
    tokens: [
      { nombre: 'exito', uso: 'Confirmaciones' },
      { nombre: 'exito-suave', uso: 'Fondo de confirmación', sobre: 'exito' },
      { nombre: 'atencion', uso: 'Avisos, ámbar y no rojo' },
      { nombre: 'atencion-suave', uso: 'Fondo de aviso', sobre: 'atencion' },
      { nombre: 'error', uso: 'Solo cuando algo falló' },
      { nombre: 'error-suave', uso: 'Fondo de error', sobre: 'error' },
    ],
  },
];

const ESCALA = [
  { clase: 'text-2xl', token: '--texto-2xl', px: '33.18px', uso: 'Un número grande, una vez por pantalla' },
  { clase: 'text-xl', token: '--texto-xl', px: '27.65px', uso: 'Título de pantalla' },
  { clase: 'text-lg', token: '--texto-lg', px: '23.04px', uso: 'Título de sección' },
  { clase: 'text-md', token: '--texto-md', px: '19.2px', uso: 'Subtítulo' },
  { clase: 'text-base', token: '--texto-base', px: '16px', uso: 'Cuerpo · mínimo absoluto' },
  { clase: 'text-chico', token: '--texto-chico', px: '13.33px', uso: 'Metadatos, nunca cuerpo' },
  { clase: 'text-micro', token: '--texto-micro', px: '11.11px', uso: 'Sellos y notas al pie' },
];

const ESPACIOS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16];
const RADIOS = [
  { nombre: 'chico', clase: 'rounded-chico', uso: 'Botones y campos' },
  { nombre: 'tarjeta', clase: 'rounded-tarjeta', uso: 'Tarjetas' },
  { nombre: 'hoja', clase: 'rounded-hoja', uso: 'Hojas y modales' },
  { nombre: 'lleno', clase: 'rounded-lleno', uso: 'Chips' },
];

export default function Estilo() {
  const [animando, setAnimando] = useState<string | null>(null);

  const probar = (clave: string) => {
    setAnimando(clave);
    window.setTimeout(() => setAnimando(null), 700);
  };

  return (
    <div className="contenedor-app space-y-10 pb-10">
      <header className="space-y-2">
        <h1 className="text-xl">Sistema de diseño</h1>
        <p className="text-tinta-suave">
          Todos los tokens de <code>src/styles/tokens.css</code>, juntos, para revisarlos de un vistazo.
          El contraste lo valida <code>npm run validar-contraste</code> en cada build.
        </p>
      </header>

      <section aria-labelledby="color" className="space-y-4">
        <h2 id="color" className="text-lg">Color</h2>
        <div className="rejilla-ancha items-start">
        {COLORES.map((grupo) => (
          <div key={grupo.grupo} className="space-y-2">
            <h3 className="text-chico font-medium text-tinta-suave">{grupo.grupo}</h3>
            <ul className="space-y-2">
              {grupo.tokens.map((token) => (
                <li key={token.nombre} className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="h-12 w-12 shrink-0 rounded-chico border border-borde"
                    style={{ background: `var(--color-${token.nombre})` }}
                  />
                  <span className="min-w-0">
                    <code className="text-chico">--color-{token.nombre}</code>
                    <span className="block text-micro text-tinta-suave">{token.uso}</span>
                  </span>
                  {token.sobre && (
                    <span
                      className="ml-auto rounded-chico px-3 py-2 text-micro"
                      style={{ background: `var(--color-${token.nombre})`, color: `var(--color-${token.sobre})` }}
                    >
                      Texto
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
        </div>
      </section>

      <section aria-labelledby="tipo" className="space-y-3">
        <h2 id="tipo" className="text-lg">Tipografía</h2>
        <p className="text-chico text-tinta-suave">
          Nunito 700 para títulos, Inter 400–600 para cuerpo. Autoalojadas, subconjunto español,
          35 KB en total. Escala de razón 1.2 desde 16px.
        </p>
        <ul className="rejilla-ancha">
          {ESCALA.map((paso) => (
            <li key={paso.clase} className="border-b border-borde pb-3">
              <p className={paso.clase}>Elegir carrera sin adivinar</p>
              <p className="text-micro text-tinta-suave">
                <code>{paso.token}</code> · {paso.px} · {paso.uso}
              </p>
            </li>
          ))}
        </ul>
        <div className="tarjeta space-y-2">
          <p className="font-titulo text-lg">Nunito 700 · títulos</p>
          <p className="text-base">Inter 400 · cuerpo. Las formas suaves del título bajan la formalidad.</p>
          <p className="text-base font-medium">Inter 600 · énfasis dentro del cuerpo</p>
        </div>
      </section>

      <section aria-labelledby="espacio" className="space-y-3">
        <h2 id="espacio" className="text-lg">Espaciado</h2>
        <ul className="space-y-2">
          {ESPACIOS.map((paso) => (
            <li key={paso} className="flex items-center gap-3">
              <span aria-hidden="true" className="h-4 bg-primario-suave" style={{ width: `var(--esp-${paso})` }} />
              <code className="text-micro text-tinta-suave">--esp-{paso}</code>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="radios" className="space-y-3">
        <h2 id="radios" className="text-lg">Radios y sombras</h2>
        <ul className="flex flex-wrap gap-3">
          {RADIOS.map((radio) => (
            <li key={radio.nombre} className="text-center">
              <span
                aria-hidden="true"
                className={`block h-16 w-16 border border-borde bg-superficie-2 ${radio.clase}`}
              />
              <code className="text-micro text-tinta-suave">{radio.nombre}</code>
            </li>
          ))}
        </ul>
        <ul className="flex flex-wrap gap-4">
          {[1, 2, 3].map((nivel) => (
            <li key={nivel} className="text-center">
              <span
                aria-hidden="true"
                className="block h-16 w-24 rounded-tarjeta bg-superficie"
                style={{ boxShadow: `var(--sombra-${nivel})` }}
              />
              <code className="text-micro text-tinta-suave">sombra-{nivel}</code>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="movimiento" className="space-y-3">
        <h2 id="movimiento" className="text-lg">Movimiento</h2>
        <p className="text-chico text-tinta-suave">
          Tócalos para verlos. Solo se animan <code>transform</code> y <code>opacity</code>; con
          movimiento reducido activado en el sistema, todo esto queda en un cambio de opacidad.
        </p>
        <ul className="space-y-3">
          {[
            { clave: 'rapida', nombre: '120ms · respuesta al dedo', curva: 'salida', clase: 'scale-95' },
            { clave: 'estado', nombre: '180ms · cambio de estado', curva: 'entrada', clase: 'translate-x-4' },
            { clave: 'entrada', nombre: '240ms · entrada de elemento', curva: 'entrada', clase: 'entra' },
          ].map((paso) => (
            <li key={paso.clave} className="tarjeta">
              <button
                type="button"
                onClick={() => probar(paso.clave)}
                className="toque anillo-foco flex w-full items-center gap-3 text-left"
              >
                <span
                  aria-hidden="true"
                  className={[
                    'h-10 w-10 rounded-chico bg-primario',
                    'transition-transform ease-entrada',
                    animando === paso.clave ? paso.clase : '',
                  ].join(' ')}
                  style={{ transitionDuration: `var(--dur-${paso.clave})` }}
                />
                <span>
                  <span className="block text-chico font-medium">{paso.nombre}</span>
                  <code className="text-micro text-tinta-suave">
                    --dur-{paso.clave} · --curva-{paso.curva}
                  </code>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
