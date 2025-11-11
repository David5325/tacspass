import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';

export default function VerificationChoiceScreen({ navigation }) {
  async function handleBiometricVerification() {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        Alert.alert('No disponible', 'Tu dispositivo no soporta autenticación biométrica');
        return;
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        Alert.alert('No configurado', 'No tienes datos biométricos registrados');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verifica tu identidad',
        fallbackLabel: 'Usar contraseña',
      });

      if (result.success) {
        Alert.alert('Verificación exitosa ✅');
        navigation.replace('MainTabs');
      } else {
        Alert.alert('Error', 'No se pudo verificar');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un problema con la autenticación');
    }
  }

  return (
    <View style={styles.container}>
      <Ionicons name="shield-checkmark-outline" size={80} color="#007bff" />
      <Text style={styles.title}>Verificación de identidad</Text>
      <Text style={styles.subtitle}>
        Elige cómo deseas verificar tu identidad antes de acceder a tu cuenta.
      </Text>

      <TouchableOpacity
        style={[styles.option, { backgroundColor: '#007bff' }]}
        onPress={handleBiometricVerification}
      >
        <Ionicons name="finger-print-outline" size={26} color="#fff" />
        <Text style={styles.optionText}>Verificación biométrica</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, { backgroundColor: '#28a745' }]}
        onPress={() => navigation.navigate('PhoneNumber')}
      >
        <Ionicons name="mail-outline" size={26} color="#fff" />
        <Text style={styles.optionText}>Verificación por SMS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f2f2f2', padding: 25 },
  title: { fontSize: 22, fontWeight: 'bold', marginTop: 10, marginBottom: 5, textAlign: 'center' },
  subtitle: { textAlign: 'center', fontSize: 16, color: '#555', marginBottom: 30 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '85%',
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
  },
  optionText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
});
