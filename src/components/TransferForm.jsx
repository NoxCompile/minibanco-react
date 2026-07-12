import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { executeTransfer } from '../services/dbService';
import { validarTransferencia } from '../utils/validaciones'; // Importamos la lógica pura

export const TransferForm = () => {
  const { state } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 
    setSuccess(null); 

    // Uso de la función pura de validación
    const validacion = validarTransferencia(amount, state.user.saldo, email, state.user.email);
    
    if (!validacion.isValid) {
      setError(validacion.error);
      return; // Detenemos la ejecución si no pasa la validación local
    }

    setLoading(true);

    try {
      await executeTransfer(state.user.uid, email, Number(amount));
      setSuccess(`Transferencia enviada con éxito.`);
      setEmail(''); 
      setAmount('');
    } catch (err) {
      setError(err.message || "Error en la transferencia.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <h3 className="panel-title">Nueva Transferencia</h3>
      {error && <div className="error-alert" role="alert">{error}</div>}
      {success && <div style={{ color: 'var(--success)', padding: '14px', background: 'rgba(22, 163, 74, 0.1)', borderRadius: '12px', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center', fontWeight: '500' }} role="status">{success}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label htmlFor="email-destinatario" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Destinatario (Email)</label>
            <input id="email-destinatario" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} className="bank-input" />
          </div>
          <div>
            <label htmlFor="monto-transferencia" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Monto ($)</label>
            <input id="monto-transferencia" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min="1" disabled={loading} className="bank-input" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="bank-btn bank-btn-primary" style={{ padding: '14px' }}>
          {loading ? 'Procesando...' : 'Confirmar Envío'}
        </button>
      </form>
    </div>
  );
};