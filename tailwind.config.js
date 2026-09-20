/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // el tema real vive en variables CSS; la clase sirve para forzar oscuro desde Ajustes
  darkMode: ['class', '[data-tema="oscuro"]'],
  theme: {
    extend: {
      colors: {
        fondo: 'rgb(var(--c-fondo) / <alpha-value>)',
        superficie: 'rgb(var(--c-superficie) / <alpha-value>)',
        'superficie-2': 'rgb(var(--c-superficie-2) / <alpha-value>)',
        borde: 'rgb(var(--c-borde) / <alpha-value>)',
        texto: 'rgb(var(--c-texto) / <alpha-value>)',
        'texto-suave': 'rgb(var(--c-texto-suave) / <alpha-value>)',
        marca: 'rgb(var(--c-marca) / <alpha-value>)',
        'marca-fuerte': 'rgb(var(--c-marca-fuerte) / <alpha-value>)',
        'marca-suave': 'rgb(var(--c-marca-suave) / <alpha-value>)',
        'sobre-marca': 'rgb(var(--c-sobre-marca) / <alpha-value>)',
        exito: 'rgb(var(--c-exito) / <alpha-value>)',
        aviso: 'rgb(var(--c-aviso) / <alpha-value>)',
        error: 'rgb(var(--c-error) / <alpha-value>)',
        foco: 'rgb(var(--c-foco) / <alpha-value>)',
        'serie-a': 'rgb(var(--c-serie-a) / <alpha-value>)',
        'serie-b': 'rgb(var(--c-serie-b) / <alpha-value>)',
        referencia: 'rgb(var(--c-referencia) / <alpha-value>)',
      },
      fontFamily: {
        // pila del sistema: 0 KB de fuentes, 0 peticiones, 0 FOUT en 3G
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: { xl2: '1.25rem' },
      spacing: { toque: '2.75rem' }, // 44px
      maxWidth: { contenido: '30rem' }, // diseñado para 360px de ancho
      screens: { xs: '360px' },
    },
  },
  plugins: [],
}
