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

const suppliers = [
  {
    company: "Acme Chemicals",
    idNumber: "20123456789",
    businessCategory: "Chemicals",
    county: "Santiago",
    region: "Metropolitana",
    fax: "123-4567",
    phone: "987654321",
    website: "https://acmechem.com",
    email: "contact@acmechem.com",
    address: "Av. Siempre Viva 123",
    contact: {
      name: "John Doe",
      email: "jdoe@acmechem.com",
      phone: "987654321",
    },
  },
  {
    company: "AgroInsumos Ltda",
    idNumber: "20987654321",
    businessCategory: "Agro",
    county: "Rancagua",
    region: "O'Higgins",
    fax: "222-3333",
    phone: "912345678",
    website: "https://agroinsumos.cl",
    email: "ventas@agroinsumos.cl",
    address: "Ruta 5 Sur Km 90",
    contact: {
      name: "Maria Perez",
      email: "mperez@agroinsumos.cl",
      phone: "912345678",
    },
  },
];

const transporters = [
  {
    name: "Transporte Sur",
    id: "transporter-1",
  },
  {
    name: "Logística Express",
    id: "transporter-2",
  },
  {
    name: "Camiones del Norte",
    id: "transporter-3",
  },
];

async function main() {
  // Authenticate as test user
  await signInWithEmailAndPassword(auth, email, password);

  for (const supplier of suppliers) {
    await addDoc(collection(db, "suppliers"), supplier);
    console.log(`Added supplier: ${supplier.company}`);
  }

  for (const transporter of transporters) {
    await addDoc(collection(db, "transporters"), transporter);
    console.log(`Added transporter: ${transporter.name}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
