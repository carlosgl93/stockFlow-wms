import { db } from "shared/firebase";
import { DispatchedStatus, IDispatch } from "../types";
import {
  APIError,
  ValidationError,
  formatError,
  getHumanReadableError,
} from "shared/Error";
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
import { FirebaseError } from "firebase/app";
import { IProductEntry } from "modules/entries/types";
import type { QueryClient } from "@tanstack/react-query";

export const fetchDispatches = async (): Promise<IDispatch[]> => {
  try {
    const dispatchesRef = collection(db, "dispatches");
    let q = query(dispatchesRef);

    const snapshot = await getDocs(q);
    const result = snapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as IDispatch)
    );
    return result;
  } catch (error) {
    const t = (key: string) => key; // Fallback translation function
    const humanError = getHumanReadableError(error, t);
    throw new APIError(humanError, error);
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
      const dispatchRef = await addDoc(dispatchesRef, {
        ...dispatch,
        productsIds: dispatch.products.map((product) => product.id), // Add dispatchIds array
      });
      dispatch.id = dispatchRef.id;

      // Add or update LotProduct entry
      for (const product of dispatch.products) {
        const lotProductQuery = query(
          collection(db, "lotProducts"),
          where("productId", "==", product.id),
          where("lotId", "==", product.lotId)
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
            unitsNumber:
              (lotProductData.unitsNumber || 0) - product.unitsNumber,
            looseUnitsNumber:
              (lotProductData.looseUnitsNumber || 0) - product.looseUnitsNumber,
          });
        } else {
          throw new ValidationError(
            "LotProduct entry not found for the given product and lot."
          );
        }
      }

      // Add to historicMovements collection
      const historicMovementsRef = collection(db, "historicMovements");
      await addDoc(historicMovementsRef, {
        type: "dispatch",
        operationType: "create",
        dispatchId: dispatchRef.id,
        ...dispatch,
        productsIds: dispatch.products.map((product) => product.id),
        createdAt: now,
      });

      dispatch.createdAt = now;
      dispatch.dispatchedStatus = DispatchedStatus.Pending;
      return dispatch;
    });
  } catch (error) {
    Logger.error("Failed to add dispatch", { error });
    const t = (key: string) => key; // Fallback translation function
    const humanError = getHumanReadableError(error, t);

    if (error instanceof ValidationError) {
      throw error;
    }
    throw new APIError(humanError, error);
  }
};

// Utility to remove undefined fields from an object (shallow) and cast to Firestore update type
function removeUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  ) as Partial<T>;
}

export const updateDispatch = async ({
  dispatchId,
  values,
  queryClient,
}: {
  dispatchId: string;
  values: IDispatch;
  queryClient?: QueryClient;
}): Promise<IDispatch> => {
  values.docNumber = values.docNumber?.toUpperCase();
  values.description = values.description?.trim().toUpperCase();
  values.products = values.products.map((product) => ({
    ...product,
    lotId: product.lotId?.toUpperCase(),
    palletNumber: product.palletNumber?.toUpperCase(),
  }));
  Logger.info("values for update dispatch (normalized)", values);
  try {
    const result = await runTransaction(db, async (transaction) => {
      const dispatchDocRef = doc(db, "dispatches", dispatchId);
      const dispatchDoc = await transaction.get(dispatchDocRef);
      const historicMovementsRef = collection(db, "historicMovements");

      const historicMovementsQuery = query(
        historicMovementsRef,
        where("dispatchId", "==", dispatchId),
        where("type", "==", "dispatch")
      );

      const historicMovementsSnapshot = await getDocs(historicMovementsQuery);
      Logger.info("historicMovementsSnapshot", {
        historicMovementsSnapshot: historicMovementsSnapshot.docs.map((d) =>
          d.data()
        ),
      });
      const historicMovementsDispatchDoc =
        historicMovementsSnapshot.docs[0] || null;

      let foundHistoricMovementsDispatchDocRef;
      if (historicMovementsDispatchDoc) {
        foundHistoricMovementsDispatchDocRef = doc(
          db,
          "historicMovements",
          historicMovementsDispatchDoc.id
        );
      } else {
        throw new ValidationError(
          "Historic movements entry does not exist for this dispatch.",
          "404"
        );
      }

      if (!dispatchDoc.exists()) {
        throw new ValidationError("Dispatch does not exist.");
      }

      const dispatchData = dispatchDoc.data() as IDispatch;
      const now = dateVO.now();

      // Prepare reads for products and places
      const productRefs = values.products.map((product) =>
        doc(db, "products", product.id)
      );
      const productDocs = await Promise.all(
        productRefs.map((ref) => transaction.get(ref))
      );

      const placeRefs = values.products
        .filter(
          (product) =>
            product.placeId !== "" &&
            product.placeId !== "No especificaré un lugar" &&
            product.placeId !== "NO ESPECIFICARÉ UN LUGAR"
        )
        .map((product) => doc(db, "places", product.placeId || ""));
      const placeDocs = await Promise.all(
        placeRefs.map((ref) => transaction.get(ref))
      );

      // Validate products and places
      productDocs.forEach((productDoc, index) => {
        if (!productDoc.exists()) {
          Logger.info("Product not found", {
            productId: values.products[index].id,
          });
          throw new ValidationError("Invalid productId.");
        }
      });

      placeDocs.forEach((placeDoc, index) => {
        if (!placeDoc.exists()) {
          Logger.info("PlaceId not found", {
            placeId: values.products[index].placeId,
          });
          throw new ValidationError("Invalid placeId.");
        }
      });
      Logger.info("values", { values });

      // Update dispatch document
      transaction.update(
        dispatchDocRef,
        removeUndefined({
          supplierId: values.supplierId,
          docNumber: values.docNumber,
          transporterId: values.transporterId,
          description: values.description,
          updatedAt: now,
          productsIds: values.products.map((product) => product.id),
          products: values.products.map((product) => ({
            ...product,
            looseUnitsNumber: product.looseUnitsNumber || 0,
            lotId: product.lotId?.toUpperCase(),
            palletNumber: product.palletNumber?.toUpperCase(),
          })),
        })
      );

      Logger.info("historicMovementsDispatchDoc", {
        historicMovementsDispatchDoc,
      });

      if (historicMovementsDispatchDoc?.exists()) {
        Logger.info("Updating historic movements dispatch", {
          values,
        });
        transaction.update(
          foundHistoricMovementsDispatchDocRef,
          removeUndefined({
            ...values,
            products: values.products.map((product) => ({
              ...product,
              looseUnitsNumber: product.looseUnitsNumber || 0,
              lotId: product.lotId?.toUpperCase(),
              palletNumber: product.palletNumber?.toUpperCase(),
            })),
            operationType: "update",
            updatedAt: now,
          })
        );
      } else {
        throw new ValidationError(
          "Historic movements dispatch does not exist for this dispatch.",
          "404"
        );
      }

      // Get existing products in the dispatch
      const existingProducts: IProductEntry[] = dispatchData.products || [];

      // Identify products to remove
      Logger.info("Identifying products to remove", {
        existingProducts,
        updatedProducts: values.products,
      });
      const productsToRemove = existingProducts.filter(
        (existingProduct) =>
          !values.products.some(
            (product) =>
              product.id === existingProduct.id &&
              product.lotId === existingProduct.lotId
          )
      );

      // Remove products that are no longer in the updated dispatch
      for (const existingProduct of productsToRemove) {
        // Update stock for deleted product
        const stockQuery = query(
          collection(db, "stock"),
          where("productId", "==", existingProduct.id),
          where("lotId", "==", existingProduct.lotId)
        );
        const stockSnapshot = await getDocs(stockQuery);
        if (!stockSnapshot.empty) {
          const stockRef = stockSnapshot.docs[0].ref;
          const stockData = stockSnapshot.docs[0].data() as IStock;
          transaction.update(stockRef, {
            unitsNumber: stockData.unitsNumber + existingProduct.unitsNumber,
            looseUnitsNumber:
              stockData.looseUnitsNumber + existingProduct.looseUnitsNumber,
            updatedAt: now,
          });
        }
        // Update LotProduct entry for deleted product
        const lotProductQuery = query(
          collection(db, "lotProducts"),
          where("productId", "==", existingProduct.id),
          where("lotId", "==", existingProduct.lotId)
        );
        const lotProductSnapshot = await getDocs(lotProductQuery);

        if (!lotProductSnapshot.empty) {
          const lotProductDoc = lotProductSnapshot.docs[0];
          const lotProductRef = doc(db, "lotProducts", lotProductDoc.id);
          const lotProductData = lotProductDoc.data();

          const newUnitsNumber =
            (lotProductData.unitsNumber || 0) + existingProduct.unitsNumber;
          const newLooseUnitsNumber =
            (lotProductData.looseUnitsNumber || 0) +
            existingProduct.looseUnitsNumber;

          if (newUnitsNumber > 0 || newLooseUnitsNumber > 0) {
            transaction.update(lotProductRef, {
              unitsNumber: Math.max(0, newUnitsNumber),
              looseUnitsNumber: Math.max(0, newLooseUnitsNumber),
            });
          } else {
            transaction.delete(lotProductRef);
          }
        }
      }

      // Process each product in updated dispatch
      for (const product of values.products) {
        // Validate or generate lotId
        let lotId = product.lotId || doc(collection(db, "lots")).id;
        if (!lotId) {
          lotId = doc(collection(db, "lots")).id;
        }

        // Query stock using productId and lotId
        const stockQuery = query(
          collection(db, "stock"),
          where("productId", "==", product.id),
          where("lotId", "==", lotId)
        );
        const stockSnapshot = await getDocs(stockQuery);

        let stockRef: DocumentReference;
        let stockData: IStock | null = null;

        if (!stockSnapshot.empty) {
          // Use existing stock entry
          const stockProductDoc = stockSnapshot.docs[0];
          const stockProductRef = doc(db, "stock", stockProductDoc.id);
          const stockProductData = stockProductDoc.data();
          stockRef = stockSnapshot.docs[0].ref;
          stockData = {
            ...stockProductData,
            placeId: product.placeId,
          } as IStock;
        } else {
          // Create new stock entry
          stockRef = doc(collection(db, "stock"));
          stockData = {
            id: stockRef.id,
            productId: product.id,
            lotId: lotId,
            unitsNumber: 0,
            looseUnitsNumber: 0,
            createdAt: now,
            updatedAt: now,
            expirityDate: product?.expirityDate || "",
            placeId:
              values.products.find((p) => p.id === product.id)?.placeId || "",
          };
          transaction.set(stockRef, stockData);
        }

        // Find existing product in dispatch
        const existingProduct = existingProducts.find(
          (p) => p.id === product.id && p.lotId === product.lotId
        );

        let unitsDifference = 0;
        let looseUnitsDifference = 0;
        if (existingProduct) {
          unitsDifference = product.unitsNumber - existingProduct.unitsNumber;
          looseUnitsDifference =
            product.looseUnitsNumber - existingProduct.looseUnitsNumber;
        } else {
          unitsDifference = product.unitsNumber;
          looseUnitsDifference = product.looseUnitsNumber;
        }

        // Update stock quantities based on the difference (dispatch = subtract)
        transaction.update(stockRef, {
          unitsNumber: stockData.unitsNumber - unitsDifference,
          looseUnitsNumber: stockData.looseUnitsNumber - looseUnitsDifference,
          updatedAt: now,
        });

        // Update LotProduct entry
        const lotProductQuery = query(
          collection(db, "lotProducts"),
          where("productId", "==", product.id),
          where("lotId", "==", lotId)
        );
        const lotProductSnapshot = await getDocs(lotProductQuery);

        if (!lotProductSnapshot.empty) {
          const lotProductDoc = lotProductSnapshot.docs[0];
          const lotProductRef = doc(db, "lotProducts", lotProductDoc.id);
          const lotProductData = lotProductDoc.data();

          const newUnitsNumber =
            (lotProductData.unitsNumber || 0) - unitsDifference;
          const newLooseUnitsNumber =
            (lotProductData.looseUnitsNumber || 0) - looseUnitsDifference;

          transaction.update(lotProductRef, {
            id: lotProductRef.id,
            lotId: lotId,
            productId: product.id,
            unitsNumber: Math.max(0, newUnitsNumber),
            expirationDate: product?.expirityDate || "",
            looseUnitsNumber: Math.max(0, newLooseUnitsNumber),
            placeId: product?.placeId,
          });
        } else {
          const lotProductRef = doc(collection(db, "lotProducts"));
          transaction.set(lotProductRef, {
            id: lotProductRef.id,
            lotId: lotId,
            productId: product.id,
            unitsNumber: Math.max(0, -unitsDifference),
            looseUnitsNumber: Math.max(0, -looseUnitsDifference),
            expirationDate: product?.expirityDate || "",
            placeId:
              values.products.find((p) => p.id === product.id)?.placeId || "",
          });
        }
      }

      // Delete products that are no longer in the updated dispatch (already handled above)

      return { ...values, id: dispatchDoc.id };
    });
    // Invalidate relevant queries after update
    if (queryClient) {
      queryClient.invalidateQueries(["dispatches"]);
      queryClient.invalidateQueries(["dispatch", dispatchId]);
      // Add more keys if you have other relevant queries
    }
    return result;
  } catch (error) {
    Logger.error(formatError("updateDispatch", error, { dispatchId, values }));
    const t = (key: string) => key; // Fallback translation function
    const humanError = getHumanReadableError(error, t);

    if (error instanceof FirebaseError) {
      throw new APIError(humanError, error);
    }
    throw new APIError(humanError, error);
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

      // Add to historicMovements collection
      const historicMovementsRef = collection(db, "historicMovements");
      await addDoc(historicMovementsRef, {
        type: "dispatch",
        operationType: "delete",
        dispatchId: dispatchId,
        data: { id: dispatchDoc.id, ...dispatchData },
        createdAt: dateVO.now(),
      });

      // Delete the dispatch
      transaction.delete(dispatchDocRef);
    });
  } catch (error) {
    Logger.error("Failed to remove dispatch", { error });
    const t = (key: string) => key; // Fallback translation function
    const humanError = getHumanReadableError(error, t);
    throw new APIError(humanError, error);
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
    const t = (key: string) => key; // Fallback translation function
    const humanError = getHumanReadableError(error, t);
    throw new APIError(humanError, error);
  }
};
