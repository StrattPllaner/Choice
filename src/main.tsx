import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { registrarSW } from './lib/registrarSW';
import { arrancarSincronizacion } from './lib/sincronizacion';
import './index.css';

const raiz = document.getElementById('raiz');
if (!raiz) throw new Error('Falta el nodo #raiz en index.html');

createRoot(raiz).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
);

registrarSW();
arrancarSincronizacion();
