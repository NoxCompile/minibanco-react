import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    // BrowserRouter envuelve la app para habilitar la navegación por URL
    <BrowserRouter>
      {/* Routes es el contenedor que evalúa qué ruta coincide con la URL actual */}
      <Routes>
        {/* Definimos que la raíz ("/") muestre el componente Login */}
        <Route path="/" element={<Login />} />
        
        {/* Definimos que "/dashboard" muestre el componente Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;