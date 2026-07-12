import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MovementHistory } from './MovementHistory';
import { AuthContext } from '../context/AuthContext';
import * as dbService from '../services/dbService';

// Mockeo la base de datos para no hacer peticiones reales a Firebase durante mis tests
vi.mock('../services/dbService', () => ({
  subscribeToMovements: vi.fn(),
}));

const renderWithProviders = (component, userState) => {
  return render(
    <AuthContext.Provider value={{ state: { user: userState } }}>
      {component}
    </AuthContext.Provider>
  );
};

describe('Componente MovementHistory', () => {
  const usuarioMock = { uid: 'u1', email: 'test@banco.com' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra estado de carga inicialmente', () => {
    // Simulo que la suscripción está cargando sin devolver datos aún
    dbService.subscribeToMovements.mockImplementation(() => vi.fn());
    
    renderWithProviders(<MovementHistory />, usuarioMock);
    
    expect(screen.getByText(/Cargando cartola/i)).toBeInTheDocument();
  });

  it('muestra mensaje cuando no hay movimientos', () => {
    // Simulo que Firebase me devuelve un arreglo vacío
    dbService.subscribeToMovements.mockImplementation((uid, callback) => {
      callback([]); 
      return vi.fn(); 
    });

    renderWithProviders(<MovementHistory />, usuarioMock);

    expect(screen.getByText(/No se encontraron movimientos en los registros/i)).toBeInTheDocument();
  });

  it('renderiza los movimientos respetando el orden recibido (del más reciente al más antiguo)', () => {
    // Preparo los datos de prueba simulando el orden en que Firebase los entregaría
    const mockMovimientos = [
      { id: '1', emisorUid: 'u1', emisorEmail: 'test@banco.com', receptorUid: 'u2', receptorEmail: 'reciente@banco.com', monto: 15000, fecha: { seconds: 1672617600 } }, // Movimiento Nuevo
      { id: '2', emisorUid: 'u3', emisorEmail: 'antiguo@banco.com', receptorUid: 'u1', receptorEmail: 'test@banco.com', monto: 30000, fecha: { seconds: 1672531200 } }  // Movimiento Viejo
    ];

    dbService.subscribeToMovements.mockImplementation((uid, callback) => {
      callback(mockMovimientos);
      return vi.fn();
    });

    renderWithProviders(<MovementHistory />, usuarioMock);

    // Obtengo todos los elementos HTML que contienen las contrapartes usando una clase o testId
    // En este caso, busco por el texto que contiene el dominio del correo
    const correosRenderizados = screen.getAllByText(/@banco\.com/);

    // Verifico que el DOM los haya pintado en el orden exacto del arreglo mockeado
    expect(correosRenderizados[0]).toHaveTextContent('reciente@banco.com');
    expect(correosRenderizados[1]).toHaveTextContent('antiguo@banco.com');
    
    // Verifico también que las insignias de Cargo/Abono se apliquen bien
    expect(screen.getByText('Cargo')).toBeInTheDocument();
    expect(screen.getByText('Abono')).toBeInTheDocument();
  });

  it('llama a la función de limpieza (unsubscribe) al desmontar el componente', () => {
    // Este test es crucial para evitar fugas de memoria en React
    const mockUnsubscribe = vi.fn();
    dbService.subscribeToMovements.mockReturnValue(mockUnsubscribe);

    const { unmount } = renderWithProviders(<MovementHistory />, usuarioMock);
    
    unmount(); // Fuerzo que el componente desaparezca del DOM

    // Compruebo que mi useEffect retornó y ejecutó la limpieza
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});