import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

/**
 * Registra un nuevo usuario en Firebase Auth y crea su perfil en Firestore
 * con el saldo inicial obligatorio de $100.000.
 */
export const registerUser = async (email, password, nombre) => {
  try {
    // 1. Creamos la credencial en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Creamos su documento en la colección 'users' de Firestore
    // Usamos el mismo UID de Auth como ID del documento para vincularlos exactamente.
    await setDoc(doc(db, "users", user.uid), {
      nombre: nombre,
      email: email,
      saldo: 100000 // Requisito RF1: Saldo inicial
    });

    return user;
  } catch (error) {
    console.error("Error en el registro:", error);
    throw error; // Lanzamos el error para que la Interfaz de Usuario lo atrape y lo muestre
  }
};

/**
 * Inicia sesión con un usuario existente.
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error en el login:", error);
    throw error;
  }
};

/**
 * Cierra la sesión activa.
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error cerrando sesión:", error);
    throw error;
  }
};