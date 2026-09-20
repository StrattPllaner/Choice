import { useNavigate } from 'react-router-dom';
import { Consentimiento } from '@/features/privacidad/Consentimiento';
import { usarPrivacidad } from '@/features/privacidad/ProveedorPrivacidad';

export default function ConsentimientoPagina() {
  const navegar = useNavigate();
  const { recargar } = usarPrivacidad();

  return (
    <Consentimiento
      onListo={async () => {
        await recargar();
        navegar('/', { replace: true });
      }}
    />
  );
}
