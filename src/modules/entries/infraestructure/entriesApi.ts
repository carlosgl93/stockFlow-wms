import { db } from "shared/firebase";
import { IEntry } from "../types";
import { APIError, ValidationError } from "shared/Error";
import { dateVO } from "utils/format";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

export const fetchEntries = async (
  page: number,
  pageSize: number,
  lastVisible: string | null
): Promise<IEntry[]> => {
  try {
    const entriesRef = collection(db, "entries");
    let q = query(entriesRef, orderBy("createdAt"), limit(pageSize));
    if (lastVisible) {
      const lastVisibleDoc = await getDoc(doc(db, "entries", lastVisible));
      q = query(
        entriesRef,
        orderBy("createdAt"),
        startAfter(lastVisibleDoc),
        limit(pageSize)
      );
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as IEntry)
    );
  } catch (error) {
    throw new APIError("Failed to fetch entries", error);
  }
};

export const addEntry = async (entry: IEntry): Promise<IEntry> => {
  try {
    const entriesRef = collection(db, "entries");
    const q = query(entriesRef, where("docNumber", "==", entry.docNumber));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      throw new ValidationError(
        "Validation Error: Entry with this docNumber already exists"
      );
    }

    // Ensure entry has a valid productId and lotId
    const productDoc = await getDoc(doc(db, "products", entry.productId));
    if (!productDoc.exists()) {
      throw new ValidationError("Validation Error: Invalid productId");
    }

    const lotDoc = await getDoc(doc(db, "lots", entry.lotId));
    if (!lotDoc.exists()) {
      throw new ValidationError("Validation Error: Invalid lotId");
    }

    // Add createdAt timestamp
    entry.createdAt = dateVO.now();

    const docRef = await addDoc(entriesRef, entry);
    const docSnap = await getDoc(docRef);
    return { id: docSnap.id, ...docSnap.data() } as IEntry;
  } catch (error) {
    throw new APIError("Failed to add entry", error);
  }
};

export const updateEntry = async ({
  entryId,
  values,
}: {
  entryId: string;
  values: IEntry;
}): Promise<IEntry> => {
  try {
    const entryDocRef = doc(db, "entries", entryId);

    // Ensure entry has a valid productId and lotId
    const productDoc = await getDoc(doc(db, "products", values.productId));
    if (!productDoc.exists()) {
      throw new ValidationError("Validation Error: Invalid productId");
    }

    const lotDoc = await getDoc(doc(db, "lots", values.lotId));
    if (!lotDoc.exists()) {
      throw new ValidationError("Validation Error: Invalid lotId");
    }

    await updateDoc(entryDocRef, { ...values, updatedAt: dateVO.now() });
    const docSnap = await getDoc(entryDocRef);
    return { id: docSnap.id, ...docSnap.data() } as IEntry;
  } catch (error) {
    throw new APIError("Failed to update entry", error);
  }
};

export const removeEntry = async (entryId: string): Promise<void> => {
  try {
    const entryDocRef = doc(db, "entries", entryId);
    await deleteDoc(entryDocRef);

    // Ensure stock is updated and history is logged
    const entryDoc = await getDoc(entryDocRef);
    if (entryDoc.exists()) {
      const entryData = entryDoc.data() as IEntry;
      const stockRef = doc(db, "stock", entryData.stockId);
      const stockDoc = await getDoc(stockRef);
      if (stockDoc.exists()) {
        const stockData = stockDoc.data();
        await updateDoc(stockRef, {
          unitsNumber: stockData.unitsNumber - entryData.unitsNumber,
          looseUnitsNumber:
            stockData.looseUnitsNumber - entryData.looseUnitsNumber,
          updatedAt: serverTimestamp(),
        });
      }
    }
  } catch (error) {
    throw new APIError("Failed to remove entry", error);
  }
};
