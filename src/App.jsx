import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

function App() {
  // Lógica de Persistencia del Tema (Bonus: Modo Oscuro/Claro)
  const [theme, setTheme] = useState(localStorage.getItem('banco_theme') || 'dark');

  useEffect(() => {
    // Inyecta el tema en la raíz del HTML y lo guarda de por vida en el navegador
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('banco_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login toggleTheme={toggleTheme} theme={theme} />} />
        <Route path="/dashboard" element={<Dashboard toggleTheme={toggleTheme} theme={theme} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;