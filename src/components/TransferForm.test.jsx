import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransferForm } from './TransferForm';
import { AuthContext } from '../context/AuthContext';
import * as dbService from '../services/dbService';

// Simulamos la capa de base de datos para no afectar Firestore
vi.mock('../services/dbService', () => ({
  executeTransfer: vi.fn(),
}));

const renderWithProviders = (component, userState) => {
  return render(
    <AuthContext.Provider value={{ state: { user: userState } }}>
      {component}
    </AuthContext.Provider>
  );
};

describe('Componente TransferForm', () => {
  const usuarioMock = { uid: 'u1', email: 'origen@banco.com', saldo: 100000 };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza los campos y el botón', () => {
    renderWithProviders(<TransferForm />, usuarioMock);
    
    expect(screen.getByLabelText(/Destinatario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Monto/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirmar Envío/i })).toBeInTheDocument();
  });

  it('muestra error y NO llama al servicio si el monto es inválido', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TransferForm />, usuarioMock);

    await user.type(screen.getByLabelText(/Destinatario/i), 'destino@banco.com');
    await user.type(screen.getByLabelText(/Monto/i), '200000'); 
    await user.click(screen.getByRole('button', { name: /Confirmar Envío/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/Fondos insuficientes/i);
    expect(dbService.executeTransfer).not.toHaveBeenCalled();
  });

  it('llama al servicio exactamente una vez con los argumentos correctos (Caso Feliz)', async () => {
    const user = userEvent.setup();
    
    // Promesa controlada para pausar el mock y poder verificar el estado de "Carga"
    let resolveMock;
    const mockPromise = new Promise((resolve) => {
      resolveMock = resolve;
    });
    
    dbService.executeTransfer.mockReturnValueOnce(mockPromise);
    
    renderWithProviders(<TransferForm />, usuarioMock);

    await user.type(screen.getByLabelText(/Destinatario/i), 'destino@banco.com');
    await user.type(screen.getByLabelText(/Monto/i), '50000');
    
    const submitBtn = screen.getByRole('button', { name: /Confirmar Envío/i });
    await user.click(submitBtn);

    // Verificamos botón deshabilitado durante la carga
    expect(submitBtn).toBeDisabled();
    expect(submitBtn).toHaveTextContent(/Procesando/i);

    // Liberamos la promesa para que el código continúe
    resolveMock();

    await waitFor(() => {
      expect(dbService.executeTransfer).toHaveBeenCalledTimes(1);
      expect(dbService.executeTransfer).toHaveBeenCalledWith('u1', 'destino@banco.com', 50000);
      expect(screen.getByRole('status')).toHaveTextContent(/éxito/i);
    });
    
    // Verificamos que el botón vuelve a la normalidad al terminar
    expect(submitBtn).not.toBeDisabled();
  });
});