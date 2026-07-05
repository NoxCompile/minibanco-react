import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { logoutUser } from '../services/authService';
import { subscribeToUser } from '../services/dbService';
import { TransferForm } from '../components/TransferForm';
import { MovementHistory } from '../components/MovementHistory';

export const Dashboard = () => {
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
    await logoutUser();
    dispatch({ type: 'LOGOUT' });
    navigate('/');
  };

  if (loading) return <div style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '1.1rem' }}>Sincronizando bóveda...</div>;

  return (
    <div className="bank-card" style={{ width: '100%', maxWidth: '700px', margin: '20px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '18px', marginBottom: '24px' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Banca Digital</span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>{userData?.nombre}</h2>
        </div>
        <button onClick={handleLogout} style={{ padding: '8px 16px', background: 'rgba(248,81,73,0.1)', color: 'var(--danger)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
          Salir
        </button>
      </div>

      <div style={{ padding: '24px', background: 'var(--surface-inner)', border: '1px solid var(--border)', borderRadius: '14px', textAlign: 'center', marginBottom: '24px' }}>
        <p style={{ color: 'var(--muted)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '600' }}>Saldo Disponible</p>
        <h1 style={{ color: 'var(--primary)', fontSize: '2.8rem', fontWeight: '800', marginTop: '6px' }}>
          ${userData?.saldo?.toLocaleString('es-CL')}
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <TransferForm />
        <MovementHistory />
      </div>
    </div>
  );
};