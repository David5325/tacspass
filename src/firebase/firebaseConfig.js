import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyD1cgowbDKuY3Lnpas5mOAwG7jfY-ZU82c",
  authDomain: "tacspass.firebaseapp.com",
  projectId: "tacspass",
  storageBucket: "tacspass.appspot.com",
  messagingSenderId: "770386564091",
  appId: "1:770386564091:web:6ca0af9125ff82560c315e"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { app, auth, db };
