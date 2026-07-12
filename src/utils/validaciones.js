export const validarTransferencia = (monto, saldoDisponible, emailDestino, emailOrigen) => {
  const numMonto = Number(monto);

  // Validación 1: Monto numérico, mayor a cero y sin decimales absurdos
  if (!monto || isNaN(numMonto) || numMonto <= 0) {
    return { isValid: false, error: "El monto debe ser un número mayor a $0." };
  }
  
  if (!Number.isInteger(numMonto)) {
    return { isValid: false, error: "No se permiten decimales en la transferencia." };
  }

  // Validación 2: Saldo suficiente
  if (numMonto > saldoDisponible) {
    return { isValid: false, error: "Fondos insuficientes para realizar la transferencia." };
  }

  // Validación 3: Destinatario válido y no es uno mismo
  if (!emailDestino || !emailDestino.includes('@')) {
    return { isValid: false, error: "Debes ingresar un correo electrónico válido." };
  }

  if (emailDestino === emailOrigen) {
    return { isValid: false, error: "No puedes transferir dinero a tu propia cuenta." };
  }

  // Caso Feliz
  return { isValid: true, error: null };
};