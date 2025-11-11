import React, { createContext, useState, useContext } from 'react';
import { generarDatosFalsos } from '../utils/fakeDataGenerator';

const ModeContext = createContext();

export function ModeProvider({ children }) {
  const [isRealMode, setIsRealMode] = useState(true);
  const [datosFalsos, setDatosFalsos] = useState([]);

  const setModo = (modo) => {
    setIsRealMode(modo);
    if (!modo) {
      const nuevosDatos = generarDatosFalsos();
      setDatosFalsos(nuevosDatos);
    }
  };

  return (
    <ModeContext.Provider value={{ isRealMode, setModo, datosFalsos }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  return useContext(ModeContext);
}
