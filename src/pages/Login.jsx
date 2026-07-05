import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { loginUser, registerUser } from '../services/authService';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Correo y contraseña son obligatorios.");
      return;
    }

    setLoading(true);

    try {
      let user;
      if (isRegister) {
        if (!nombre.trim()) throw new Error("El nombre es obligatorio.");
        user = await registerUser(email, password, nombre);
      } else {
        user = await loginUser(email, password);
      }
      dispatch({ type: 'LOGIN', payload: user });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || "Error en la autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bank-card" style={{ width: '100%', maxWidth: '420px' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--primary)' }}>XBank</h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          {isRegister ? 'Crea tu cuenta digital en segundos' : 'Ingresa a tu banca en línea'}
        </p>
      </div>
      
      {error && (
        <div style={{ color: 'var(--danger)', background: 'rgba(248,81,73,0.1)', padding: '12px', borderRadius: '10px', marginBottom: '16px', fontSize: '0.9rem', border: '1px solid rgba(248,81,73,0.2)' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {isRegister && (
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--muted)' }}>Nombre</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} disabled={loading} className="bank-input" placeholder="Juan Pérez" />
          </div>
        )}
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--muted)' }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className="bank-input" placeholder="correo@xbank.com" />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--muted)' }}>Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className="bank-input" placeholder="••••••••" />
        </div>
        <button type="submit" disabled={loading} className="bank-btn bank-btn-primary" style={{ marginTop: '8px' }}>
          {loading ? 'Procesando...' : (isRegister ? 'Registrarse' : 'Iniciar Sesión')}
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
        <span style={{ padding: '0 10px', fontSize: '0.8rem', color: 'var(--muted)' }}>o</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
      </div>
      <button type="button" onClick={() => { setIsRegister(!isRegister); setError(null); }} disabled={loading} className="bank-btn bank-btn-secondary">
        {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
      </button>
    </div>
  );
};