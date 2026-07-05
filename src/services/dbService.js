import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

/**
 * Crea una suscripción en tiempo real al documento de un usuario.
 * @param {string} uid - El ID del usuario.
 * @param {function} callback - Función que se ejecuta cada vez que los datos cambian.
 * @returns {function} - Retorna la función para cancelar la suscripción (unsubscribe).
 */
export const subscribeToUser = (uid, callback) => {
  const userRef = doc(db, "users", uid);
  
  // onSnapshot mantiene una conexión viva con Firestore
  const unsubscribe = onSnapshot(userRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    } else {
      console.error("No se encontró el documento del usuario");
    }
  });

  // Retornamos el interruptor para apagar esta conexión cuando sea necesario
  return unsubscribe;
};