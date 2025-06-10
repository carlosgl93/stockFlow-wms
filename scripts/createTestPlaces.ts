import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  connectFirestoreEmulator,
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  connectAuthEmulator,
} from "firebase/auth";

// Firebase config for emulator
const firebaseConfig = {
  apiKey: "fake-api-key",
  authDomain: "localhost",
  projectId: "stockflow-wms",
};

const email = "user@admin.com";
const password = "123456";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Connect to emulators
connectFirestoreEmulator(db, "localhost", 8080);
connectAuthEmulator(auth, "http://localhost:9099");

const places = [
  { name: "A-01-1" },
  { name: "A-01-2" },
  { name: "A-02-1" },
  { name: "A-02-2" },
  { name: "B-01-1" },
  { name: "B-01-2" },
  { name: "B-02-1" },
];

async function main() {
  // Authenticate as test user
  await signInWithEmailAndPassword(auth, email, password);

  for (const place of places) {
    await addDoc(collection(db, "places"), place);
    console.log(`Added place: ${place.name}`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
