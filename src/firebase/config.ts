import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Connect to Firebase Emulators in development mode
// Set VITE_USE_EMULATORS=true in .env.local to enable
const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true';

if (useEmulators) {
  console.log('🔧 Connecting to Firebase Emulators...');

  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    console.log('  ✅ Auth Emulator connected (port 9099)');
  } catch (e) {
    console.warn('  ⚠️ Auth Emulator already connected or unavailable');
  }

  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('  ✅ Firestore Emulator connected (port 8080)');
  } catch (e) {
    console.warn('  ⚠️ Firestore Emulator already connected or unavailable');
  }

  try {
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('  ✅ Storage Emulator connected (port 9199)');
  } catch (e) {
    console.warn('  ⚠️ Storage Emulator already connected or unavailable');
  }

  try {
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('  ✅ Functions Emulator connected (port 5001)');
  } catch (e) {
    console.warn('  ⚠️ Functions Emulator already connected or unavailable');
  }

  console.log('🎉 Firebase Emulators ready! UI at http://localhost:4000');
}

export default app;
