import { db } from "shared/firebase";
import { IEntry } from "../types";
import { APIError } from "shared/Error";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

export const fetchEntries = async (): Promise<IEntry[]> => {
  try {
    const entriesRef = collection(db, "entries");
    const snapshot = await getDocs(entriesRef);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as IEntry)
    );
  } catch (error) {
    throw new APIError("Failed to fetch entries", error);
  }
};

export const addEntry = async (entry: IEntry): Promise<IEntry> => {
  try {
    const docRef = await addDoc(collection(db, "entries"), entry);
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
    await updateDoc(entryDocRef, { ...values });
    const docSnap = await getDoc(entryDocRef);
    return { id: docSnap.id, ...docSnap.data() } as IEntry;
  } catch (error) {
    throw new APIError("Failed to update entry", error);
  }
};
