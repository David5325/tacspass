import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { getAuth, PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import { app } from "../firebase/firebaseConfig";
import { useMode } from "../context/ModeContext";

export default function SmsCodeVerificationScreen({ route, navigation }) {
  const { verificationId } = route.params;
  const [code, setCode] = useState("");
  const auth = getAuth(app);
  const { setModo } = useMode();

  const verifyCode = async () => {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await signInWithCredential(auth, credential);


      setModo(true);
      Alert.alert("✅ Verificación exitosa");
      navigation.replace("MainTabs");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "El código es incorrecto o ha expirado");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ingresa el código recibido</Text>
      <TextInput
        style={styles.input}
        placeholder="123456"
        keyboardType="numeric"
        value={code}
        onChangeText={setCode}
        maxLength={6}
      />
      <TouchableOpacity style={styles.button} onPress={verifyCode}>
        <Text style={styles.buttonText}>Verificar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    width: "70%",
    textAlign: "center",
    fontSize: 22,
    letterSpacing: 8,
    backgroundColor: "#fff",
    paddingVertical: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "rgba(0, 123, 255, 1)",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
