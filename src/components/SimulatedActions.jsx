import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { simulateTransaction } from '../services/dbService';

export const SimulatedActions = () => {
  const { state } = useContext(AuthContext);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAction = async (type) => {
    setError(null);
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError("Ingresa un monto válido.");
      return;
    }
    setLoading(true);
    try {
      await simulateTransaction(state.user.uid, state.user.email, type, numAmount);
      setAmount('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <h3 className="panel-title">Cajero Automático (Simulador)</h3>
      {error && <div className="error-alert">{error}</div>}
      
      <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
        <input 
          type="number" 
          className="bank-input" 
          placeholder="Monto ($)" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          disabled={loading}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <button className="bank-btn btn-success" onClick={() => handleAction('deposito')} disabled={loading}>
            + Depositar
          </button>
          <button className="bank-btn btn-danger" onClick={() => handleAction('retiro')} disabled={loading}>
            - Retirar
          </button>
        </div>
      </div>
    </div>
  );
};