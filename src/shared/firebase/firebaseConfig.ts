import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { Logger } from "utils/logger";

const firebaseConfig = {
  apiKey: "AIzaSyBaZ2ewJw0Hf-dtAJKn2AXzjT9_5U44PTo",
  authDomain: "stockflow-wms.firebaseapp.com",
  projectId: "stockflow-wms",
  storageBucket: "stockflow-wms.firebasestorage.app",
  messagingSenderId: "289133893802",
  appId: "1:289133893802:web:ab96e7ade0170d27d7d8d3",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

if (process.env.NODE_ENV === "development") {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, "localhost", 8080);
  connectFunctionsEmulator(functions, "localhost", 5001);
  connectStorageEmulator(storage, "localhost", 9199);
  Logger.info("Running on emulators, localhost:4000");
}
