import { doc, onSnapshot, collection, query, where, getDocs, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

// --- TÚNEL DE DATOS ---
export const subscribeToUser = (uid, callback) => {
  const userRef = doc(db, "users", uid);
  return onSnapshot(userRef, (docSnap) => {
    if (docSnap.exists()) callback(docSnap.data());
  });
};

// --- MOTOR DE TRANSFERENCIAS ---
/**
 * Ejecuta una transferencia de fondos de forma segura utilizando Transacciones Atómicas.
 */
export const executeTransfer = async (senderUid, receiverEmail, amount) => {
  // 1. Validación de cliente: Monto mayor a cero (Requisito RF3)
  if (amount <= 0) throw new Error("El monto a transferir debe ser mayor a $0.");

  // 2. Buscar al destinatario por su email
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", receiverEmail));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error("El correo del destinatario no está registrado en XBank.");
  }

  // Extraemos el ID real del destinatario
  const receiverUid = querySnapshot.docs[0].id;

  // 3. Validación: No transferirse a sí mismo
  if (senderUid === receiverUid) {
    throw new Error("Operación denegada: No puedes transferir dinero a tu propia cuenta.");
  }

  // 4. LA TRANSACCIÓN ATÓMICA
  try {
    await runTransaction(db, async (transaction) => {
      // Referencias a los documentos involucrados
      const senderRef = doc(db, "users", senderUid);
      const receiverRef = doc(db, "users", receiverUid);

      // FASE DE LECTURA (En transacciones, SIEMPRE se lee primero)
      const senderSnap = await transaction.get(senderRef);
      if (!senderSnap.exists()) throw new Error("La cuenta de origen no existe.");
      
      const senderData = senderSnap.data();
      
      // Validación: Saldo suficiente
      if (senderData.saldo < amount) {
        throw new Error("Fondos insuficientes para realizar esta operación.");
      }

      const receiverSnap = await transaction.get(receiverRef);
      const receiverData = receiverSnap.data();

      // FASE DE ESCRITURA
      // A. Descontamos al emisor
      transaction.update(senderRef, { saldo: senderData.saldo - amount });
      
      // B. Abonamos al receptor
      transaction.update(receiverRef, { saldo: receiverData.saldo + amount });

      // C. Registramos el movimiento para el Historial
      const newMovementRef = doc(collection(db, "movimientos"));
      transaction.set(newMovementRef, {
        emisorUid: senderUid,
        emisorEmail: senderData.email,
        receptorUid: receiverUid,
        receptorEmail: receiverData.email,
        monto: amount,
        fecha: serverTimestamp(), // Hora exacta oficial del servidor
      });
    });

  } catch (error) {
    console.error("Transacción abortada:", error);
    throw error; // Lanzamos el error hacia la interfaz visual
  }
};