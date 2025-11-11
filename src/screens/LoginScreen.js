import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useMode } from "../context/ModeContext";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { setModo } = useMode();

  const handleLogin = async () => {
    try {
      // Intentamos login real en Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        Alert.alert(
          "Correo no verificado",
          "Por favor verifica tu correo antes de continuar."
        );
        return;
      }

      // Usuario real y verificado
      setModo(true);
      navigation.navigate("VerificationChoice", { mode: "real" });

    } catch (error) {
      // Si falla login, entramos en modo falso
      setModo(false);
      navigation.replace("MainTabs");
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Ingresa tu correo", "Debes ingresar tu correo para restablecer la contraseña.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Correo enviado", "Revisa tu correo para restablecer la contraseña.");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>

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
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color="#555"
          />
        </TouchableOpacity>
      </View>

      {/* Botón idéntico al de RegisterScreen */}
      <TouchableOpacity style={styles.btn} onPress={handleLogin}>
        <Text style={styles.btnText}>Ingresar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResetPassword}>
        <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 20, gap: 15 },
  title: { fontSize: 28, textAlign: "center", marginBottom: 30 },
  input: { borderBottomWidth: 1, borderColor: "#aaa", padding: 10, fontSize: 16 },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#aaa",
  },
  btn: { 
    backgroundColor: "#007bff", 
    padding: 15, 
    borderRadius: 10, 
    alignItems: "center", 
    marginTop: 10 
  },
  btnText: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "bold" 
  },
  link: { 
    textAlign: "center", 
    color: "#007bffff", 
    marginTop: 10 
  },
});
