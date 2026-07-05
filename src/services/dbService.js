// 1. Importación ÚNICA y unificada de todas las herramientas de Firestore
import { 
  doc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  getDocs, 
  runTransaction, 
  serverTimestamp, 
  or, 
  orderBy 
} from "firebase/firestore";
import { db } from "../firebase/config";

// --- TÚNEL DE SALDO ---
export const subscribeToUser = (uid, callback) => {
  const userRef = doc(db, "users", uid);
  return onSnapshot(userRef, (docSnap) => {
    if (docSnap.exists()) callback(docSnap.data());
  });
};

// --- MOTOR DE TRANSFERENCIAS ---
export const executeTransfer = async (senderUid, receiverEmail, amount) => {
  if (amount <= 0) throw new Error("El monto a transferir debe ser mayor a $0.");

  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", receiverEmail));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error("El correo del destinatario no está registrado en XBank.");
  }

  const receiverUid = querySnapshot.docs[0].id;

  if (senderUid === receiverUid) {
    throw new Error("Operación denegada: No puedes transferir dinero a tu propia cuenta.");
  }

  try {
    await runTransaction(db, async (transaction) => {
      const senderRef = doc(db, "users", senderUid);
      const receiverRef = doc(db, "users", receiverUid);

      const senderSnap = await transaction.get(senderRef);
      if (!senderSnap.exists()) throw new Error("La cuenta de origen no existe.");
      
      const senderData = senderSnap.data();
      
      if (senderData.saldo < amount) {
        throw new Error("Fondos insuficientes para realizar esta operación.");
      }

      const receiverSnap = await transaction.get(receiverRef);
      const receiverData = receiverSnap.data();

      transaction.update(senderRef, { saldo: senderData.saldo - amount });
      transaction.update(receiverRef, { saldo: receiverData.saldo + amount });

      const newMovementRef = doc(collection(db, "movimientos"));
      transaction.set(newMovementRef, {
        emisorUid: senderUid,
        emisorEmail: senderData.email,
        receptorUid: receiverUid,
        receptorEmail: receiverData.email,
        monto: amount,
        fecha: serverTimestamp(),
      });
    });

  } catch (error) {
    console.error("Transacción abortada:", error);
    throw error; 
  }
};

// --- TÚNEL DE HISTORIAL ---
// Agregamos "errorCallback" como tercer parámetro
export const subscribeToMovements = (uid, callback, errorCallback) => {
  const movementsRef = collection(db, "movimientos");
  
  const q = query(
    movementsRef,
    or(
      where("emisorUid", "==", uid),
      where("receptorUid", "==", uid)
    ),
    orderBy("fecha", "desc") 
  );

  // Le pasamos el manejador de errores a onSnapshot
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const movements = [];
    querySnapshot.forEach((doc) => {
      movements.push({ id: doc.id, ...doc.data() });
    });
    callback(movements);
  }, (error) => {
    if (errorCallback) errorCallback(error);
  });

  return unsubscribe;
};