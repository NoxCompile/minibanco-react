import { describe, it, expect } from 'vitest';
import { validarTransferencia } from './validaciones';

describe('Validaciones de Transferencia', () => {
  const saldoUsuario = 50000;
  const emailOrigen = 'mi@cuenta.com';

  // BONUS: Pruebas parametrizadas con it.each para casos de error
  it.each([
    { monto: -1000, emailDestino: 'otro@banco.com', esperado: "El monto debe ser un número mayor a $0." },
    { monto: 0, emailDestino: 'otro@banco.com', esperado: "El monto debe ser un número mayor a $0." },
    { monto: "abc", emailDestino: 'otro@banco.com', esperado: "El monto debe ser un número mayor a $0." },
    { monto: 10.5, emailDestino: 'otro@banco.com', esperado: "No se permiten decimales en la transferencia." },
    { monto: 60000, emailDestino: 'otro@banco.com', esperado: "Fondos insuficientes para realizar la transferencia." },
    { monto: 10000, emailDestino: 'mi@cuenta.com', esperado: "No puedes transferir dinero a tu propia cuenta." },
    { monto: 10000, emailDestino: 'correo-invalido', esperado: "Debes ingresar un correo electrónico válido." },
    { monto: 10000, emailDestino: '', esperado: "Debes ingresar un correo electrónico válido." },
  ])('rechaza transferencia con monto $monto hacia $emailDestino', ({ monto, emailDestino, esperado }) => {
    // Act
    const resultado = validarTransferencia(monto, saldoUsuario, emailDestino, emailOrigen);
    
    // Assert
    expect(resultado.isValid).toBe(false);
    expect(resultado.error).toBe(esperado);
  });

  it('acepta la transferencia cuando todos los datos son válidos (Caso Feliz)', () => {
    // Arrange
    const montoValido = 25000;
    const emailDestinoValido = 'amigo@banco.com';

    // Act
    const resultado = validarTransferencia(montoValido, saldoUsuario, emailDestinoValido, emailOrigen);

    // Assert
    expect(resultado.isValid).toBe(true);
    expect(resultado.error).toBeNull();
  });
});