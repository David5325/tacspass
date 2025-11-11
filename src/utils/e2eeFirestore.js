import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { encryptData, decryptData } from './crypto';
import { db } from '../firebase/firebaseConfig';


export async function addEncryptedDoc(collectionName, data) {
  try {
    const encryptedData = {};
    for (const key in data) {
      encryptedData[key] = encryptData(data[key]);
    }
    await addDoc(collection(db, collectionName), encryptedData);
  } catch (error) {
    console.error('Error al guardar documento cifrado:', error);
  }
}

export async function getDecryptedDocs(collectionName) {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    const docs = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const decryptedData = {};
      for (const key in data) {
        decryptedData[key] = decryptData(data[key]);
      }
      docs.push({ id: docSnap.id, ...decryptedData });
    });
    return docs;
  } catch (error) {
    console.error('Error al leer documentos cifrados:', error);
    return [];
  }
}

export async function updateEncryptedDoc(collectionName, id, newData) {
  try {
    const ref = doc(db, collectionName, id);
    const encryptedData = {};
    for (const key in newData) {
      encryptedData[key] = encryptData(newData[key]);
    }
    await updateDoc(ref, encryptedData);
  } catch (error) {
    console.error('Error al actualizar documento cifrado:', error);
  }
}

export async function deleteEncryptedDoc(collectionName, id) {
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (error) {
    console.error('Error al eliminar documento cifrado:', error);
  }
}
