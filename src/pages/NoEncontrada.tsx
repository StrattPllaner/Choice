import { BotonEnlace } from '@/components/Boton';

export default function NoEncontrada() {
  return (
    <div className="contenedor-app space-y-4 text-center">
      <h1 className="text-2xl">No encontramos esa página</h1>
      <p className="text-texto-suave">Puede que el enlace esté mal escrito.</p>
      <BotonEnlace a="/" variante="secundario">
        Ir al inicio
      </BotonEnlace>
    </div>
  );
}
