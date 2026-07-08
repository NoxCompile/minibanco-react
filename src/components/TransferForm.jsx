import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { executeTransfer } from '../services/dbService';

export const TransferForm = () => {
  const { state } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); setSuccess(null); setLoading(true);

    try {
      await executeTransfer(state.user.uid, email, Number(amount));
      setSuccess(`Transferencia enviada con éxito.`);
      setEmail(''); setAmount('');
    } catch (err) {
      setError(err.message || "Error en la transferencia.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <h3 className="panel-title">Nueva Transferencia</h3>
      {error && <div className="error-alert">{error}</div>}
      {success && <div style={{ color: 'var(--success)', padding: '14px', background: 'rgba(22, 163, 74, 0.1)', borderRadius: '12px', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center', fontWeight: '500' }}>{success}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Destinatario (Email)</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} className="bank-input" />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Monto ($)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min="1" disabled={loading} className="bank-input" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="bank-btn bank-btn-primary" style={{ padding: '14px' }}>
          {loading ? 'Procesando...' : 'Confirmar Envío'}
        </button>
      </form>
    </div>
  );
};