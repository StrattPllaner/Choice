import { useParams } from 'react-router-dom';

/** Pendiente: ficha de la carrera (usa obtenerCarrera(id)). */
export default function CarreraDetalle() {
  const { id } = useParams();
  return (
    <div className="contenedor-app space-y-3">
      <h1 className="text-2xl">Ficha de la carrera</h1>
      <p className="text-texto-suave">Clave: {id}</p>
    </div>
  );
}
