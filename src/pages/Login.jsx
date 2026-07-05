import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { loginUser, registerUser } from '../services/authService';

export const Login = () => {
  // 1. Estados para Formularios Controlados (React es la fuente de la verdad)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');

  // 2. Estados de la interfaz: Carga, Error y Modo (Login vs Registro)
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // 3. Traemos la función dispatch de nuestro Estado Global y el navegador de rutas
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  // 4. Handlers nombrados explícitamente
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleNombreChange = (e) => setNombre(e.target.value);

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError(null); // Limpiamos errores al cambiar de pantalla
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // CRÍTICO: Evita que la página se recargue al enviar
    setError(null);
    setLoading(true); // Deshabilitamos los botones

    try {
      let user;
      if (isRegister) {
        // Validación previa antes de tocar Firebase
        if (!nombre.trim()) throw new Error("El nombre es obligatorio para registrarse.");
        user = await registerUser(email, password, nombre);
      } else {
        user = await loginUser(email, password);
      }

      // Si todo sale bien, disparamos la acción global de LOGIN
      dispatch({ type: 'LOGIN', payload: user });

      // Y redirigimos al usuario al panel principal
      navigate('/dashboard');

    } catch (err) {
      // Atrapamos el error y lo mostramos en la interfaz de forma explícita
      setError(err.message || "Error en la autenticación");
    } finally {
      setLoading(false); // Siempre detenemos el estado de carga, pase lo que pase
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h2>{isRegister ? 'Crear Cuenta XBank' : 'Iniciar Sesión'}</h2>
      
      {/* Muestra de error explícito */}
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        {isRegister && (
          <div style={{ marginBottom: '10px' }}>
            <label>Nombre completo:</label>
            <input 
              type="text" 
              value={nombre} 
              onChange={handleNombreChange} 
              disabled={loading} 
              style={{ width: '100%' }}
            />
          </div>
        )}
        
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={handleEmailChange} 
            required 
            disabled={loading} 
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>Contraseña:</label>
          <input 
            type="password" 
            value={password} 
            onChange={handlePasswordChange} 
            required 
            disabled={loading} 
            style={{ width: '100%' }}
          />
        </div>
        
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
          {loading ? 'Procesando...' : (isRegister ? 'Registrarse' : 'Ingresar')}
        </button>
      </form>

      <button onClick={toggleMode} disabled={loading} style={{ width: '100%', padding: '10px' }}>
        {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
      </button>
    </div>
  );
};