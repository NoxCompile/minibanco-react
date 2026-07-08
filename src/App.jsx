import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('banco_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('banco_theme', theme);
  }, [theme]);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login changeTheme={changeTheme} theme={theme} />} />
        <Route path="/dashboard" element={<Dashboard changeTheme={changeTheme} theme={theme} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;