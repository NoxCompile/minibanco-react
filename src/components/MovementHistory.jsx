import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { subscribeToMovements } from '../services/dbService';

export const MovementHistory = () => {
  const { state } = useContext(AuthContext);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [queryError, setQueryError] = useState(null);

  useEffect(() => {
    if (!state.user) return;
    const unsubscribe = subscribeToMovements(state.user.uid, 
      (data) => { setMovements(data); setLoading(false); },
      (error) => { setQueryError("Falta índice compuesto en Firebase."); setLoading(false); }
    );
    return () => unsubscribe();
  }, [state.user]);

  if (loading) return <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Cargando cartola...</p>;
  if (queryError) return <div style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{queryError}</div>;

  return (
    <div style={{ padding: '20px', background: 'var(--surface-inner)', border: '1px solid var(--border)', borderRadius: '14px' }}>
      <h3 style={{ color: 'var(--text)', fontSize: '1.05rem', marginBottom: '14px', fontWeight: '600' }}>Movimientos Recientes</h3>
      {movements.length === 0 ? (
        <p style={{ color: 'var(--muted)', textAlign: 'center', fontSize: '0.9rem' }}>Sin actividad reciente.</p>
      ) : (
        <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {movements.map((mov) => {
            const esEmisor = mov.emisorUid === state.user.uid;
            const contraparte = esEmisor ? mov.receiverEmail : mov.emisorEmail;
            const color = esEmisor ? 'var(--danger)' : 'var(--success)';
            const bg = esEmisor ? 'rgba(248,81,73,0.08)' : 'rgba(63,185,80,0.08)';
            const fecha = mov.fecha ? new Date(mov.fecha.seconds * 1000).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Validando...';

            return (
              <div key={mov.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '4px 8px', borderRadius: '6px', background: bg, color }}>
                    {esEmisor ? 'Cargo' : 'Abono'}
                  </span>
                  <div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text)' }}>{contraparte}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{fecha}</span>
                  </div>
                </div>
                <div style={{ fontWeight: '700', color, fontSize: '1.05rem' }}>
                  {esEmisor ? '-' : '+'}${mov.monto?.toLocaleString('es-CL')}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};