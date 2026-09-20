import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ErrorLimite } from '@/components/ErrorLimite';
import { Marco } from '@/components/Marco';
import { ProveedorSesion } from '@/features/sesion/SesionContexto';
import Inicio from '@/pages/Inicio';

// Inicio va en el bundle inicial; el resto se carga al navegar (menos KB en el primer render).
const Explorar = lazy(() => import('@/pages/Explorar'));
const Test = lazy(() => import('@/pages/Test'));
const CarreraDetalle = lazy(() => import('@/pages/CarreraDetalle'));
const Perfil = lazy(() => import('@/pages/Perfil'));
const NoEncontrada = lazy(() => import('@/pages/NoEncontrada'));

export default function App() {
  return (
    <ErrorLimite>
      <ProveedorSesion>
        <Routes>
          <Route element={<Marco />}>
            <Route index element={<Inicio />} />
            <Route path="explorar" element={<Explorar />} />
            <Route path="test" element={<Test />} />
            <Route path="carrera/:id" element={<CarreraDetalle />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="*" element={<NoEncontrada />} />
          </Route>
        </Routes>
      </ProveedorSesion>
    </ErrorLimite>
  );
}
