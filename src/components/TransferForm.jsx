import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { executeTransfer } from '../services/dbService';

export const TransferForm = () => {
  // Extraemos al usuario actual del "Cerebro" global
  const { state } = useContext(AuthContext);
  
  // Estados del formulario controlados por React
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  
  // Estados de la interfaz
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Handlers nombrados
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleAmountChange = (e) => setAmount(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Regla de oro de la SPA
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Convertimos el input de texto a un número real
    const numericAmount = Number(amount);

    try {
      // Disparamos la transacción atómica
      await executeTransfer(state.user.uid, email, numericAmount);

      // Si el código llega aquí, la transacción fue impecable
      setSuccess(`Transferencia de $${numericAmount.toLocaleString('es-CL')} enviada con éxito.`);
      
      // Limpiamos los inputs para la siguiente operación
      setEmail('');
      setAmount('');
    } catch (err) {
      setError(err.message || "Error al procesar la transferencia.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '30px', padding: '20px', background: '#1c2333', borderRadius: '8px' }}>
      <h3 style={{ marginTop: 0, color: '#7c8cff' }}>Transferir Fondos</h3>

      {/* Zonas de Feedback visual */}
      {error && <div style={{ color: '#f85149', marginBottom: '10px', fontSize: '0.9rem' }}>{error}</div>}
      {success && <div style={{ color: '#3fb950', marginBottom: '10px', fontSize: '0.9rem' }}>{success}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#8b949e' }}>Email del destinatario:</label>
          <input 
            type="email" 
            value={email} 
            onChange={handleEmailChange} 
            required 
            disabled={loading}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #30363d', background: '#0d1117', color: '#e6edf3' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#8b949e' }}>Monto a transferir:</label>
          <input 
            type="number" 
            value={amount} 
            onChange={handleAmountChange} 
            required 
            min="1" 
            disabled={loading}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #30363d', background: '#0d1117', color: '#e6edf3' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          style={{ width: '100%', padding: '10px', background: '#58a6ff', color: '#0d1117', fontWeight: 'bold', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Procesando Transacción...' : 'Enviar Dinero'}
        </button>
      </form>
    </div>
  );
};