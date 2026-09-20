import { Component, type ErrorInfo, type ReactNode } from 'react';

/** Si una pantalla truena (o falla un chunk por red mala) el alumno ve una salida, no una página en blanco. */
export class ErrorLimite extends Component<{ children: ReactNode }, { fallo: boolean }> {
  state = { fallo: false };

  static getDerivedStateFromError() {
    return { fallo: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error('Error en la app:', error, info);
  }

  render() {
    if (!this.state.fallo) return this.props.children;
    return (
      <div className="contenedor-app py-10 text-center">
        <h1 className="text-xl">Algo se atoró</h1>
        <p className="mt-2 text-tinta-suave">Vuelve a abrir la app. Lo que guardaste sigue ahí.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="toque mt-6 rounded-xl2 bg-primario px-5 py-3 font-semibold text-sobre-primario"
        >
          Reintentar
        </button>
      </div>
    );
  }
}
