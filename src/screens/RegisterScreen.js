import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);

  const validarPassword = (pwd) => {
    const errors = [];
    if (pwd.length < 8) errors.push('Mínimo 8 caracteres');
    if (!/[A-Z]/.test(pwd)) errors.push('Una mayúscula');
    if (!/[a-z]/.test(pwd)) errors.push('Una minúscula');
    if (!/[0-9]/.test(pwd)) errors.push('Un número');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) errors.push('Un símbolo');
    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const handleRegister = async () => {
    if (!validarPassword(password)) {
      Alert.alert('Contraseña débil', 'Revisa los requisitos antes de continuar.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      Alert.alert(
        'Verificación enviada',
        'Revisa tu correo y verifica tu cuenta antes de iniciar sesión.'
      );
      navigation.navigate('Login');
    } catch (error) {
      console.log(error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear cuenta</Text>

      <TextInput
        placeholder="Correo electrónico"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Contraseña"
          style={[styles.input, { flex: 1, borderBottomWidth: 0 }]}
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            validarPassword(t);
          }}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#555" />
        </TouchableOpacity>
      </View>

      {password.length > 0 && (
        <View style={styles.validationBox}>
          <Text style={styles.validationTitle}>Requisitos:</Text>
          {['Mínimo 8 caracteres', 'Una mayúscula', 'Una minúscula', 'Un número', 'Un símbolo'].map(
            (req) => (
              <Text
                key={req}
                style={{ color: passwordErrors.includes(req) ? 'red' : 'green' }}
              >
                {passwordErrors.includes(req) ? '✗' : '✓'} {req}
              </Text>
            )
          )}
        </View>
      )}

      <TouchableOpacity style={styles.btn} onPress={handleRegister}>
        <Text style={styles.btnText}>Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, gap: 15 },
  title: { fontSize: 28, textAlign: 'center', marginBottom: 30 },
  input: { borderBottomWidth: 1, borderColor: '#aaa', padding: 10, fontSize: 16 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: '#aaa' },
  validationBox: { marginTop: 10, backgroundColor: '#f5f5f5', padding: 10, borderRadius: 8 },
  validationTitle: { fontWeight: 'bold', marginBottom: 4 },
  btn: { backgroundColor: '#007bff', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  link: { textAlign: 'center', color: '#007bff', marginTop: 10 },
});
