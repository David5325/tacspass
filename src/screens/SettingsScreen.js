import React, { useState } from "react";
import {
View,
Text,
StyleSheet,
TouchableOpacity,
Alert,
Modal,
TextInput,
} from "react-native";
import { useMode } from "../context/ModeContext";
import { auth } from "../firebase/firebaseConfig";
import {
signOut,
deleteUser,
sendPasswordResetEmail,
verifyBeforeUpdateEmail,
} from "firebase/auth";

export default function SettingsScreen({ navigation }) {
const { isRealMode, setModo } = useMode();
const [modalVisible, setModalVisible] = useState(false);
const [nuevoCorreo, setNuevoCorreo] = useState("");

const handleLogout = async () => {
try {
await signOut(auth);
setModo(false);
navigation.replace("Login");
} catch {
Alert.alert("Error", "No se pudo cerrar sesión");
}
};

const switchToFakeMode = () => {
setModo(false);
navigation.replace("MainTabs");
};

const handleChangeEmail = () => {
setModalVisible(true);
};

const confirmarCambioCorreo = async () => {
if (!nuevoCorreo.trim()) {
Alert.alert("Error", "Por favor ingresa un nuevo correo.");
return;
}

try {
  const user = auth.currentUser;
  await verifyBeforeUpdateEmail(user, nuevoCorreo);
  Alert.alert(
    "Correo enviado",
    "Se ha enviado un enlace al nuevo correo. Confírma tu cuenta desde el enlace para completar el cambio."
  );
  setModalVisible(false);
  setNuevoCorreo("");
} catch (e) {
  console.error(e);
  Alert.alert("Error", e.message);
}


};

const handleChangePassword = async () => {
try {
const user = auth.currentUser;
if (!user?.email) {
Alert.alert("Error", "No se encontró un correo asociado a tu cuenta.");
return;
}
await sendPasswordResetEmail(auth, user.email);
Alert.alert(
"Correo enviado",
"Revisa tu bandeja de entrada para restablecer tu contraseña."
);
} catch (e) {
Alert.alert("Error", e.message);
}
};

const handleDeleteProfile = async () => {
if (!auth.currentUser) return;
Alert.alert(
"Eliminar perfil",
"¿Seguro que quieres eliminar tu perfil? Esta acción no se puede deshacer.",
[
{ text: "Cancelar", style: "cancel" },
{
text: "Eliminar",
style: "destructive",
onPress: async () => {
try {
await deleteUser(auth.currentUser);
setModo(false);
navigation.replace("Login");
} catch (e) {
Alert.alert("Error", e.message);
}
},
},
]
);
};

return (
<View style={styles.container}>
<Text style={styles.title}></Text>

  <TouchableOpacity style={styles.button} onPress={handleLogout}>
    <Text style={styles.buttonText}>Cerrar sesión</Text>
  </TouchableOpacity>

  {isRealMode && (
    <>
      <TouchableOpacity style={styles.button} onPress={switchToFakeMode}>
        <Text style={styles.buttonText}>Entrar al modo falso</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleChangeEmail}>
        <Text style={styles.buttonText}>Cambiar correo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>Cambiar contraseña</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#d9534f" }]}
        onPress={handleDeleteProfile}
      >
        <Text style={styles.buttonText}>Eliminar perfil</Text>
      </TouchableOpacity>
    </>
  )}

  {/* Modal para cambiar correo */}
  <Modal visible={modalVisible} transparent animationType="slide">
    <View style={styles.modalContainer}>
      <View style={styles.modalBox}>
        <Text style={styles.modalTitle}>Cambiar correo</Text>
        <Text style={styles.modalSubtitle}>
          Ingresa el nuevo correo
        </Text>

        
        <TextInput
          style={styles.input}
          placeholder="Introduce tu nuevo correo"
          keyboardType="email-address"
          value={nuevoCorreo}
          onChangeText={setNuevoCorreo}
        />
        <View style={styles.modalActions}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "gray", flex: 1 }]}
            onPress={() => {
              setModalVisible(false);
              setNuevoCorreo("");
            }}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { flex: 1 }]}
            onPress={confirmarCambioCorreo}
          >
            <Text style={styles.buttonText}>Enviar enlace</Text>
            
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
</View>


);
}

const styles = StyleSheet.create({
container: { flex: 1, padding: 20, backgroundColor: "#f2f2f2" },
title: {
fontSize: 22,
fontWeight: "bold",
marginBottom: 20,
textAlign: "center",
},
button: {
backgroundColor: "#007bff",
paddingVertical: 14,
paddingHorizontal: 20,
borderRadius: 10,
marginBottom: 12,
alignItems: "center",
},
buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
modalContainer: {
flex: 1,
justifyContent: "center",
backgroundColor: "rgba(0,0,0,0.5)",
padding: 20,
},
modalBox: {
backgroundColor: "#fff",
borderRadius: 12,
padding: 20,
elevation: 5,
},
modalTitle: {
fontSize: 18,
fontWeight: "bold",
marginBottom: 10,
textAlign: "center",
},
modalSubtitle: {
textAlign: "center",
fontSize: 14,
color: "#555",
marginBottom: 10,
},
input: {
borderWidth: 1,
borderColor: "#ccc",
borderRadius: 8,
padding: 12,
marginBottom: 15,
fontSize: 16,
},
modalActions: {
flexDirection: "row",
justifyContent: "space-between",
gap: 10,
},
});