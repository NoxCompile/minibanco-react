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
    <div style={{ padding: '20px', background: 'var(--surface-inner)', border: '1px solid var(--border)', borderRadius: '14px' }}>
      <h3 style={{ color: 'var(--text)', fontSize: '1.05rem', marginBottom: '16px', fontWeight: '600' }}>Nueva Transferencia</h3>
      {error && <div style={{ color: 'var(--danger)', padding: '10px', background: 'rgba(248,81,73,0.05)', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem' }}>{error}</div>}
      {success && <div style={{ color: 'var(--success)', padding: '10px', background: 'rgba(63,185,80,0.05)', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem' }}>{success}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Destinatario (Email)</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} className="bank-input" />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Monto ($)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min="1" disabled={loading} className="bank-input" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="bank-btn bank-btn-primary" style={{ padding: '12px' }}>
          {loading ? 'Procesando...' : 'Confirmar Envío'}
        </button>
      </form>
    </div>
  );
};