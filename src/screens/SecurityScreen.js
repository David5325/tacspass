import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Picker } from "@react-native-picker/picker";
import { useMode } from "../context/ModeContext";
import { auth, db } from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { generarDireccionesFalsas } from "../utils/fakeAddressGenerator";

const LETRAS = ["", ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))];
const TIPOS = ["Calle", "Carrera", "Avenida", "Transversal", "Diagonal"];
const COMPLEMENTOS = ["", "Norte", "Sur", "Oriente", "Occidente"];

function formatearDireccion(p) {
  const letra1 = p.letra1 ? ` ${p.letra1}` : "";
  const letra2 = p.letra2 ? ` ${p.letra2}` : "";
  const n3 = p.numero3 ? ` - ${p.numero3}` : "";
  const comp = p.complemento ? ` ${p.complemento}` : "";
  const extra = p.detallesExtra ? `, ${p.detallesExtra}` : "";
  return `${p.tipo} ${p.numero1}${letra1} # ${p.numero2}${letra2}${n3}${comp}${extra}`
    .replace(/\s+/g, " ")
    .trim();
}

export default function SecurityScreen() {
  const { isRealMode } = useMode();
  const [direcciones, setDirecciones] = useState([]);
  const [visibles, setVisibles] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  const [form, setForm] = useState({
    id: "",
    etiqueta: "",
    tipo: "",
    numero1: "",
    letra1: "",
    numero2: "",
    letra2: "",
    numero3: "",
    complemento: "",
    detallesExtra: "",
  });

  useEffect(() => {
    if (isRealMode) {
      cargarDireccionesReales();
    } else {
      const falsas = generarDireccionesFalsas(4);
      setDirecciones(falsas);
    }
  }, [isRealMode]);

  async function cargarDireccionesReales() {
    try {
      const q = query(collection(db, "direcciones"), where("uid", "==", auth.currentUser.uid));
      const snap = await getDocs(q);
      const datos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setDirecciones(datos);
    } catch {
      Alert.alert("Error", "No se pudieron cargar las direcciones");
    }
  }

  function abrirModal(edit = false, item = null) {
    if (edit && item) {
      setModoEdicion(true);
      setForm({
        id: item.id,
        etiqueta: item.etiqueta || "",
        tipo: item.tipo || "",
        numero1: item.numero1 || "",
        letra1: item.letra1 || "",
        numero2: item.numero2 || "",
        letra2: item.letra2 || "",
        numero3: item.numero3 || "",
        complemento: item.complemento || "",
        detallesExtra: item.detallesExtra || "",
      });
    } else {
      setModoEdicion(false);
      setForm({
        id: "",
        etiqueta: "",
        tipo: "",
        numero1: "",
        letra1: "",
        numero2: "",
        letra2: "",
        numero3: "",
        complemento: "",
        detallesExtra: "",
      });
    }
    setModalVisible(true);
  }

  function validar() {
    if (!form.etiqueta.trim()) return Alert.alert("Falta etiqueta", "Ej: Casa, Trabajo");
    if (!form.numero1.trim()) return Alert.alert("Falta número principal", "Ingresa el primer número");
    if (!form.numero2.trim()) return Alert.alert("Falta número secundario", "Ingresa el segundo número");
    if (!/^\d+$/.test(form.numero1) || !/^\d+$/.test(form.numero2))
      return Alert.alert("Formato inválido", "Los números deben ser numéricos");
    if (form.numero3 && !/^\d+$/.test(form.numero3))
      return Alert.alert("Formato inválido", "El número final debe ser numérico");
    return true;
  }

  async function guardar() {
    if (!validar()) return;

    const payload = {
      etiqueta: form.etiqueta.trim(),
      tipo: form.tipo,
      numero1: form.numero1.trim(),
      letra1: form.letra1,
      numero2: form.numero2.trim(),
      letra2: form.letra2,
      numero3: form.numero3.trim(),
      complemento: form.complemento,
      detallesExtra: form.detallesExtra.trim(),
      direccion: formatearDireccion(form),
      uid: auth.currentUser.uid,
    };

    try {
      if (modoEdicion) await updateDoc(doc(db, "direcciones", form.id), payload);
      else await addDoc(collection(db, "direcciones"), payload);
      setModalVisible(false);
      await cargarDireccionesReales();
    } catch {
      Alert.alert("Error", "No se pudo guardar la dirección");
    }
  }

  async function eliminar(id) {
    if (!isRealMode) return;

    Alert.alert("Confirmar eliminación", "¿Estás seguro de que deseas eliminar esta dirección?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "direcciones", id));
            await cargarDireccionesReales();
            Alert.alert("Eliminado", "La dirección fue eliminada correctamente");
          } catch {
            Alert.alert("Error", "No se pudo eliminar la dirección");
          }
        },
      },
    ]);
  }

  function toggleVisible(id) {
    setVisibles((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function copiar(direccion) {
    try {
      await Clipboard.setStringAsync(direccion);
      Alert.alert("Copiado", "Dirección copiada al portapapeles");
    } catch {
      Alert.alert("Error", "No se pudo copiar");
    }
  }

  const renderItem = ({ item }) => {
    const mostrar = !!visibles[item.id];
    const mascara = "***************";

    return (
      <View style={styles.card}>
        <Text style={styles.etiqueta}>{item.etiqueta || "Sin etiqueta"}</Text>
        <View style={styles.row}>
          <Text style={styles.direccion}>{mostrar ? item.direccion : mascara}</Text>
          <TouchableOpacity onPress={() => toggleVisible(item.id)} style={styles.iconBtn}>
            <Ionicons name={mostrar ? "eye-off" : "eye"} size={20} color="#555" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => copiar(item.direccion)} style={styles.iconBtn}>
            <Ionicons name="copy-outline" size={20} color="#555" />
          </TouchableOpacity>
        </View>

        {isRealMode && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => abrirModal(true, item)}>
              <Ionicons name="create-outline" size={22} color="#276ef1" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => eliminar(item.id)}>
              <Ionicons name="trash-outline" size={22} color="#d00" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Título igual que cuentas (texto solicitado) */}
      <Text style={styles.pageTitle}>Tus direcciones</Text>

      <FlatList data={direcciones} keyExtractor={(i) => i.id} renderItem={renderItem} />

      {isRealMode && (
        <TouchableOpacity style={styles.fab} onPress={() => abrirModal(false)}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <ScrollView contentContainerStyle={styles.modal}>
          <Text style={styles.title}>{modoEdicion ? "Editar" : "Agregar"} dirección</Text>
          <Text style={styles.example}>Ej: Calle 65 M # 90 K - 67 Sur</Text>

          <TextInput
            placeholder="Etiqueta (Ej: Casa, Trabajo)"
            value={form.etiqueta}
            onChangeText={(etiqueta) => setForm((p) => ({ ...p, etiqueta }))}
            style={styles.input}
          />

          <View style={styles.rowInline}>
            <View style={[styles.pickerWrap, { flex: 1.3 }]}>
              <Text style={styles.smallLabel}>Tipo</Text>
              <Picker selectedValue={form.tipo} onValueChange={(tipo) => setForm((p) => ({ ...p, tipo }))}>
                {TIPOS.map((t) => (
                  <Picker.Item key={t} label={t} value={t} />
                ))}
              </Picker>
            </View>

            <View style={[styles.inputWrap, { flex: 1 }]}>
              <Text style={styles.smallLabel}>#</Text>
              <TextInput
                placeholder="65"
                keyboardType="numeric"
                value={form.numero1}
                onChangeText={(numero1) => setForm((p) => ({ ...p, numero1 }))}
                style={styles.input}
              />
            </View>

            <View style={[styles.pickerWrap, { flex: 1 }]}>
              <Text style={styles.smallLabel}>Letra</Text>
              <Picker selectedValue={form.letra1} onValueChange={(letra1) => setForm((p) => ({ ...p, letra1 }))}>
                {LETRAS.map((l) => (
                  <Picker.Item key={l || "v1"} label={l || "—"} value={l} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.rowInline}>
            <Text style={[styles.smallLabel, { marginTop: 16, marginRight: 8 }]}>#</Text>
            <View style={[styles.inputWrap, { flex: 1 }]}>
              <TextInput
                placeholder="90"
                keyboardType="numeric"
                value={form.numero2}
                onChangeText={(numero2) => setForm((p) => ({ ...p, numero2 }))}
                style={styles.input}
              />
            </View>
            <View style={[styles.pickerWrap, { flex: 1 }]}>
              <Text style={styles.smallLabel}>Letra</Text>
              <Picker selectedValue={form.letra2} onValueChange={(letra2) => setForm((p) => ({ ...p, letra2 }))}>
                {LETRAS.map((l) => (
                  <Picker.Item key={l || "v2"} label={l || "—"} value={l} />
                ))}
              </Picker>
            </View>
            <Text style={[styles.smallLabel, { marginTop: 16, marginLeft: 8, marginRight: 8 }]}>-</Text>
            <View style={[styles.inputWrap, { flex: 1 }]}>
              <TextInput
                placeholder="67"
                keyboardType="numeric"
                value={form.numero3}
                onChangeText={(numero3) => setForm((p) => ({ ...p, numero3 }))}
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.rowInline}>
            <View style={[styles.pickerWrap, { flex: 1.2 }]}>
              <Text style={styles.smallLabel}>Complemento</Text>
              <Picker
                selectedValue={form.complemento}
                onValueChange={(complemento) => setForm((p) => ({ ...p, complemento }))}
              >
                {COMPLEMENTOS.map((c) => (
                  <Picker.Item key={c || "vC"} label={c || "—"} value={c} />
                ))}
              </Picker>
            </View>
          </View>

          <Text style={styles.smallLabel}>Detalles extra (opcional)</Text>
          <TextInput
            placeholder="Ej: Torre 23, Apto 123"
            value={form.detallesExtra}
            onChangeText={(detallesExtra) => setForm((p) => ({ ...p, detallesExtra }))}
            style={styles.input}
          />

           <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.btn, styles.cancelBtn]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.btnText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
  style={[styles.btn, styles.saveBtn]}
  onPress={guardar}
>
  <Text style={styles.btnText}>{modoEdicion ? "Actualizar" : "Guardar"}</Text>
</TouchableOpacity>

          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f2f2f2" },
  pageTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#2c3e50" },
  modal: { padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  example: { fontSize: 14, color: "#555", marginBottom: 15, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 15,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 15,
  },
  inputWrap: { flex: 1, marginBottom: 15 },
  smallLabel: { fontSize: 13, fontWeight: "500", color: "#555", marginBottom: 4 },
  rowInline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    gap: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
  },
  etiqueta: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  direccion: { flex: 1, fontSize: 16, color: "#333" },
  row: { flexDirection: "row", alignItems: "center", marginVertical: 6 },
  iconBtn: { marginLeft: 10 },
  actions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10, gap: 20 },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#4CAF50", 
    padding: 15,
    borderRadius: 30,
    elevation: 6,
    justifyContent: "center",
    alignItems: "center",
  },
   buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  saveBtn: {
    backgroundColor: "#27ae60", 
  },
  cancelBtn: {
    backgroundColor: "#95a5a6", 
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
