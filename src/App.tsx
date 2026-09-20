import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ErrorLimite } from '@/components/ErrorLimite';
import { Marco } from '@/components/Marco';
import { ProveedorSesion } from '@/features/sesion/SesionContexto';
import { ProveedorPrivacidad } from '@/features/privacidad/ProveedorPrivacidad';
import { ProveedorAvisos } from '@/components/Avisos';
import Inicio from '@/pages/Inicio';

// Inicio va en el bundle inicial; el resto se carga al navegar (menos KB en el primer render).
const Explorar = lazy(() => import('@/pages/Explorar'));
const Mapa = lazy(() => import('@/pages/Mapa'));
const CarreraDetalle = lazy(() => import('@/pages/CarreraDetalle'));
const Perfil = lazy(() => import('@/pages/Perfil'));
const Calculadora = lazy(() => import('@/pages/Calculadora'));
const Comparar = lazy(() => import('@/pages/Comparar'));
const Impacto = lazy(() => import('@/pages/Impacto'));
const Privacidad = lazy(() => import('@/pages/Privacidad'));
const MisDatos = lazy(() => import('@/pages/MisDatos'));
const ConsentimientoPagina = lazy(() => import('@/pages/ConsentimientoPagina'));
const Panel = lazy(() => import('@/pages/Panel'));
const Estilo = lazy(() => import('@/pages/Estilo'));
const Componentes = lazy(() => import('@/pages/Componentes'));
const EstadosPagina = lazy(() => import('@/pages/EstadosPagina'));
const NoEncontrada = lazy(() => import('@/pages/NoEncontrada'));

export default function App() {
  return (
    <ErrorLimite>
      <ProveedorAvisos>
        <ProveedorPrivacidad>
        <ProveedorSesion>
        <Routes>
          <Route element={<Marco />}>
            <Route index element={<Inicio />} />
            <Route path="explorar" element={<Explorar />} />
            <Route path="mapa" element={<Mapa />} />
            {/* ruta vieja: el cuestionario ya no se llama "test" a propósito */}
            <Route path="test" element={<Navigate to="/mapa" replace />} />
            <Route path="carrera/:id" element={<CarreraDetalle />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="calculadora" element={<Calculadora />} />
            <Route path="comparar" element={<Comparar />} />
            <Route path="impacto" element={<Impacto />} />
            <Route path="privacidad" element={<Privacidad />} />
            <Route path="mis-datos" element={<MisDatos />} />
            <Route path="consentimiento" element={<ConsentimientoPagina />} />
            <Route path="panel" element={<Panel />} />
            {/* páginas de revisión del sistema de diseño, no del producto */}
            <Route path="estilo" element={<Estilo />} />
            <Route path="componentes" element={<Componentes />} />
            <Route path="estados" element={<EstadosPagina />} />
            <Route path="*" element={<NoEncontrada />} />
          </Route>
        </Routes>
        </ProveedorSesion>
        </ProveedorPrivacidad>
      </ProveedorAvisos>
    </ErrorLimite>
  );
}
