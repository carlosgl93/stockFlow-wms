import { db } from "shared/firebase";
import { IEntry } from "../types";
import { APIError, ValidationError } from "shared/Error";
import { dateVO } from "utils/format";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  runTransaction,
  DocumentReference,
} from "firebase/firestore";
import { Logger } from "utils/logger";
import { IStock } from "modules/stock/types";

export const fetchEntries = async (
  page: number,
  pageSize: number,
  lastVisible: string | null
): Promise<IEntry[]> => {
  Logger.info("fetchEntries", { page, pageSize, lastVisible });
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
      (doc) => ({ ...doc.data(), id: doc.id } as IEntry)
    );
  } catch (error) {
    throw new APIError("Failed to fetch entries", error);
  }
};

export const addEntry = async (entry: IEntry): Promise<IEntry> => {
  try {
    const now = dateVO.now();
    return await runTransaction(db, async (transaction) => {
      const entriesRef = collection(db, "entries");

      // Check if docNumber already exists
      const q = query(entriesRef, where("docNumber", "==", entry.docNumber));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        throw new ValidationError("Entry with this docNumber already exists.");
      }

      // Validate product
      const productRef = doc(db, "products", entry.productId);
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists()) {
        throw new ValidationError("Invalid productId.");
      }

      // Validate place
      if (entry.placeId) {
        const placeRef = doc(db, "places", entry.placeId);
        const placeDoc = await transaction.get(placeRef);
        if (!placeDoc.exists()) {
          throw new ValidationError("Invalid placeId.");
        }
      }

      // Validate or generate lotId
      let lotId = entry.lotId || doc(collection(db, "lots")).id;
      if (!lotId) {
        lotId = doc(collection(db, "lots")).id; // Create a new lot if not provided
      }

      // Query stock using productId and lotId
      const stockQuery = query(
        collection(db, "stock"),
        where("productId", "==", entry.productId),
        where("lotId", "==", lotId)
      );
      const stockSnapshot = await getDocs(stockQuery);

      let stockRef: DocumentReference;
      let stockData: IStock | null = null;

      if (!stockSnapshot.empty) {
        // Use existing stock entry
        stockRef = stockSnapshot.docs[0].ref;
        stockData = stockSnapshot.docs[0].data() as IStock;
        transaction.update(stockRef, {
          unitsNumber: stockData.unitsNumber + entry.unitsNumber,
          looseUnitsNumber: stockData.looseUnitsNumber + entry.looseUnitsNumber,
          updatedAt: now,
        });
      } else {
        // Create new stock entry
        stockRef = doc(collection(db, "stock"));
        transaction.set(stockRef, {
          id: stockRef.id,
          productId: entry.productId,
          lotId: lotId,
          unitsNumber: entry.unitsNumber,
          looseUnitsNumber: entry.looseUnitsNumber,
          createdAt: now,
          updatedAt: now,
        });
      }

      // Store the entry
      entry.stockId = stockRef.id;
      entry.lotId = lotId;
      entry.createdAt = now;
      delete entry.id;
      const entryRef = await addDoc(entriesRef, entry);
      entry.id = entryRef.id;

      // Add or update LotProduct entry
      const lotProductQuery = query(
        collection(db, "lotProducts"),
        where("productId", "==", entry.productId),
        where("lotId", "==", lotId)
      );
      const lotProductSnapshot = await getDocs(lotProductQuery);

      if (!lotProductSnapshot.empty) {
        const lotProductRef = doc(
          db,
          "lotProducts",
          lotProductSnapshot.docs[0].id
        );
        const lotProductData = lotProductSnapshot.docs[0].data();
        transaction.update(lotProductRef, {
          unitsNumber: (lotProductData.unitsNumber || 0) + entry.unitsNumber,
          looseUnitsNumber:
            (lotProductData.looseUnitsNumber || 0) + entry.looseUnitsNumber,
        });
      } else {
        const lotProductRef = doc(collection(db, "lotProducts"));
        transaction.set(lotProductRef, {
          id: lotProductRef.id,
          lotId: lotId,
          productId: entry.productId,
          unitsNumber: entry.unitsNumber,
          looseUnitsNumber: entry.looseUnitsNumber,
        });
      }

      return entry;
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
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
    return await runTransaction(db, async (transaction) => {
      const entryDocRef = doc(db, "entries", entryId);
      if (!values.stockId) {
        throw new ValidationError("StockId is required.");
      }
      const stockRef = doc(db, "stock", values.stockId);
      const lotProductQuery = query(
        collection(db, "lotProducts"),
        where("productId", "==", values.productId),
        where("lotId", "==", values.lotId)
      );

      // Fetch documents
      const [entryDoc, stockDoc, lotProductSnapshot] = await Promise.all([
        transaction.get(entryDocRef),
        transaction.get(stockRef),
        getDocs(lotProductQuery),
      ]);

      if (!entryDoc.exists()) {
        throw new ValidationError("Entry does not exist.");
      }
      if (!stockDoc.exists()) {
        throw new ValidationError("Stock does not exist.");
      }

      const entryData = entryDoc.data() as IEntry;
      const stockData = stockDoc.data();

      // Stock adjustments
      const unitDifference = values.unitsNumber - entryData.unitsNumber;
      const looseUnitDifference =
        values.looseUnitsNumber - entryData.looseUnitsNumber;

      transaction.update(stockRef, {
        unitsNumber: stockData.unitsNumber + unitDifference,
        looseUnitsNumber: stockData.looseUnitsNumber + looseUnitDifference,
        updatedAt: dateVO.now(),
      });

      // Update entry
      transaction.update(entryDocRef, {
        ...values,
        updatedAt: dateVO.now(),
      });

      // Update LotProduct entry
      if (!lotProductSnapshot.empty) {
        const lotProductDoc = lotProductSnapshot.docs[0];
        const lotProductRef = doc(db, "lotProducts", lotProductDoc.id);
        const lotProductData = lotProductDoc.data();
        transaction.update(lotProductRef, {
          unitsNumber: lotProductData.unitsNumber + unitDifference,
          looseUnitsNumber:
            lotProductData.looseUnitsNumber + looseUnitDifference,
        });
      } else {
        // If no existing LotProduct entry, create one
        const lotProductRef = collection(db, "lotProducts");
        const newLotProductRef = doc(lotProductRef);
        transaction.set(newLotProductRef, {
          id: newLotProductRef.id,
          lotId: values.lotId,
          productId: values.productId,
          unitsNumber: values.unitsNumber,
          looseUnitsNumber: values.looseUnitsNumber,
        });
        transaction.set(doc(lotProductRef), {
          id: doc(lotProductRef).id,
          lotId: values.lotId,
          productId: values.productId,
          quantity: values.unitsNumber,
        });
      }

      return { ...values, id: entryDoc.id };
    });
  } catch (error) {
    throw new APIError("Failed to update entry", error);
  }
};

export const removeEntry = async (entryId: string): Promise<void> => {
  try {
    return await runTransaction(db, async (transaction) => {
      const entryDocRef = doc(db, "entries", entryId);
      const entryDoc = await transaction.get(entryDocRef);

      if (!entryDoc.exists()) {
        throw new ValidationError("Entry does not exist.");
      }

      const entryData = entryDoc.data() as IEntry;

      // Update stock before deleting the entry
      if (entryData.stockId) {
        const stockRef = doc(db, "stock", entryData.stockId);
        const stockDoc = await transaction.get(stockRef);

        if (stockDoc.exists()) {
          const stockData = stockDoc.data();
          transaction.update(stockRef, {
            unitsNumber: stockData.unitsNumber - entryData.unitsNumber,
            looseUnitsNumber:
              stockData.looseUnitsNumber - entryData.looseUnitsNumber,
            updatedAt: dateVO.now(),
          });
        }
      }

      // Remove corresponding LotProduct entry
      const lotProductQuery = query(
        collection(db, "lotProducts"),
        where("productId", "==", entryData.productId),
        where("lotId", "==", entryData.lotId)
      );
      const lotProductSnapshot = await getDocs(lotProductQuery);

      if (!lotProductSnapshot.empty) {
        const lotProductDoc = lotProductSnapshot.docs[0];
        const lotProductRef = doc(db, "lotProducts", lotProductDoc.id);
        const lotProductData = lotProductDoc.data();

        const newUnitsNumber =
          lotProductData.unitsNumber - entryData.unitsNumber;
        const newLooseUnitsNumber =
          lotProductData.looseUnitsNumber - entryData.looseUnitsNumber;

        if (newUnitsNumber > 0 || newLooseUnitsNumber > 0) {
          // If more units exist, update the quantity
          transaction.update(lotProductRef, {
            unitsNumber: Math.max(0, newUnitsNumber),
            looseUnitsNumber: Math.max(0, newLooseUnitsNumber),
          });
        } else {
          // If all units are removed, delete the lotProduct entry
          transaction.delete(lotProductRef);
        }
      }

      // Delete the entry
      transaction.delete(entryDocRef);
    });
  } catch (error) {
    throw new APIError("Failed to remove entry", error);
  }
};

export const getEntryById = async (entryId: string): Promise<IEntry> => {
  try {
    const entryDoc = await getDoc(doc(db, "entries", entryId));
    if (!entryDoc.exists()) {
      throw new ValidationError("Entry not found.");
    }
    return { id: entryDoc.id, ...entryDoc.data() } as IEntry;
  } catch (error) {
    throw new APIError("Failed to get entry", error);
  }
};
