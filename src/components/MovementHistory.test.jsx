import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MovementHistory } from './MovementHistory';
import { AuthContext } from '../context/AuthContext';
import * as dbService from '../services/dbService';

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
    // Simulamos la suscripción sin ejecutar el callback para mantener el estado loading
    dbService.subscribeToMovements.mockImplementation(() => vi.fn());
    
    renderWithProviders(<MovementHistory />, usuarioMock);
    
    expect(screen.getByText(/Cargando cartola/i)).toBeInTheDocument();
  });

  it('muestra mensaje cuando no hay movimientos', () => {
    // Simulamos la respuesta de Firebase con un arreglo vacío
    dbService.subscribeToMovements.mockImplementation((uid, callback) => {
      callback([]); 
      return vi.fn(); 
    });

    renderWithProviders(<MovementHistory />, usuarioMock);

    expect(screen.getByText(/No se encontraron movimientos en los registros/i)).toBeInTheDocument();
  });

  it('renderiza la lista de movimientos diferenciando cargos y abonos', () => {
    const mockMovimientos = [
      { id: '1', emisorUid: 'u1', emisorEmail: 'test@banco.com', receptorUid: 'u2', receptorEmail: 'destino@banco.com', monto: 15000, fecha: { seconds: 1672531200 } },
      { id: '2', emisorUid: 'u3', emisorEmail: 'origen@banco.com', receptorUid: 'u1', receptorEmail: 'test@banco.com', monto: 30000, fecha: { seconds: 1672617600 } }
    ];

    dbService.subscribeToMovements.mockImplementation((uid, callback) => {
      callback(mockMovimientos);
      return vi.fn();
    });

    renderWithProviders(<MovementHistory />, usuarioMock);

    // Verificamos que se renderizan las contrapartes
    expect(screen.getByText('destino@banco.com')).toBeInTheDocument();
    expect(screen.getByText('origen@banco.com')).toBeInTheDocument();

    // Verificamos las insignias
    expect(screen.getByText('Cargo')).toBeInTheDocument();
    expect(screen.getByText('Abono')).toBeInTheDocument();
  });

  // BONUS: Verificación de desmontaje de suscripción
  it('llama a la función de limpieza (unsubscribe) al desmontar el componente', () => {
    const mockUnsubscribe = vi.fn();
    dbService.subscribeToMovements.mockReturnValue(mockUnsubscribe);

    const { unmount } = renderWithProviders(<MovementHistory />, usuarioMock);
    
    unmount(); // Forzamos el desmontaje

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});