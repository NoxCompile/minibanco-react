import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { loginUser, registerUser } from '../services/authService';

export const Login = ({ toggleTheme, theme }) => {
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
      setError("Por favor, ingresa tu correo y contraseña.");
      return;
    }

    setLoading(true);

    try {
      let user;
      if (isRegister) {
        if (!nombre.trim()) throw new Error("El nombre es obligatorio para registrarse.");
        user = await registerUser(email, password, nombre);
      } else {
        user = await loginUser(email, password);
      }
      
      dispatch({ type: 'LOGIN', payload: user });
      navigate('/dashboard');
    } catch (err) {
      console.error("🔴 Error capturado:", err);
      setError(err.message || "Error en la autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bank-card" style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
      
      {/* Interruptor de Tema Absoluto */}
      <button 
        onClick={toggleTheme} 
        style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', opacity: '0.8' }}
        title="Alternar tema visual"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-main)' }}>XBank</h2>
        <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '4px' }}>
          {isRegister ? 'Crea tu cuenta digital en segundos' : 'Ingresa a tu banca en línea'}
        </p>
      </div>
      
      {error && <div className="error-alert">{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {isRegister && (
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nombre Completo</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} disabled={loading} className="bank-input" placeholder="Juan Pérez" />
          </div>
        )}
        
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Correo Electrónico</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className="bank-input" placeholder="nombre@correo.com" />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className="bank-input" placeholder="••••••••" />
        </div>
        
        <button type="submit" disabled={loading} className="bank-btn bank-btn-primary" style={{ marginTop: '8px' }}>
          {loading ? 'Procesando...' : (isRegister ? 'Registrarse' : 'Iniciar Sesión')}
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
        <span style={{ padding: '0 10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>o</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
      </div>

      <button type="button" onClick={() => { setIsRegister(!isRegister); setError(null); }} disabled={loading} className="bank-btn" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
        {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
      </button>
    </div>
  );
};