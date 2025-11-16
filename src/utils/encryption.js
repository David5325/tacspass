import CryptoJS from "react-native-crypto-js";

// Cifrar texto
export async function encryptData(text, masterKey) {
    try {
        const encrypted = CryptoJS.AES.encrypt(text, masterKey).toString();
        return encrypted;
    } catch (err) {
        console.log("Error al cifrar:", err);
        return null;
    }
}

// Descifrar texto
export async function decryptData(cipherText, masterKey) {
    try {
        if (!cipherText) return "";

        const bytes = CryptoJS.AES.decrypt(cipherText, masterKey);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

        return decrypted || "";
    } catch (err) {
        console.log("Error al descifrar:", err);
        return "ERROR";
    }
}
