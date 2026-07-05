// Importamos las funciones necesarias desde la librería de Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Objeto de configuración que lee nuestras variables seguras
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializamos la aplicación de Firebase
const app = initializeApp(firebaseConfig);

// Exportamos "auth" (para el login/registro) y "db" (para base de datos)
// Al exportarlos, cualquier parte de nuestra app podrá usarlos fácilmente.
export const auth = getAuth(app);
export const db = getFirestore(app);