import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db, auth } from '../firebase/firebaseConfig';
import { useMode } from '../context/ModeContext';

export default function AccountsScreen() {
  const { isRealMode, datosFalsos, encrypt, decrypt } = useMode();
  const [cuentasReales, setCuentasReales] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [cuentaEditando, setCuentaEditando] = useState(null);
  const [nuevoServicio, setNuevoServicio] = useState('');
  const [nuevoCorreo, setNuevoCorreo] = useState('');
  const [nuevaClave, setNuevaClave] = useState('');
  const [mostrarClave, setMostrarClave] = useState(false);
  const [visibilidad, setVisibilidad] = useState({});
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (isRealMode && userId) {
      fetchCuentasReales();
    } else if (!isRealMode) {
      setCuentasReales(datosFalsos.map((c, i) => ({ id: `falsa-${i}`, ...c })));
    }
  }, [isRealMode, userId, datosFalsos]);

  // 🔐 Traer y descifrar cuentas reales
  async function fetchCuentasReales() {
    try {
      const q = query(collection(db, 'cuentas'), where('userId', '==', userId));
      const snapshot = await getDocs(q);

      const cuentas = await Promise.all(
        snapshot.docs.map(async (d) => {
          const data = d.data();
          return {
            id: d.id,
            nombre: await decrypt(data.nombre),
            correo: await decrypt(data.correo),
            clave: await decrypt(data.clave),
          };
        })
      );

      setCuentasReales(cuentas);
    } catch (err) {
      console.error('Error cargando cuentas:', err);
    }
  }

  const ocultarTexto = (texto = '') => {
    if (!texto) return '';
    if (texto.length <= 3) return '*'.repeat(texto.length);
    const visibles = texto.slice(0, 3);
    return visibles + '*'.repeat(texto.length - 3);
  };

  const toggleVisibilidad = (id) => {
    setVisibilidad((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copiarAlPortapapeles = async (texto, label) => {
    try {
      await Clipboard.setStringAsync(texto);
      Alert.alert('Copiado', `${label} copiado al portapapeles`);
    } catch {
      Alert.alert('Error', 'No se pudo copiar al portapapeles');
    }
  };

  const abrirModal = (cuenta = null) => {
    if (cuenta) {
      setCuentaEditando(cuenta);
      setNuevoServicio(cuenta.nombre || '');
      setNuevoCorreo(cuenta.correo || '');
      setNuevaClave(cuenta.clave || '');
      setModoEdicion(true);
    } else {
      setCuentaEditando(null);
      setNuevoServicio('');
      setNuevoCorreo('');
      setNuevaClave('');
      setModoEdicion(false);
    }
    setMostrarClave(false);
    setModalVisible(true);
  };

  // 🔐 Guardar o actualizar con cifrado
  const guardarCuenta = async () => {
    if (!nuevoServicio.trim() || !nuevoCorreo.trim() || !nuevaClave.trim()) {
      Alert.alert('Campos incompletos', 'Por favor llena todos los datos');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'No hay usuario autenticado');
        return;
      }

      // Cifrar datos antes de guardar (solo modo real)
      const nombreCifrado = await encrypt(nuevoServicio.trim());
      const correoCifrado = await encrypt(nuevoCorreo.trim());
      const claveCifrada = await encrypt(nuevaClave);

      if (modoEdicion && cuentaEditando) {
        await updateDoc(doc(db, 'cuentas', cuentaEditando.id), {
          nombre: nombreCifrado,
          correo: correoCifrado,
          clave: claveCifrada,
        });
        await fetchCuentasReales();
      } else {
        await addDoc(collection(db, 'cuentas'), {
          nombre: nombreCifrado,
          correo: correoCifrado,
          clave: claveCifrada,
          userId: user.uid,
        });
        await fetchCuentasReales();
      }

      setModalVisible(false);
      setCuentaEditando(null);
      setNuevoServicio('');
      setNuevoCorreo('');
      setNuevaClave('');
      setMostrarClave(false);
    } catch (error) {
      console.error('Error al guardar cuenta:', error);
      Alert.alert('Error', 'No se pudo guardar la cuenta');
    }
  };

  async function eliminarCuenta(id) {
    if (!isRealMode) return;
    Alert.alert('Confirmar eliminación', '¿Estás seguro de eliminar esta cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'cuentas', id));
            await fetchCuentasReales();
            Alert.alert('Eliminado', 'La cuenta fue eliminada correctamente');
          } catch {
            Alert.alert('Error', 'No se pudo eliminar la cuenta');
          }
        },
      },
    ]);
  }

  const cuentas = isRealMode
    ? cuentasReales
    : datosFalsos.map((c, index) => ({ ...c, id: `falsa-${index}` }));

  const renderItem = ({ item }) => {
    const visible = visibilidad[item.id] || false;

    return (
      <View style={styles.card}>
        <Text style={styles.label}>{item.nombre}</Text>

        <View style={styles.infoRow}>
          <Text style={{ flex: 1 }}>
            Correo: {visible ? item.correo : ocultarTexto(item.correo)}
          </Text>
          <TouchableOpacity onPress={() => toggleVisibilidad(item.id)}>
            <Ionicons
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color="black"
              style={{ marginHorizontal: 5 }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => copiarAlPortapapeles(item.correo, 'Correo')}
          >
            <Ionicons
              name="copy-outline"
              size={18}
              color="black"
              style={{ marginHorizontal: 5 }}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <Text style={{ flex: 1 }}>
            Contraseña: {visible ? item.clave : ocultarTexto(item.clave)}
          </Text>
          <TouchableOpacity onPress={() => toggleVisibilidad(item.id)}>
            <Ionicons
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color="black"
              style={{ marginHorizontal: 5 }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => copiarAlPortapapeles(item.clave, 'Contraseña')}
          >
            <Ionicons
              name="copy-outline"
              size={18}
              color="black"
              style={{ marginHorizontal: 5 }}
            />
          </TouchableOpacity>
        </View>

        {isRealMode && (
          <View style={styles.iconRow}>
            <TouchableOpacity onPress={() => abrirModal(item)}>
              <Ionicons name="create-outline" size={20} color="#276ef1" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => eliminarCuenta(item.id)}>
              <Ionicons name="trash-outline" size={20} color="red" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Tus cuentas</Text>
      <FlatList data={cuentas} renderItem={renderItem} keyExtractor={(i) => i.id} />

      {isRealMode && (
        <TouchableOpacity style={styles.fab} onPress={() => abrirModal()}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {modoEdicion ? 'Editar cuenta' : 'Nueva cuenta'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Ejemplo: Facebook"
              value={nuevoServicio}
              onChangeText={setNuevoServicio}
            />
            <TextInput
              style={styles.input}
              placeholder="Ejemplo: usuario@gmail.com"
              value={nuevoCorreo}
              onChangeText={setNuevoCorreo}
            />

            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Ejemplo: ********"
                value={nuevaClave}
                onChangeText={setNuevaClave}
                secureTextEntry={!mostrarClave}
              />
              <TouchableOpacity onPress={() => setMostrarClave((s) => !s)}>
                <Ionicons
                  name={mostrarClave ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color="#555"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveBtn]}
                onPress={guardarCuenta}
              >
                <Text style={styles.buttonText}>
                  {modoEdicion ? 'Actualizar' : 'Guardar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f2f2f2' },
  pageTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#2c3e50' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
  },
  label: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  iconRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 20 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 30,
    elevation: 6,
  },
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 12, elevation: 3 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#2c3e50' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  saveBtn: { backgroundColor: '#27ae60' },
  cancelBtn: { backgroundColor: '#95a5a6' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
