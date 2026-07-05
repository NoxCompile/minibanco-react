import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// Importamos nuestro Proveedor
import { AuthProvider } from './context/AuthContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Envolvemos la App para que tenga acceso global a la sesión */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)