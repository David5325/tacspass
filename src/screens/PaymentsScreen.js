import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Alert, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMode } from '../context/ModeContext';
import { auth, db } from '../firebase/firebaseConfig';
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, query, where } from 'firebase/firestore';
import * as Clipboard from 'expo-clipboard';
import { generarTarjetasFalsas } from '../utils/generarTarjetasFalsas';

export default function PaymentsScreen() {
  const [tarjetas, setTarjetas] = useState([]);
  const [visibles, setVisibles] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [tarjetaActual, setTarjetaActual] = useState({ id: '', banco: '', numero: '', cvv: '', fecha: '' });
  const { isRealMode } = useMode();

  useEffect(() => {
    if (isRealMode) cargarTarjetasReales();
    else setTarjetas(generarTarjetasFalsas(4));
  }, [isRealMode]);

  const cargarTarjetasReales = async () => {
    try {
      const q = query(collection(db, 'tarjetas'), where('uid', '==', auth.currentUser.uid));
      const snap = await getDocs(q);
      setTarjetas(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las tarjetas');
    }
  };

  const validarTarjeta = () => {
    const { banco, numero, cvv, fecha } = tarjetaActual;
    if (!banco || !numero || !cvv || !fecha) {
      Alert.alert('Campos incompletos', 'Todos los campos son obligatorios');
      return false;
    }
    if (!/^\d{16}$/.test(numero)) {
      Alert.alert('Número inválido', 'Debe tener 16 dígitos');
      return false;
    }
    if (!/^\d{3}$/.test(cvv)) {
      Alert.alert('CVV inválido', 'Debe tener 3 dígitos');
      return false;
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(fecha)) {
      Alert.alert('Fecha inválida', 'Debe tener el formato MM/AA');
      return false;
    }
    return true;
  };

  const guardarTarjeta = async () => {
    if (!validarTarjeta()) return;

    const { banco, numero, cvv, fecha } = tarjetaActual;

    try {
      if (modoEdicion) {
        await updateDoc(doc(db, 'tarjetas', tarjetaActual.id), { banco, numero, cvv, fecha });
      } else {
        await addDoc(collection(db, 'tarjetas'), {
          banco, numero, cvv, fecha, uid: auth.currentUser.uid,
        });
      }
      setModalVisible(false);
      setTarjetaActual({ id: '', banco: '', numero: '', cvv: '', fecha: '' });
      cargarTarjetasReales();
    } catch {
      Alert.alert('Error', 'No se pudo guardar la tarjeta');
    }
  };

  const eliminarTarjeta = (id) => {
    if (!isRealMode) return;
    Alert.alert(
      'Confirmar eliminación',
      '¿Deseas eliminar esta tarjeta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive', onPress: async () => {
            try {
              await deleteDoc(doc(db, 'tarjetas', id));
              cargarTarjetasReales();
              Alert.alert('Eliminada', 'Tarjeta eliminada correctamente');
            } catch {
              Alert.alert('Error', 'No se pudo eliminar la tarjeta');
            }
          }
        }
      ]
    );
  };

  const copiarNumero = async (num) => {
    try {
      await Clipboard.setStringAsync(num);
      Alert.alert('Copiado', 'Número copiado al portapapeles');
    } catch {
      Alert.alert('Error', 'No se pudo copiar');
    }
  };

  const toggleVisible = (id, campo) => {
    setVisibles(prev => ({
      ...prev,
      [id]: { ...prev[id], [campo]: !prev[id]?.[campo] },
    }));
  };

  const abrirModal = (modoEditar = false, tarjeta = null) => {
    if (modoEditar && tarjeta) {
      setModoEdicion(true);
      setTarjetaActual(tarjeta);
    } else {
      setModoEdicion(false);
      setTarjetaActual({ id: '', banco: '', numero: '', cvv: '', fecha: '' });
    }
    setModalVisible(true);
  };

  const ocultarNumero = (num = '') => {
    if (num.length <= 4) return '*'.repeat(num.length);
    return '************' + num.slice(-4);
  };

  const renderItem = ({ item }) => {
    const mostrarNumero = visibles[item.id]?.numero || false;
    const mostrarCVV = visibles[item.id]?.cvv || false;
    const mostrarFecha = visibles[item.id]?.fecha || false;

    return (
      <View style={styles.card}>
        <Text style={styles.label}>{item.banco}</Text>

        <View style={styles.infoRow}>
          <Text style={{ flex: 1 }}>Número: {mostrarNumero ? item.numero : ocultarNumero(item.numero)}</Text>
          <TouchableOpacity onPress={() => toggleVisible(item.id, 'numero')}>
            <Ionicons name={mostrarNumero ? 'eye-off-outline' : 'eye-outline'} size={18} color="#555" style={{ marginHorizontal: 5 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => copiarNumero(item.numero)}>
            <Ionicons name="copy-outline" size={18} color="#555" style={{ marginHorizontal: 5 }} />
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <Text style={{ flex: 1 }}>CVV: {mostrarCVV ? item.cvv : '***'}</Text>
          <TouchableOpacity onPress={() => toggleVisible(item.id, 'cvv')}>
            <Ionicons name={mostrarCVV ? 'eye-off-outline' : 'eye-outline'} size={18} color="#555" style={{ marginHorizontal: 5 }} />
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <Text style={{ flex: 1 }}>Fecha: {mostrarFecha ? item.fecha : '**/**'}</Text>
          <TouchableOpacity onPress={() => toggleVisible(item.id, 'fecha')}>
            <Ionicons name={mostrarFecha ? 'eye-off-outline' : 'eye-outline'} size={18} color="#555" style={{ marginHorizontal: 5 }} />
          </TouchableOpacity>
        </View>

        {isRealMode && (
          <View style={styles.iconRow}>
            <TouchableOpacity onPress={() => abrirModal(true, item)}>
              <Ionicons name="create-outline" size={20} color="#276ef1" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => eliminarTarjeta(item.id)}>
              <Ionicons name="trash-outline" size={20} color="red" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Tus tarjetas</Text>
      <FlatList data={tarjetas} renderItem={renderItem} keyExtractor={(i) => i.id} />

      {isRealMode && (
        <TouchableOpacity style={styles.fab} onPress={() => abrirModal()}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{modoEdicion ? 'Editar tarjeta' : 'Nueva tarjeta'}</Text>

            <TextInput style={styles.input} placeholder="Nombre del banco" value={tarjetaActual.banco} onChangeText={(t) => setTarjetaActual(p => ({ ...p, banco: t }))} />
            <TextInput style={styles.input} placeholder="Número (16 dígitos)" value={tarjetaActual.numero} onChangeText={(t) => setTarjetaActual(p => ({ ...p, numero: t }))} keyboardType="number-pad" maxLength={16} />
            <TextInput style={styles.input} placeholder="CVV (3 dígitos)" value={tarjetaActual.cvv} onChangeText={(t) => setTarjetaActual(p => ({ ...p, cvv: t }))} keyboardType="number-pad" maxLength={3} />
            <TextInput style={styles.input} placeholder="Fecha (MM/AA)" value={tarjetaActual.fecha} onChangeText={(t) => {
              let soloNumeros = t.replace(/[^0-9]/g, '');
              if (soloNumeros.length > 2) soloNumeros = soloNumeros.slice(0, 2) + '/' + soloNumeros.slice(2, 4);
              setTarjetaActual(p => ({ ...p, fecha: soloNumeros }));
            }} keyboardType="number-pad" maxLength={5} />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.saveBtn]} onPress={guardarTarjeta}>
                <Text style={styles.buttonText}>{modoEdicion ? 'Actualizar' : 'Guardar'}</Text>
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
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 15, elevation: 2 },
  label: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  iconRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 20 },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#27ae60', padding: 15, borderRadius: 30, elevation: 6 },
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 12, elevation: 3 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#2c3e50' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, fontSize: 16, backgroundColor: '#fff', marginBottom: 15 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  saveBtn: { backgroundColor: '#27ae60' },
  cancelBtn: { backgroundColor: '#95a5a6' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
