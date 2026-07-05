import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { logoutUser } from '../services/authService';
import { subscribeToUser } from '../services/dbService';
import { TransferForm } from '../components/TransferForm';

export const Dashboard = () => {
  const { state, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  // Estados locales para los datos bancarios y la pantalla de carga
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // useEffect se ejecuta cuando el componente se dibuja en pantalla
  useEffect(() => {
    // 1. Protección de ruta: Si nadie ha iniciado sesión, lo echamos al Login
    if (!state.user) {
      navigate('/');
      return;
    }

    // 2. Abrimos el túnel de datos usando nuestro servicio
    const unsubscribe = subscribeToUser(state.user.uid, (data) => {
      setUserData(data);
      setLoading(false); // Apagamos la pantalla de carga al recibir los datos
    });

    // 3. LA REGLA DE ORO: Función de limpieza
    // Cuando el usuario cambie de pantalla o cierre sesión, apagamos el túnel.
    return () => {
      unsubscribe();
    };
  }, [state.user, navigate]); // Dependencias del useEffect

  // Handler para el cierre de sesión (RF5)
  const handleLogout = async () => {
    try {
      await logoutUser();
      dispatch({ type: 'LOGOUT' }); // Limpiamos el cerebro global
      navigate('/'); // Lo devolvemos al Login
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  // Estado de carga explícito 
  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Cargando la bóveda...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', border: '1px solid #30363d', borderRadius: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #30363d', paddingBottom: '10px' }}>
        <h2>Hola, {userData?.nombre}</h2>
        <button onClick={handleLogout} style={{ padding: '8px 15px', background: '#f85149', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Cerrar Sesión
        </button>
      </div>

      <div style={{ marginTop: '30px', padding: '30px', background: '#161b22', color: '#58a6ff', borderRadius: '8px', textAlign: 'center' }}>
        <p style={{ margin: '0', color: '#8b949e', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Saldo Disponible</p>
        <h1 style={{ margin: '10px 0', fontSize: '3rem' }}>
          ${userData?.saldo?.toLocaleString('es-CL')}
        </h1>
      </div>
      {/* AQUÍ INYECTAMOS EL NUEVO COMPONENTE */}
    <TransferForm />
    </div>
  );
};
