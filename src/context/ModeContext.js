import React, { createContext, useState, useContext } from "react";
import { generarDatosFalsos } from "../utils/fakeDataGenerator";
import { encryptData, decryptData } from "../utils/encryption";

const ModeContext = createContext();

export function ModeProvider({ children }) {
  const [isRealMode, setIsRealMode] = useState(true);
  const [datosFalsos, setDatosFalsos] = useState([]);
  const [masterKey, setMasterKey] = useState("");

  // Cambiar de modo real a falso
  const setModo = (modoReal, clave = "") => {
    setIsRealMode(modoReal);

    if (modoReal) {
      // Guardar clave maestra para cifrar/descifrar
      setMasterKey(clave);
    } else {
      // Generar datos falsos locales
      const nuevos = generarDatosFalsos();
      setDatosFalsos(nuevos);
      setMasterKey("");
    }
  };

  // 🔐 CIFRAR (solo en modo real) - CON AWAIT
  const encrypt = async (data) => {
    if (!isRealMode) return data;
    try {
      return await encryptData(data, masterKey);
    } catch (error) {
      console.error("Error encriptando:", error);
      return data; // Fallback: retorna dato sin encriptar
    }
  };

  // 🔐 DESCIFRAR (solo en modo real) - CON AWAIT
  const decrypt = async (cipher) => {
    if (!isRealMode || !cipher) return cipher;
    try {
      const result = await decryptData(cipher, masterKey);
      return result || cipher; // Si falla la desencriptación, retorna el original
    } catch (error) {
      console.error("Error desencriptando:", error);
      return cipher; // Fallback: retorna el dato cifrado
    }
  };

  return (
    <ModeContext.Provider
      value={{
        isRealMode,
        setModo,
        datosFalsos,
        encrypt,
        decrypt,
        masterKey,
        setMasterKey,
      }}
    >
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  return useContext(ModeContext);
}