import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
  FlatList,
} from "react-native";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { getAuth, signInWithPhoneNumber } from "firebase/auth";
import { app } from "../firebase/firebaseConfig";

export default function PhoneNumberScreen({ navigation }) {
  const auth = getAuth(app);
  const recaptchaVerifier = useRef(null);

  const [prefix, setPrefix] = useState(""); // vacío al inicio
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const countryPrefixes = [
    { code: "93", name: "Afganistán" },
    { code: "54", name: "Argentina" },
    { code: "213", name: "Argelia" },
    { code: "61", name: "Australia" },
    { code: "55", name: "Brasil" },
    { code: "32", name: "Bélgica" },
    { code: "57", name: "Colombia" },
    { code: "86", name: "China" },
    { code: "53", name: "Cuba" },
    { code: "34", name: "España" },
    { code: "33", name: "Francia" },
    { code: "1", name: "Estados Unidos / Canadá" },
    { code: "36", name: "Hungría" },
    { code: "91", name: "India" },
    { code: "62", name: "Indonesia" },
    { code: "98", name: "Irán" },
    { code: "39", name: "Italia" },
    { code: "81", name: "Japón" },
    { code: "52", name: "México" },
    { code: "47", name: "Noruega" },
    { code: "51", name: "Perú" },
    { code: "48", name: "Polonia" },
    { code: "7", name: "Rusia / Kazajistán" },
    { code: "40", name: "Rumania" },
    { code: "44", name: "Reino Unido" },
    { code: "41", name: "Suiza" },
    { code: "27", name: "Sudáfrica" },
    { code: "211", name: "Sudán del Sur" },
    { code: "65", name: "Singapur" },
    { code: "46", name: "Suecia" },
    { code: "60", name: "Malasia" },
    { code: "56", name: "Chile" },
    { code: "20", name: "Egipto" },
    { code: "66", name: "Tailandia" },
    { code: "90", name: "Turquía" },
    { code: "84", name: "Vietnam" },
    { code: "58", name: "Venezuela" },
    { code: "63", name: "Filipinas" },
    { code: "64", name: "Nueva Zelanda" },
    { code: "43", name: "Austria" },
    { code: "94", name: "Sri Lanka" },
    { code: "95", name: "Myanmar" },
    { code: "212", name: "Marruecos" },
  ];

  // Orden alfabético
  countryPrefixes.sort((a, b) => a.name.localeCompare(b.name, "es"));

  const sendVerification = async () => {
    if (!prefix) {
      Alert.alert("Selecciona un prefijo", "Debes escoger un prefijo antes de continuar.");
      return;
    }
    const phoneNumber = `+${prefix}${number}`;
    try {
      setLoading(true);
      const phoneProvider = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifier.current
      );
      Alert.alert("Código enviado", "Revisa tus mensajes SMS 📱");

      navigation.navigate("SmsCodeVerification", {
        verificationId: phoneProvider.verificationId,
      });
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "No se pudo enviar el SMS");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={app.options}
      />

      <Text style={styles.title}>Verificación por SMS</Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.prefixContainer}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.prefixText}>
            {prefix ? `+${prefix}` : "▼"} {/* Flecha si no hay selección */}
          </Text>
        </TouchableOpacity>

        <TextInput
          placeholder="3001112233"
          keyboardType="phone-pad"
          value={number}
          onChangeText={setNumber}
          style={styles.numberInput}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={sendVerification}
        disabled={loading || !number}
      >
        <Text style={styles.buttonText}>
          {loading ? "Enviando..." : "Enviar código"}
        </Text>
      </TouchableOpacity>

      {/* Modal con lista de países */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={{ flex: 1, paddingTop: 50 }}>
          <FlatList
            data={countryPrefixes}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setPrefix(item.code);
                  setModalVisible(false);
                }}
              >
                <Text style={{ fontSize: 18 }}>
                  {item.name} (+{item.code})
                </Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={[styles.button, { margin: 20 }]}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.buttonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  row: {
    flexDirection: "row",
    width: "80%",
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  prefixContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 10,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  prefixText: { fontSize: 18 },
  numberInput: {
    flex: 2,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
  },
  button: {
    backgroundColor: "rgba(0, 123, 255, 1)",
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  title: { fontSize: 20, marginBottom: 15 },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
});
