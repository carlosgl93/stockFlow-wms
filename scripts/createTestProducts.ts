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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Connect to emulators
connectFirestoreEmulator(db, "localhost", 8080);
connectAuthEmulator(auth, "http://localhost:9099");

const products = [
  {
    extCode: "EXT001",
    internalCode: "INT001",
    name: "producto a",
    price: 100,
    warehouseStock: 50,
    riskCategory: "Toxic",
    category: "Acaricide",
    selectionType: "unit",
    boxDetails: {
      units: 10,
      quantity: 100,
      unitOfMeasure: "ML",
      container: "Bidon",
      type: "Plastic",
      kilos: 1,
      height: 20,
      width: 10,
      depth: 10,
      unitsPerSurface: 4,
      palletType: "Standard",
    },
  },
  {
    extCode: "EXT002",
    internalCode: "INT002",
    name: "producto b",
    price: 200,
    warehouseStock: 30,
    riskCategory: "NonToxic",
    category: "Fungicide",
    selectionType: "unit",
    boxDetails: {
      units: 5,
      quantity: 500,
      unitOfMeasure: "Gram",
      container: "Bolsa",
      type: "Paper",
      kilos: 2.5,
      height: 15,
      width: 8,
      depth: 8,
      unitsPerSurface: 2,
      palletType: "Standard",
    },
  },
];

async function main() {
  // Authenticate as test user
  await signInWithEmailAndPassword(auth, "admin@gmail.com", "123456");

  for (const product of products) {
    await addDoc(collection(db, "products"), product);
    console.log(`Added product: ${product.name}`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
