import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { subscribeToMovements } from '../services/dbService';

export const MovementHistory = () => {
  const { state } = useContext(AuthContext);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!state.user) return;

    // Abrimos el túnel en tiempo real para el historial
    const unsubscribe = subscribeToMovements(state.user.uid, (data) => {
      setMovements(data);
      setLoading(false);
    });

    // Limpieza estricta de la suscripción al desmontar el componente
    return () => unsubscribe();
  }, [state.user]);

  if (loading) return <p style={{ color: '#8b949e', fontSize: '0.9rem' }}>Cargando movimientos...</p>;

  return (
    <div style={{ marginTop: '30px', padding: '20px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d' }}>
      <h3 style={{ marginTop: 0, color: '#58a6ff', borderBottom: '1px solid #30363d', paddingBottom: '10px' }}>
        Historial de Movimientos
      </h3>

      {movements.length === 0 ? (
        <p style={{ color: '#8b949e', textAlign: 'center', margin: '20px 0' }}>No registras movimientos en tu cuenta aún.</p>
      ) : (
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {movements.map((mov) => {
            // Evaluamos de forma reactiva el tipo de movimiento según el usuario logueado
            const esEmisor = mov.emisorUid === state.user.uid;
            const tipo = esEmisor ? 'Envío' : 'Recepción';
            const contraparte = esEmisor ? mov.receiverEmail : mov.emisorEmail;
            const colorMonto = esEmisor ? '#f85149' : '#3fb950'; // Rojo si envié, Verde si recibí
            const signo = esEmisor ? '-' : '+';

            // Formatear la fecha de Firestore (evitando errores si el server timestamp es null momentáneamente)
            const fechaFormateada = mov.fecha 
              ? new Date(mov.fecha.seconds * 1000).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
              : 'Procesando...';

            return (
              <div key={mov.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #21262d', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ fontWeight: 'bold', color: colorMonto, marginRight: '10px' }}>[{tipo}]</span>
                  <span style={{ color: '#e6edf3' }}>{contraparte}</span>
                  <div style={{ fontSize: '0.75rem', color: '#8b949e', marginTop: '2px' }}>{fechaFormateada}</div>
                </div>
                <div style={{ fontWeight: 'bold', color: colorMonto, fontSize: '1rem' }}>
                  {signo}${mov.monto?.toLocaleString('es-CL')}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};