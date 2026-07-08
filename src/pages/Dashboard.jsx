import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { logoutUser } from '../services/authService';
import { subscribeToUser } from '../services/dbService';

import { TransferForm } from '../components/TransferForm';
import { MovementHistory } from '../components/MovementHistory';
import { SimulatedActions } from '../components/SimulatedActions';

export const Dashboard = ({ toggleTheme, theme }) => {
  const { state, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!state.user) {
      navigate('/');
      return;
    }
    const unsubscribe = subscribeToUser(state.user.uid, (data) => {
      setUserData(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [state.user, navigate]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      dispatch({ type: 'LOGOUT' });
      navigate('/');
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  if (loading) {
    return (
      <div style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '1.2rem' }}>
        Sincronizando bóveda...
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ width: '100%', maxWidth: '950px', margin: '30px auto' }}>
      
      {/* Cabecera del Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '28px' }}>
        <div>
          <span className="text-muted" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '600' }}>
            Banca Digital Premium
          </span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700', marginTop: '4px', color: 'var(--text-main)' }}>
            {userData?.nombre}
          </h2>
        </div>
        
        {/* Botones de Cabecera */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={toggleTheme} className="bank-btn" style={{ background: 'var(--input-bg)', color: 'var(--text-main)', border: '1px solid var(--border-color)', width: 'auto', padding: '12px 16px', fontSize: '0.95rem' }}>
            {theme === 'dark' ? '☀️ Claro' : '🌙 Oscuro'}
          </button>
          <button onClick={handleLogout} className="bank-btn btn-danger" style={{ width: 'auto', padding: '12px 20px', fontSize: '0.95rem' }}>
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Tarjeta de Saldo */}
      <div style={{ padding: '36px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', textAlign: 'center', marginBottom: '32px' }}>
        <p className="text-muted" style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '2px' }}>
          Saldo Total Disponible
        </p>
        <h1 style={{ color: 'var(--text-main)', fontSize: '3.6rem', fontWeight: '800', margin: '12px 0', letterSpacing: '-1px' }}>
          ${userData?.saldo?.toLocaleString('es-CL')}
        </h1>
      </div>

      {/* Grilla Modular */}
      <div className="dashboard-grid">
        <div className="grid-column">
          <TransferForm />
          <SimulatedActions />
        </div>
        <div className="grid-column">
          <MovementHistory />
        </div>
      </div>

    </div>
  );
};