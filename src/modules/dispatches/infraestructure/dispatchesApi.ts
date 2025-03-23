import { db } from "shared/firebase";
import { DispatchedStatus, IDispatch } from "../types";
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

      for (const product of dispatch.products) {
        // Validate product
        const productRef = doc(db, "products", product.id);

        // Query stock using productId and lotId
        const stockQuery = query(
          collection(db, "lotProducts"),
          where("productId", "==", product.id),
          where("lotId", "==", product.lotId)
        );
        const stockSnapshot = await getDocs(stockQuery);

        let stockRef: DocumentReference;
        let stockData: IStock | null = null;

        if (!stockSnapshot.empty) {
          // Use existing stock entry
          stockRef = stockSnapshot.docs[0].ref;
          stockData = stockSnapshot.docs[0].data() as IStock;
          transaction.update(stockRef, {
            unitsNumber: stockData.unitsNumber - product.unitsNumber,
            looseUnitsNumber:
              stockData.looseUnitsNumber - product.looseUnitsNumber,
            updatedAt: now,
          });
        } else {
          throw new ValidationError(
            "Stock entry not found for the given product and lot."
          );
        }

        // Store the dispatch
        product.stockId = stockRef.id;
      }

      delete dispatch.id;
      const dispatchRef = await addDoc(dispatchesRef, dispatch);
      dispatch.id = dispatchRef.id;

      // Add or update LotProduct entry
      // for (const product of dispatch.products) {
      //   const lotProductQuery = query(
      //     collection(db, "lotProducts"),
      //     where("productId", "==", product.id),
      //     where("lotId", "==", product.lotId)
      //   );
      //   const lotProductSnapshot = await getDocs(lotProductQuery);

      //   if (!lotProductSnapshot.empty) {
      //     const lotProductRef = doc(
      //       db,
      //       "lotProducts",
      //       lotProductSnapshot.docs[0].id
      //     );
      //     const lotProductData = lotProductSnapshot.docs[0].data();
      //     transaction.update(lotProductRef, {
      //       unitsNumber:
      //         (lotProductData.unitsNumber || 0) - product.unitsNumber,
      //       looseUnitsNumber:
      //         (lotProductData.looseUnitsNumber || 0) - product.looseUnitsNumber,
      //     });
      //   } else {
      //     throw new ValidationError(
      //       "LotProduct entry not found for the given product and lot."
      //     );
      //   }
      // }

      dispatch.createdAt = now;
      dispatch.dispatchedStatus = DispatchedStatus.Pending;
      return dispatch;
    });
  } catch (error) {
    Logger.error("Failed to add dispatch", { error });
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
      const dispatchDoc = await transaction.get(dispatchDocRef);

      if (!dispatchDoc.exists()) {
        throw new ValidationError("Dispatch does not exist.");
      }

      const dispatchData = dispatchDoc.data() as IDispatch;

      for (const product of values.products) {
        if (!product.stockId) {
          throw new ValidationError("StockId is required.");
        }

        const stockRef = doc(db, "stock", product.stockId);
        const lotProductQuery = query(
          collection(db, "lotProducts"),
          where("productId", "==", product.id),
          where("lotId", "==", product.lotId)
        );

        // Fetch documents
        const [stockDoc, lotProductSnapshot] = await Promise.all([
          transaction.get(stockRef),
          getDocs(lotProductQuery),
        ]);

        if (!stockDoc.exists()) {
          throw new ValidationError("Stock does not exist.");
        }

        const stockData = stockDoc.data() as IStock;

        const productFromDb = dispatchData.products.find(
          (p) => p.id === product.id
        );

        // Stock adjustments
        const unitDifference =
          product.unitsNumber - (productFromDb?.unitsNumber || 0);
        const looseUnitDifference =
          product.looseUnitsNumber - (productFromDb?.looseUnitsNumber || 0);

        transaction.update(stockRef, {
          unitsNumber: stockData.unitsNumber - unitDifference,
          looseUnitsNumber: stockData.looseUnitsNumber - looseUnitDifference,
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

        // Update dispatch products
        if (!productFromDb) {
          dispatchData.products.push(product);
        } else {
          productFromDb.unitsNumber = product.unitsNumber;
          productFromDb.looseUnitsNumber = product.looseUnitsNumber;
        }
      }

      // Update dispatch
      transaction.update(dispatchDocRef, {
        ...values,
        updatedAt: dateVO.now(),
      });

      return { ...values, id: dispatchDoc.id };
    });
  } catch (error) {
    Logger.error("Failed to update dispatch", { error });
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

      for (const product of dispatchData.products) {
        if (!product.stockId) {
          throw new ValidationError("StockId is required.");
        }

        const stockRef = doc(db, "stock", product.stockId);
        const stockDoc = await transaction.get(stockRef);

        if (stockDoc.exists()) {
          const stockData = stockDoc.data() as IStock;
          transaction.update(stockRef, {
            unitsNumber: stockData.unitsNumber + product.unitsNumber,
            looseUnitsNumber:
              stockData.looseUnitsNumber + product.looseUnitsNumber,
            updatedAt: dateVO.now(),
          });
        }

        // Remove corresponding LotProduct entry
        const lotProductQuery = query(
          collection(db, "lotProducts"),
          where("productId", "==", product.id),
          where("lotId", "==", product.lotId)
        );
        const lotProductSnapshot = await getDocs(lotProductQuery);

        if (!lotProductSnapshot.empty) {
          const lotProductDoc = lotProductSnapshot.docs[0];
          const lotProductRef = doc(db, "lotProducts", lotProductDoc.id);
          const lotProductData = lotProductDoc.data();

          const newUnitsNumber =
            lotProductData.unitsNumber + product.unitsNumber;
          const newLooseUnitsNumber =
            lotProductData.looseUnitsNumber + product.looseUnitsNumber;

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
      }

      // Delete the dispatch
      transaction.delete(dispatchDocRef);
    });
  } catch (error) {
    Logger.error("Failed to remove dispatch", { error });
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
