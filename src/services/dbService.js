import { doc, onSnapshot, collection, query, where, getDocs, runTransaction, serverTimestamp, or, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";

export const subscribeToUser = (uid, callback) => {
  const userRef = doc(db, "users", uid);
  return onSnapshot(userRef, (docSnap) => {
    if (docSnap.exists()) callback(docSnap.data());
  });
};

export const executeTransfer = async (senderUid, receiverEmail, amount) => {
  if (amount <= 0) throw new Error("El monto debe ser mayor a $0.");

  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", receiverEmail));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) throw new Error("Destinatario no registrado.");
  
  const receiverUid = querySnapshot.docs[0].id;
  if (senderUid === receiverUid) throw new Error("No puedes transferir a tu propia cuenta.");

  try {
    await runTransaction(db, async (transaction) => {
      const senderRef = doc(db, "users", senderUid);
      const receiverRef = doc(db, "users", receiverUid);

      const senderSnap = await transaction.get(senderRef);
      if (!senderSnap.exists()) throw new Error("La cuenta origen no existe.");
      
      const senderData = senderSnap.data();
      if (senderData.saldo < amount) throw new Error("Fondos insuficientes.");

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
    throw error;
  }
};

export const subscribeToMovements = (uid, callback, errorCallback) => {
  const movementsRef = collection(db, "movimientos");
  const q = query(movementsRef, or(where("emisorUid", "==", uid), where("receptorUid", "==", uid)), orderBy("fecha", "desc"));

  return onSnapshot(q, (querySnapshot) => {
    const movements = [];
    querySnapshot.forEach((doc) => movements.push({ id: doc.id, ...doc.data() }));
    callback(movements);
  }, (error) => {
    if (errorCallback) errorCallback(error);
  });
};

export const simulateTransaction = async (uid, email, type, amount) => {
  if (amount <= 0) throw new Error("El monto debe ser mayor a $0.");

  try {
    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, "users", uid);
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) throw new Error("La cuenta no existe.");
      
      const userData = userSnap.data();
      let newSaldo = userData.saldo;

      if (type === 'deposito') {
        newSaldo += amount;
      } else if (type === 'retiro') {
        if (userData.saldo < amount) throw new Error("Fondos insuficientes para el retiro.");
        newSaldo -= amount;
      }

      transaction.update(userRef, { saldo: newSaldo });

      const newMovementRef = doc(collection(db, "movimientos"));
      transaction.set(newMovementRef, {
        emisorUid: type === 'retiro' ? uid : 'sistema_central',
        emisorEmail: type === 'retiro' ? email : 'Cajero Automático',
        receptorUid: type === 'deposito' ? uid : 'sistema_central',
        receptorEmail: type === 'deposito' ? email : 'Cajero Automático',
        monto: amount,
        fecha: serverTimestamp(),
      });
    });
  } catch (error) {
    throw error;
  }
};