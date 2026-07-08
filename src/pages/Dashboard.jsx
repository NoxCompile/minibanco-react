import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { logoutUser } from '../services/authService';
import { subscribeToUser } from '../services/dbService';

// Importación de los 3 módulos hijos
import { TransferForm } from '../components/TransferForm';
import { MovementHistory } from '../components/MovementHistory';
import { SimulatedActions } from '../components/SimulatedActions';

export const Dashboard = () => {
  const { state, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Suscripción reactiva al saldo del usuario
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

  // Destrucción de sesión
  const handleLogout = async () => {
    try {
      await logoutUser();
      dispatch({ type: 'LOGOUT' });
      navigate('/');
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  // Pantalla de carga con los colores de la nueva estética
  if (loading) {
    return (
      <div style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '1.2rem', textShadow: '0 0 10px var(--primary-glow)' }}>
        Sincronizando bóveda de cristal...
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ width: '100%', maxWidth: '950px', margin: '30px auto' }}>
      
      {/* Cabecera del Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px', marginBottom: '28px' }}>
        <div>
          <span className="text-muted" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '600' }}>
            Banca Digital Premium
          </span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700', marginTop: '4px', color: 'var(--text-main)' }}>
            {userData?.nombre}
          </h2>
        </div>
        <button onClick={handleLogout} className="bank-btn btn-danger" style={{ width: 'auto', padding: '10px 20px', fontSize: '0.9rem' }}>
          Cerrar Sesión
        </button>
      </div>

      {/* Tarjeta de Saldo Centralizada */}
      <div style={{ padding: '36px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid var(--glass-border)', borderRadius: '16px', textAlign: 'center', marginBottom: '32px', boxShadow: 'inset 0 4px 20px rgba(0, 240, 255, 0.03)' }}>
        <p className="text-muted" style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '2px' }}>
          Saldo Total Disponible
        </p>
        <h1 style={{ color: 'var(--primary)', fontSize: '3.6rem', fontWeight: '800', margin: '12px 0', textShadow: '0 0 24px var(--primary-glow)', letterSpacing: '-1px' }}>
          ${userData?.saldo?.toLocaleString('es-CL')}
        </h1>
      </div>

      {/* Grilla Modular (Distribución 2 columnas en PC, 1 en móviles) */}
      <div className="dashboard-grid">
        {/* Columna Izquierda: Acciones Operativas */}
        <div className="grid-column">
          <TransferForm />
          <SimulatedActions />
        </div>
        
        {/* Columna Derecha: Registro Visual */}
        <div className="grid-column">
          <MovementHistory />
        </div>
      </div>

    </div>
  );
};