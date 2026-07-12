import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Login } from './Login';
import { AuthContext } from '../context/AuthContext';
import * as authService from '../services/authService';

// Simulamos el módulo completo de servicios de autenticación
vi.mock('../services/authService', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}));

// Mock para el dispatch del contexto
const mockDispatch = vi.fn();

// Componente envoltorio para proveer el contexto y el enrutador necesarios
const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={{ dispatch: mockDispatch }}>
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Componente Login', () => {
  // Limpiamos los mocks antes de cada prueba para asegurar independencia
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza los campos de email y contraseña por defecto', () => {
    renderWithProviders(<Login changeTheme={() => {}} theme="dark" />);
    
    expect(screen.getByPlaceholderText('nombre@correo.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument();
  });

  it('muestra mensaje de error si se intenta enviar el formulario con campos vacíos', async () => {
    renderWithProviders(<Login changeTheme={() => {}} theme="dark" />);
    
    const botonSubmit = screen.getByRole('button', { name: /Iniciar Sesión/i });
    fireEvent.click(botonSubmit);

    // Verificamos que el error aparezca en pantalla y el servicio no sea llamado
    expect(await screen.findByText('Por favor, ingresa tu correo y contraseña.')).toBeInTheDocument();
    expect(authService.loginUser).not.toHaveBeenCalled();
  });

  it('llama al servicio de autenticación con las credenciales correctas (Caso Feliz)', async () => {
    const user = userEvent.setup();
    const mockUserData = { uid: '123', email: 'test@correo.com' };
    
    // Configuramos el mock para que resuelva exitosamente
    authService.loginUser.mockResolvedValueOnce(mockUserData);
    
    renderWithProviders(<Login changeTheme={() => {}} theme="dark" />);
    
    const inputEmail = screen.getByPlaceholderText('nombre@correo.com');
    const inputPassword = screen.getByPlaceholderText('••••••••');
    const botonSubmit = screen.getByRole('button', { name: /Iniciar Sesión/i });

    // Simulamos la interacción del usuario
    await user.type(inputEmail, 'test@correo.com');
    await user.type(inputPassword, 'clave123');
    await user.click(botonSubmit);

    // Verificamos que el servicio fue llamado con los argumentos exactos
    expect(authService.loginUser).toHaveBeenCalledTimes(1);
    expect(authService.loginUser).toHaveBeenCalledWith('test@correo.com', 'clave123');
    
    // Verificamos que el estado global se actualizó
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'LOGIN', payload: mockUserData });
    });
  });

  it('muestra el mensaje de error proveniente del servicio si la autenticación falla', async () => {
    const user = userEvent.setup();
    
    // Configuramos el mock para que simule un rechazo de Firebase
    authService.loginUser.mockRejectedValueOnce(new Error('Credenciales inválidas'));
    
    renderWithProviders(<Login changeTheme={() => {}} theme="dark" />);
    
    await user.type(screen.getByPlaceholderText('nombre@correo.com'), 'mal@correo.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'clavemala');
    await user.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument();
  });
});