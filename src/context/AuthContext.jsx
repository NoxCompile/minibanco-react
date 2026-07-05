import { createContext, useReducer } from 'react';

// 1. Creamos el "Altavoz" (Contexto)
export const AuthContext = createContext();

// 2. Definimos el estado inicial (Por defecto, nadie ha iniciado sesión)
const initialState = {
  user: null,
  isAuthenticated: false,
};

// 3. El "Guardia de Seguridad" (Reducer) que decide cómo cambia el estado
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload, // Guardamos los datos del usuario que llega
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null, // Borramos los datos
        isAuthenticated: false,
      };
    default:
      return state;
  }
};

// 4. El Componente Proveedor que envolverá nuestra aplicación
export const AuthProvider = ({ children }) => {
  // Conectamos el estado inicial con nuestro reducer
  const [state, dispatch] = useReducer(authReducer, initialState);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};