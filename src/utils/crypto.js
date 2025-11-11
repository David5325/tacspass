import CryptoJS from 'crypto-js';

const SECRET_KEY = 'tacspass-2025-super-secret-key';

export function encryptData(text) {
  try {
    if (!text) return '';
    const ciphertext = CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
    return ciphertext;
  } catch (error) {
    console.error('Error al cifrar:', error);
    return text;
  }
}

export function decryptData(ciphertext) {
  try {
    if (!ciphertext) return '';
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
  } catch (error) {
    console.error('Error al descifrar:', error);
    return ciphertext;
  }
}
