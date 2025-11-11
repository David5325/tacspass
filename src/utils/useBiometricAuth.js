import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';

export async function autenticarBiometricamente() {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  if (!compatible) {
    Alert.alert('Error', 'Tu dispositivo no es compatible con autenticación biométrica.');
    return false;
  }

  const registrado = await LocalAuthentication.isEnrolledAsync();
  if (!registrado) {
    Alert.alert('Error', 'No hay datos biométricos registrados en este dispositivo.');
    return false;
  }

  const resultado = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Autenticación requerida',
    fallbackLabel: 'Usar contraseña',
  });

  return resultado.success;
}
