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

// You should replace these with actual IDs from your seeded suppliers, transporters, products, and places
const supplierId = "supplier-1";
const transporterId = "transporter-1";
const productIds = ["product-1", "product-2"];
const placeIds = ["A-01-1", "A-01-2", "B-01-1", "B-02-1"];

const entries = [
  {
    supplierId,
    docNumber: "DOC-001",
    transporterId,
    entryDate: "2025-06-10",
    description: "Entry 1 with product 1 at place A-01-1",
    products: [
      {
        id: productIds[0],
        unitsNumber: 10,
        looseUnitsNumber: 2,
        totalUnitsNumber: 12,
        lotId: "LOT-001",
        placeId: placeIds[0],
        expirityDate: "2025-12-31",
        palletNumber: "P-001",
        qPerUnit: 100,
        unitOfMeasure: "ML",
        unitsPerBox: 10,
      },
    ],
  },
  {
    supplierId,
    docNumber: "DOC-002",
    transporterId,
    entryDate: "2025-06-11",
    description: "Entry 2 with product 2 at place A-01-2",
    products: [
      {
        id: productIds[1],
        unitsNumber: 5,
        looseUnitsNumber: 1,
        totalUnitsNumber: 6,
        lotId: "LOT-002",
        placeId: placeIds[1],
        expirityDate: "2025-11-30",
        palletNumber: "P-002",
        qPerUnit: 500,
        unitOfMeasure: "GR",
        unitsPerBox: 5,
      },
    ],
  },
  {
    supplierId,
    docNumber: "DOC-003",
    transporterId,
    entryDate: "2025-06-12",
    description: "Entry 3 with product 1 at place B-01-1",
    products: [
      {
        id: productIds[0],
        unitsNumber: 8,
        looseUnitsNumber: 0,
        totalUnitsNumber: 8,
        lotId: "LOT-003",
        placeId: placeIds[2],
        expirityDate: "2026-01-15",
        palletNumber: "P-003",
        qPerUnit: 100,
        unitOfMeasure: "ML",
        unitsPerBox: 10,
      },
    ],
  },
  {
    supplierId,
    docNumber: "DOC-004",
    transporterId,
    entryDate: "2025-06-13",
    description: "Entry 4 with product 2 at place B-02-1",
    products: [
      {
        id: productIds[1],
        unitsNumber: 12,
        looseUnitsNumber: 3,
        totalUnitsNumber: 15,
        lotId: "LOT-004",
        placeId: placeIds[3],
        expirityDate: "2026-02-20",
        palletNumber: "P-004",
        qPerUnit: 500,
        unitOfMeasure: "GR",
        unitsPerBox: 5,
      },
    ],
  },
];

async function main() {
  // Authenticate as test user
  await signInWithEmailAndPassword(auth, email, password);

  for (const entry of entries) {
    await addDoc(collection(db, "entries"), entry);
    console.log(`Added entry: ${entry.docNumber}`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
