import { db } from "shared/firebase";
import { IDispatch } from "../types";
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

export const fetchDispatches = async (
  page: number,
  pageSize: number,
  lastVisible: string | null
): Promise<IDispatch[]> => {
  try {
    const dispatchesRef = collection(db, "dispatches");
    let q = query(dispatchesRef, orderBy("createdAt"), limit(pageSize));
    if (lastVisible) {
      const lastVisibleDoc = await getDoc(doc(db, "dispatches", lastVisible));
      q = query(
        dispatchesRef,
        orderBy("createdAt"),
        startAfter(lastVisibleDoc),
        limit(pageSize)
      );
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as IDispatch)
    );
  } catch (error) {
    throw new APIError("Failed to fetch dispatches", error);
  }
};

export const addDispatch = async (dispatch: IDispatch): Promise<IDispatch> => {
  try {
    const now = dateVO.now();
    return await runTransaction(db, async (transaction) => {
      const dispatchesRef = collection(db, "dispatches");

      // Check if docNumber already exists
      const q = query(
        dispatchesRef,
        where("docNumber", "==", dispatch.docNumber)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        throw new ValidationError(
          "Dispatch with this docNumber already exists."
        );
      }

      // Validate product
      const productRef = doc(db, "products", dispatch.productId);
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists()) {
        throw new ValidationError("Invalid productId.");
      }

      // Validate place
      if (dispatch.placeId) {
        const placeRef = doc(db, "places", dispatch.placeId);
        const placeDoc = await transaction.get(placeRef);
        if (!placeDoc.exists()) {
          throw new ValidationError("Invalid placeId.");
        }
      }

      // Validate or generate lotId
      let lotId = dispatch.lotId || doc(collection(db, "lots")).id;
      if (!lotId) {
        lotId = doc(collection(db, "lots")).id; // Create a new lot if not provided
      }

      // Query stock using productId and lotId
      const stockQuery = query(
        collection(db, "stock"),
        where("productId", "==", dispatch.productId),
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
          unitsNumber: stockData.unitsNumber - dispatch.unitsNumber,
          looseUnitsNumber:
            stockData.looseUnitsNumber - dispatch.looseUnitsNumber,
          updatedAt: now,
        });
      } else {
        throw new ValidationError(
          "Stock entry not found for the given product and lot."
        );
      }

      // Store the dispatch
      dispatch.stockId = stockRef.id;
      dispatch.lotId = lotId;
      dispatch.createdAt = now;
      delete dispatch.id;
      const dispatchRef = await addDoc(dispatchesRef, dispatch);
      dispatch.id = dispatchRef.id;

      // Add or update LotProduct entry
      const lotProductQuery = query(
        collection(db, "lotProducts"),
        where("productId", "==", dispatch.productId),
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
          unitsNumber: (lotProductData.unitsNumber || 0) - dispatch.unitsNumber,
          looseUnitsNumber:
            (lotProductData.looseUnitsNumber || 0) - dispatch.looseUnitsNumber,
        });
      } else {
        throw new ValidationError(
          "LotProduct entry not found for the given product and lot."
        );
      }

      return dispatch;
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new APIError("Failed to add dispatch", error);
  }
};

export const updateDispatch = async ({
  dispatchId,
  values,
}: {
  dispatchId: string;
  values: IDispatch;
}): Promise<IDispatch> => {
  try {
    return await runTransaction(db, async (transaction) => {
      const dispatchDocRef = doc(db, "dispatches", dispatchId);
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
      const [dispatchDoc, stockDoc, lotProductSnapshot] = await Promise.all([
        transaction.get(dispatchDocRef),
        transaction.get(stockRef),
        getDocs(lotProductQuery),
      ]);

      if (!dispatchDoc.exists()) {
        throw new ValidationError("Dispatch does not exist.");
      }
      if (!stockDoc.exists()) {
        throw new ValidationError("Stock does not exist.");
      }

      const dispatchData = dispatchDoc.data() as IDispatch;
      const stockData = stockDoc.data();

      // Stock adjustments
      const unitDifference = values.unitsNumber - dispatchData.unitsNumber;
      const looseUnitDifference =
        values.looseUnitsNumber - dispatchData.looseUnitsNumber;

      transaction.update(stockRef, {
        unitsNumber: stockData.unitsNumber - unitDifference,
        looseUnitsNumber: stockData.looseUnitsNumber - looseUnitDifference,
        updatedAt: dateVO.now(),
      });

      // Update dispatch
      transaction.update(dispatchDocRef, {
        ...values,
        updatedAt: dateVO.now(),
      });

      // Update LotProduct entry
      if (!lotProductSnapshot.empty) {
        const lotProductDoc = lotProductSnapshot.docs[0];
        const lotProductRef = doc(db, "lotProducts", lotProductDoc.id);
        const lotProductData = lotProductDoc.data();
        transaction.update(lotProductRef, {
          unitsNumber: lotProductData.unitsNumber - unitDifference,
          looseUnitsNumber:
            lotProductData.looseUnitsNumber - looseUnitDifference,
        });
      } else {
        throw new ValidationError(
          "LotProduct entry not found for the given product and lot."
        );
      }

      return { ...values, id: dispatchDoc.id };
    });
  } catch (error) {
    throw new APIError("Failed to update dispatch", error);
  }
};

export const removeDispatch = async (dispatchId: string): Promise<void> => {
  try {
    return await runTransaction(db, async (transaction) => {
      const dispatchDocRef = doc(db, "dispatches", dispatchId);
      const dispatchDoc = await transaction.get(dispatchDocRef);

      if (!dispatchDoc.exists()) {
        throw new ValidationError("Dispatch does not exist.");
      }

      const dispatchData = dispatchDoc.data() as IDispatch;

      // Update stock before deleting the dispatch
      if (dispatchData.stockId) {
        const stockRef = doc(db, "stock", dispatchData.stockId);
        const stockDoc = await transaction.get(stockRef);

        if (stockDoc.exists()) {
          const stockData = stockDoc.data();
          transaction.update(stockRef, {
            unitsNumber: stockData.unitsNumber + dispatchData.unitsNumber,
            looseUnitsNumber:
              stockData.looseUnitsNumber + dispatchData.looseUnitsNumber,
            updatedAt: dateVO.now(),
          });
        }
      }

      // Remove corresponding LotProduct entry
      const lotProductQuery = query(
        collection(db, "lotProducts"),
        where("productId", "==", dispatchData.productId),
        where("lotId", "==", dispatchData.lotId)
      );
      const lotProductSnapshot = await getDocs(lotProductQuery);

      if (!lotProductSnapshot.empty) {
        const lotProductDoc = lotProductSnapshot.docs[0];
        const lotProductRef = doc(db, "lotProducts", lotProductDoc.id);
        const lotProductData = lotProductDoc.data();

        const newUnitsNumber =
          lotProductData.unitsNumber - dispatchData.unitsNumber;
        const newLooseUnitsNumber =
          lotProductData.looseUnitsNumber - dispatchData.looseUnitsNumber;

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

      // Delete the dispatch
      transaction.delete(dispatchDocRef);
    });
  } catch (error) {
    throw new APIError("Failed to remove dispatch", error);
  }
};

export const getDispatchById = async (
  dispatchId: string
): Promise<IDispatch> => {
  try {
    const dispatchDoc = await getDoc(doc(db, "dispatches", dispatchId));
    if (!dispatchDoc.exists()) {
      throw new ValidationError("Dispatch not found.");
    }
    return { id: dispatchDoc.id, ...dispatchDoc.data() } as IDispatch;
  } catch (error) {
    throw new APIError("Failed to get dispatch", error);
  }
};
