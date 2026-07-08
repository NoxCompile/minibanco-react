import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { loginUser, registerUser } from '../services/authService';

export const Login = ({ changeTheme, theme }) => {
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
      setError(err.message || "Error en la autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Menú Desplegable Anclado a la PANTALLA (No a la tarjeta) */}
      <div style={{ position: 'fixed', top: '24px', right: '32px', zIndex: 1000 }}>
        <select 
          className="theme-select"
          value={theme}
          onChange={(e) => changeTheme(e.target.value)}
        >
          <option value="dark">Tema: Oscuro</option>
          <option value="light">Tema: Claro</option>
        </select>
      </div>

      <div className="bank-card" style={{ width: '100%', maxWidth: '420px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px', marginTop: '8px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>XBank</h2>
          <p className="text-muted" style={{ fontSize: '0.95rem', marginTop: '6px' }}>
            {isRegister ? 'Crea tu cuenta digital en segundos' : 'Ingresa a tu banca en línea'}
          </p>
        </div>
        
        {error && <div className="error-alert">{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isRegister && (
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>Nombre Completo</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} disabled={loading} className="bank-input" placeholder="Juan Pérez" />
            </div>
          )}
          
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>Correo Electrónico</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className="bank-input" placeholder="nombre@correo.com" />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className="bank-input" placeholder="••••••••" />
          </div>
          
          <button type="submit" disabled={loading} className="bank-btn bank-btn-primary" style={{ marginTop: '12px' }}>
            {loading ? 'Procesando...' : (isRegister ? 'Registrarse' : 'Iniciar Sesión')}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          <span style={{ padding: '0 12px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>O</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
        </div>

        <button type="button" onClick={() => { setIsRegister(!isRegister); setError(null); }} disabled={loading} className="bank-btn" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
          {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </button>
      </div>
    </>
  );
};