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

  // 🔐 CIFRAR (solo en modo real)
  const encrypt = (data) => {
    if (!isRealMode) return data;
    return encryptData(data, masterKey);
  };

  // 🔐 DESCIFRAR (solo en modo real)
  const decrypt = (cipher) => {
    if (!isRealMode) return null; // ❗ En modo falso NO mostrar cifrado
    return decryptData(cipher, masterKey);
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
