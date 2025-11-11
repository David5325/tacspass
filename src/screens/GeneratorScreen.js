import React, { useState } from 'react';
import {
View,
Text,
Switch,
Modal,
TouchableOpacity,
StyleSheet,
Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import * as Clipboard from 'expo-clipboard';

function generatePassword(options) {
const {
length,
useUpper,
useLower,
useNumbers,
useSymbols,
noRepeat,
noSequence,
} = options;

const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const lower = 'abcdefghjkmnpqrstuvwxyz';
const numbers = '23456789';
const symbols = '!@#$%^&*()-_=+[]{};:,.<>?';

let allChars = '';
if (useUpper) allChars += upper;
if (useLower) allChars += lower;
if (useNumbers) allChars += numbers;
if (useSymbols) allChars += symbols;

if (!allChars) return '';

let password = '';
let prevChar = '';

while (password.length < length) {
const char = allChars.charAt(Math.floor(Math.random() * allChars.length));

if (noRepeat && password.includes(char)) continue;
if (noSequence && prevChar && Math.abs(char.charCodeAt(0) - prevChar.charCodeAt(0)) === 1)
  continue;

password += char;
prevChar = char;


}

return password;
}

export default function GeneratorScreen() {
const [length, setLength] = useState('12');
const [useUpper, setUseUpper] = useState(true);
const [useLower, setUseLower] = useState(true);
const [useNumbers, setUseNumbers] = useState(true);
const [useSymbols, setUseSymbols] = useState(false);
const [noRepeat, setNoRepeat] = useState(false);
const [noSequence, setNoSequence] = useState(false);
const [generatedPassword, setGeneratedPassword] = useState('');
const [modalVisible, setModalVisible] = useState(false);

const handleGenerate = () => {
const options = {
length: parseInt(length) || 12,
useUpper,
useLower,
useNumbers,
useSymbols,
noRepeat,
noSequence,
};

const pwd = generatePassword(options);
setGeneratedPassword(pwd);
setModalVisible(true);


};

const copyToClipboard = async () => {
await Clipboard.setStringAsync(generatedPassword);
Alert.alert('Copiado', 'La contraseña fue copiada al portapapeles.');
};

return (
<View style={styles.container}>
<Text style={styles.title}>Generador de Contraseña</Text>

  <View style={styles.row}>
    <Text style={styles.label}>Longitud: {length}</Text>
  </View>

  <Slider
    style={{ width: '100%', height: 40 }}
    minimumValue={8}
    maximumValue={64}
    step={1}
    minimumTrackTintColor="#27ae60"
    maximumTrackTintColor="#d3d3d3"
    thumbTintColor="#27ae60"
    value={parseInt(length)}
    onValueChange={(val) => setLength(String(val))}
  />

  <View style={styles.options}>
    {[
      { label: 'Mayúsculas', value: useUpper, set: setUseUpper },
      { label: 'Minúsculas', value: useLower, set: setUseLower },
      { label: 'Números', value: useNumbers, set: setUseNumbers },
      { label: 'Símbolos', value: useSymbols, set: setUseSymbols },
      { label: 'Sin repetidos', value: noRepeat, set: setNoRepeat },
      { label: 'Sin secuencias', value: noSequence, set: setNoSequence },
    ].map((opt, idx) => (
      <View key={idx} style={styles.optionRow}>
        <Text>{opt.label}</Text>
        <Switch
          value={opt.value}
          onValueChange={opt.set}
          trackColor={{ false: '#ccc', true: '#a5d6a7' }}
          thumbColor={opt.value ? '#27ae60' : '#f4f3f4'}
        />
      </View>
    ))}
  </View>

  <TouchableOpacity style={styles.generateButton} onPress={handleGenerate}>
    <Text style={styles.generateButtonText}>Generar Contraseña</Text>
  </TouchableOpacity>

  <Modal
    visible={modalVisible}
    animationType="slide"
    transparent
    onRequestClose={() => setModalVisible(false)}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Tu Contraseña</Text>
        <Text style={styles.generated}>{generatedPassword}</Text>

        <View style={styles.modalButtons}>
          <TouchableOpacity style={styles.modalButton} onPress={copyToClipboard}>
            <Text style={styles.buttonText}>Copiar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modalButton} onPress={handleGenerate}>
            <Text style={styles.buttonText}>Renovar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modalButton, styles.closeButton]}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.buttonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
</View>


);
}

const styles = StyleSheet.create({
container: {
flex: 1,
padding: 20,
backgroundColor: '#f5f6fa',
},
title: {
fontSize: 24,
fontWeight: 'bold',
textAlign: 'center',
marginBottom: 20,
},
row: {
marginBottom: 10,
},
label: {
fontSize: 16,
textAlign: 'center',
},
options: {
marginBottom: 20,
},
optionRow: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
marginVertical: 4,
},
generateButton: {
backgroundColor: '#27ae60',
padding: 12,
borderRadius: 8,
alignItems: 'center',
},
generateButtonText: {
color: '#fff',
fontWeight: 'bold',
fontSize: 16,
},
modalOverlay: {
flex: 1,
justifyContent: 'center',
backgroundColor: 'rgba(0,0,0,0.4)',
padding: 20,
},
modalContent: {
backgroundColor: '#fff',
padding: 20,
borderRadius: 10,
},
modalTitle: {
fontSize: 20,
fontWeight: 'bold',
marginBottom: 15,
textAlign: 'center',
},
generated: {
fontSize: 18,
fontFamily: 'monospace',
textAlign: 'center',
marginBottom: 20,
},
modalButtons: {
flexDirection: 'row',
justifyContent: 'space-between',
},
modalButton: {
backgroundColor: '#007bffff',
padding: 10,
borderRadius: 6,
flex: 1,
marginHorizontal: 5,
},
closeButton: {
backgroundColor: '#e74c3c',
},
buttonText: {
color: '#fff',
textAlign: 'center',
fontWeight: 'bold',
},
});