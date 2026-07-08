import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { subscribeToMovements } from '../services/dbService';

export const MovementHistory = () => {
  const { state } = useContext(AuthContext);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filterType, setFilterType] = useState('all'); 
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!state.user) return;
    const unsubscribe = subscribeToMovements(state.user.uid, 
      (data) => { setMovements(data); setLoading(false); },
      (error) => { console.error(error); setLoading(false); }
    );
    return () => unsubscribe();
  }, [state.user]);

  const filteredMovements = movements.filter(mov => {
    const esEmisor = mov.emisorUid === state.user.uid;
    const contraparte = esEmisor ? mov.receptorEmail : mov.emisorEmail;
    
    if (filterType === 'sent' && !esEmisor) return false;
    if (filterType === 'received' && esEmisor) return false;
    if (searchTerm && !contraparte.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    return true;
  });

  if (loading) return <p className="text-muted">Cargando cartola...</p>;

  return (
    <div className="glass-panel" style={{ height: '100%' }}>
      <h3 className="panel-title">Movimientos Recientes</h3>
      
      <div className="filter-controls">
        <input 
          type="text" 
          placeholder="Buscar destinatario/emisor..." 
          className="bank-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="filter-buttons">
          <button className={`filter-btn ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>Todos</button>
          <button className={`filter-btn ${filterType === 'received' ? 'active' : ''}`} onClick={() => setFilterType('received')}>Abonos</button>
          <button className={`filter-btn ${filterType === 'sent' ? 'active' : ''}`} onClick={() => setFilterType('sent')}>Cargos</button>
        </div>
      </div>

      {filteredMovements.length === 0 ? (
        <p className="text-muted text-center" style={{marginTop: '24px'}}>No se encontraron movimientos en los registros.</p>
      ) : (
        <div className="history-list">
          {filteredMovements.map((mov) => {
            const esEmisor = mov.emisorUid === state.user.uid;
            const contraparte = esEmisor ? mov.receptorEmail : mov.emisorEmail;
            
            const colorMonto = esEmisor ? 'var(--text-main)' : 'var(--success)';
            const bgBadge = esEmisor ? 'rgba(220, 38, 38, 0.2)' : 'rgba(22, 163, 74, 0.2)';
            const colorBadge = esEmisor ? 'var(--danger)' : 'var(--success)';
            
            const fecha = mov.fecha ? new Date(mov.fecha.seconds * 1000).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Procesando...';

            return (
              <div key={mov.id} className="history-item">
                <div className="history-info">
                  <div className="badge" style={{ background: bgBadge, color: colorBadge }}>
                    {esEmisor ? 'Cargo' : 'Abono'}
                  </div>
                  <div className="history-text">
                    <div className="contraparte" title={contraparte}>{contraparte}</div>
                    <div className="fecha">{fecha}</div>
                  </div>
                </div>
                <div className="history-monto" style={{ color: colorMonto }}>
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