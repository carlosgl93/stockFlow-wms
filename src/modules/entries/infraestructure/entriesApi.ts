import { db } from "shared/firebase";
import { EntryDTO, IEntry, IProductEntry } from "../types";
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
  where,
  runTransaction,
  DocumentReference,
} from "firebase/firestore";
import { Logger } from "utils/logger";
import { IStock } from "modules/stock/types";
import { getProductCompositeId } from "./getProductCompositeId";
import { FirebaseError } from "firebase/app";
import type { QueryClient } from "@tanstack/react-query";

export const fetchEntries = async (): Promise<IEntry[]> => {
  try {
    const entriesRef = collection(db, "entries");
    const q = query(entriesRef, orderBy("createdAt"));
    const snapshot = await getDocs(q);
    const entries = snapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as IEntry)
    );

    // Fetch all products sub-collections in a single batch
    const nestedProductsPromises = entries.map((entry) =>
      getDocs(collection(db, "entries", entry.id!, "products"))
    );
    const nestedProductsSnapshots = await Promise.all(nestedProductsPromises);

    // Map the products to their respective entries
    const entriesWithProducts = entries.map((entry, index) => {
      const products = nestedProductsSnapshots[index].docs.map(
        (doc) => ({ ...doc.data(), id: doc.id } as IProductEntry)
      );
      return { ...entry, productsToEnter: products };
    });

    return entriesWithProducts;
  } catch (error) {
    Logger.error(formatError("fetchEntries", error));
    const t = (key: string) => key; // Fallback translation function
    const humanError = getHumanReadableError(error, t);
    throw new APIError(humanError, error);
  }
};

export const addEntry = async (entry: EntryDTO): Promise<void> => {
  // Normalize string values to uppercase
  entry.docNumber = entry.docNumber?.toUpperCase();
  entry.description = entry.description?.toUpperCase();

  entry.products = entry.products.map((product) => ({
    ...product,
    lotId: product.lotId?.toUpperCase(), // Uppercase if provided, else remains undefined
    // placeId: product.placeId?.toUpperCase(), // Uppercase if provided, else remains undefined
    // expirityDate is a date string and should not be uppercased
    // palletNumber normalization can be added here if it's part of ProductInEntryDTO and needs it
    palletNumber: product.palletNumber?.toUpperCase(),
  }));

  delete entry.id;
  Logger.info("creating entry from data (normalized):", entry);
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

      // Prepare reads for products and places
      const productRefs = entry.products.map((product) =>
        doc(db, "products", product.id)
      );
      const productDocs = await Promise.all(
        productRefs.map((ref) => transaction.get(ref))
      );

      const placeRefs = entry.products
        .filter(
          (product) =>
            product.placeId !== "" &&
            product.placeId !== "No especificaré un lugar" &&
            product.placeId !== "NO ESPECIFICARÉ UN LUGAR"
        )
        .map((product) => doc(db, "places", product?.placeId || ""));
      const placeDocs = await Promise.all(
        placeRefs.map((ref) => transaction.get(ref))
      );

      // Validate products and places
      productDocs.forEach((productDoc, index) => {
        if (!productDoc.exists()) {
          Logger.info("Product not found", {
            productId: entry.products[index].id,
          });
          throw new ValidationError("Invalid productId.");
        }
      });

      placeDocs.forEach((placeDoc, index) => {
        if (!placeDoc.exists()) {
          Logger.info("PlaceId not found", {
            placeId: entry.products[index].placeId,
          });
          throw new ValidationError("Invalid placeId.");
        }
      });

      // Store the entry
      const entryRef = await addDoc(entriesRef, {
        entryDate: entry.entryDate,
        supplierId: entry.supplierId,
        docNumber: entry.docNumber,
        transporterId: entry.transporterId,
        description: entry.description,
        createdAt: now,
        productsIds: entry.products.map((product) => product.id), // Add entryIds array
      });

      // Add to historicMovements collection
      const historicMovementsRef = collection(db, "historicMovements");
      await addDoc(historicMovementsRef, {
        ...entry,
        type: "entry",
        operationType: "create",
        entryId: entryRef.id,
        products: entry.products,
        productsIds: entry.products.map((product) => product.id),
        createdAt: now,
      });

      // Process each product in productsToEnter
      for (const product of entry.products) {
        // Validate or generate lotId
        let lotId = product.lotId || doc(collection(db, "lots")).id;
        if (!lotId) {
          lotId = doc(collection(db, "lots")).id; // Create a new lot if not provided
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
          stockRef = stockSnapshot.docs[0].ref;
          stockData = stockSnapshot.docs[0].data() as IStock;
          transaction.update(stockRef, {
            unitsNumber: stockData.unitsNumber + product.unitsNumber,
            looseUnitsNumber:
              stockData.looseUnitsNumber + product.looseUnitsNumber,
            updatedAt: now,
            placeId: product?.placeId,
            expirityDate: product?.expirityDate || stockData.expirityDate,
          });
        } else {
          // Create new stock entry
          stockRef = doc(collection(db, "stock"));
          transaction.set(stockRef, {
            id: stockRef.id,
            productId: product.id,
            lotId: lotId,
            unitsNumber: product.unitsNumber,
            looseUnitsNumber: product.looseUnitsNumber,
            createdAt: now,
            updatedAt: now,
            placeId: product?.placeId,
            expirityDate: product?.expirityDate,
          });
        }

        // Store the product entry
        const productEntryRef = doc(
          db,
          "entries",
          entryRef.id,
          "products",
          getProductCompositeId(product)
        );
        transaction.set(productEntryRef, {
          ...product,
          stockId: stockRef.id,
          lotId: lotId,
          createdAt: now,
        });

        // Add or update LotProduct entry
        const lotProductQuery = query(
          collection(db, "lotProducts"),
          where("productId", "==", product.id),
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
            unitsNumber:
              (lotProductData.unitsNumber || 0) + product.unitsNumber,
            looseUnitsNumber:
              (lotProductData.looseUnitsNumber || 0) + product.looseUnitsNumber,
            placeId: product?.placeId,
            expirationDate:
              product?.expirityDate || lotProductData.expirationDate,
          });
        } else {
          const lotProductRef = doc(collection(db, "lotProducts"));
          transaction.set(lotProductRef, {
            id: lotProductRef.id,
            lotId: lotId,
            productId: product.id,
            unitsNumber: product.unitsNumber,
            looseUnitsNumber: product.looseUnitsNumber || 0,
            placeId: product?.placeId,
            expirationDate: product?.expirityDate,
          });
        }
      }
    });
  } catch (error) {
    Logger.error(formatError("addEntry", error, { entry }));
    const t = (key: string) => key; // Fallback translation function
    const humanError = getHumanReadableError(error, t);

    if (error instanceof ValidationError) {
      throw {
        message: humanError,
        code: "400",
      };
    }
    throw new APIError(humanError, error);
  }
};

export const updateEntry = async ({
  entryId,
  values,
  queryClient,
}: {
  entryId: string;
  values: EntryDTO;
  queryClient: QueryClient;
}): Promise<IEntry> => {
  // Normalize string values to uppercase
  values.docNumber = values.docNumber?.toUpperCase();
  values.description = values.description?.toUpperCase();

  values.products = values.products.map((product) => ({
    ...product,
    lotId: product.lotId?.toUpperCase(),
    palletNumber: product.palletNumber?.toUpperCase(),
  }));

  Logger.info("values for update (normalized)", values);
  try {
    const result = await runTransaction(db, async (transaction) => {
      const entryDocRef = doc(db, "entries", entryId);
      const entryDoc = await transaction.get(entryDocRef);
      const historicMovementsRef = collection(db, "historicMovements");

      const historicMovementsQuery = query(
        historicMovementsRef,
        where("entryId", "==", entryId),
        where("type", "==", "entry")
      );

      const historicMovementsSnapshot = await getDocs(historicMovementsQuery);
      const historicMovementsEntryDoc =
        historicMovementsSnapshot.docs[0] || null;

      // Fix: Only use an ID if it exists, otherwise generate a new doc ref
      let foundHistoricMovementsEntryDocRef;
      if (historicMovementsEntryDoc) {
        foundHistoricMovementsEntryDocRef = doc(
          db,
          "historicMovements",
          historicMovementsEntryDoc.id
        );
      } else {
        throw new ValidationError(
          "Historic movements entry does not exist for this entry.",
          "404"
        );
      }

      if (!entryDoc.exists()) {
        throw new ValidationError("Entry does not exist.");
      }
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

      // Update entry
      transaction.update(entryDocRef, {
        entryDate: values.entryDate,
        supplierId: values.supplierId,
        docNumber: values.docNumber,
        transporterId: values.transporterId,
        description: values.description,
        updatedAt: dateVO.now(),
        productsIds: values.products.map((product) => product.id), // Update entryIds array
      });

      // instead of adding to historic movements, i need to update the entry in historic movements

      Logger.info("historicMovementsEntryDoc", {
        historicMovementsEntryDoc,
      });
      if (historicMovementsEntryDoc?.exists()) {
        Logger.info("Updating historic movements entry", {
          values,
        });

        // Clean the values object to remove undefined fields
        const cleanValues = Object.fromEntries(
          Object.entries(values).filter(([_, value]) => value !== undefined)
        );

        // Clean products array to remove undefined fields
        cleanValues.products = values.products.map((product) =>
          Object.fromEntries(
            Object.entries(product).filter(([_, value]) => value !== undefined)
          )
        );

        transaction.update(foundHistoricMovementsEntryDocRef, {
          ...cleanValues,
          operationType: "update",
          updatedAt: dateVO.now(),
        });
      } else {
        throw new ValidationError(
          "Historic movements entry does not exist for this entry.",
          "404"
        );
      }

      // Get existing products in the subcollection
      const productsCollectionRef = collection(entryDocRef, "products");
      const existingProductsSnapshot = await getDocs(productsCollectionRef);
      const existingProducts = existingProductsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as IProductEntry[];

      // Identify products to remove
      const productsToRemove = existingProducts.filter(
        (existingProduct) =>
          !values.products.some(
            (product) =>
              getProductCompositeId(product) ===
              getProductCompositeId(existingProduct)
          )
      );

      // Remove products that are no longer in the updated entry
      for (const existingProduct of productsToRemove) {
        const productEntryRef = doc(
          collection(db, "entries", entryDocRef.id, "products"),
          getProductCompositeId(existingProduct)
        );
        transaction.delete(productEntryRef);

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
            unitsNumber: stockData.unitsNumber - existingProduct.unitsNumber,
            looseUnitsNumber:
              stockData.looseUnitsNumber - existingProduct.looseUnitsNumber,
            updatedAt: dateVO.now(),
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
            lotProductData.unitsNumber - existingProduct.unitsNumber;
          const newLooseUnitsNumber =
            lotProductData.looseUnitsNumber - existingProduct.looseUnitsNumber;

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

      // Process each product in productsToEnter
      for (const product of values.products) {
        // Validate or generate lotId
        let lotId = product.lotId || doc(collection(db, "lots")).id;
        if (!lotId) {
          lotId = doc(collection(db, "lots")).id; // Create a new lot if not provided
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
            createdAt: dateVO.now(),
            updatedAt: dateVO.now(),
            expirityDate: product?.expirityDate || "",
            placeId:
              values.products.find((p) => p.id === product.id)?.placeId || "",
          };
          transaction.set(stockRef, stockData);
        }

        // Find existing product entry
        const existingProduct = existingProducts.find(
          (p) => getProductCompositeId(p) === getProductCompositeId(product)
        );

        let unitsDifference;
        let looseUnitsDifference;
        if (existingProduct) {
          // Calculate the difference
          unitsDifference = product.unitsNumber - existingProduct.unitsNumber;
          looseUnitsDifference =
            (product.looseUnitsNumber || 0) -
            (existingProduct.looseUnitsNumber || 0);

          Logger.info("unitsDifference", { unitsDifference });
          Logger.info("looseUnitsDifference", { looseUnitsDifference });

          // Update stock quantities based on the difference
          transaction.update(stockRef, {
            unitsNumber: stockData?.unitsNumber + unitsDifference,
            looseUnitsNumber:
              stockData?.looseUnitsNumber + looseUnitsDifference,
            updatedAt: dateVO.now(),
          });

          // Clean product data to remove undefined fields
          const cleanProduct = Object.fromEntries(
            Object.entries(product).filter(([_, value]) => value !== undefined)
          );

          // Update existing product entry
          const productEntryRef = doc(
            collection(db, "entries", entryDocRef.id, "products"),
            getProductCompositeId(product)
          );
          transaction.update(productEntryRef, {
            ...cleanProduct,
            stockId: stockRef.id,
            lotId: lotId,
            updatedAt: dateVO.now(),
          });
        } else {
          // Create new product entry
          const productEntryRef = doc(
            db,
            "entries",
            entryDocRef.id,
            "products",
            getProductCompositeId(product)
          );

          // Update stock quantities
          transaction.update(stockRef, {
            unitsNumber: stockData.unitsNumber + product.unitsNumber,
            looseUnitsNumber:
              stockData.looseUnitsNumber + (product.looseUnitsNumber || 0),
            updatedAt: dateVO.now(),
          });

          // Clean product data to remove undefined fields
          const cleanProduct = Object.fromEntries(
            Object.entries(product).filter(([_, value]) => value !== undefined)
          );

          transaction.set(productEntryRef, {
            ...cleanProduct,
            stockId: stockRef.id,
            lotId: lotId,
            createdAt: dateVO.now(),
          });
        }

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
            (lotProductData.unitsNumber || 0) + (unitsDifference || 0);
          const newLooseUnitsNumber =
            (lotProductData.looseUnitsNumber || 0) +
            (looseUnitsDifference || 0);

          transaction.update(lotProductRef, {
            id: lotProductRef.id,
            lotId: lotId,
            productId: product.id,
            unitsNumber: Math.max(0, newUnitsNumber),
            expirationDate:
              product?.expirityDate || lotProductData.expirationDate,
            looseUnitsNumber: Math.max(0, newLooseUnitsNumber),
            placeId: product?.placeId,
          });
        } else {
          const lotProductRef = doc(collection(db, "lotProducts"));
          transaction.set(lotProductRef, {
            id: lotProductRef.id,
            lotId: lotId,
            productId: product.id,
            unitsNumber: product.unitsNumber,
            looseUnitsNumber: product.looseUnitsNumber || 0,
            expirationDate: product?.expirityDate,
            placeId:
              values.products.find((p) => p.id === product.id)?.placeId || "",
          });
        }
      }

      // Delete products that are no longer in the updated entry
      for (const existingProduct of existingProducts) {
        if (
          !values.products.some((product) => product.id === existingProduct.id)
        ) {
          const productEntryRef = doc(
            collection(db, "entries", entryDocRef.id, "products"),
            getProductCompositeId(existingProduct)
          );
          transaction.delete(productEntryRef);

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
              unitsNumber: stockData.unitsNumber - existingProduct.unitsNumber,
              looseUnitsNumber:
                stockData.looseUnitsNumber - existingProduct.looseUnitsNumber,
              updatedAt: dateVO.now(),
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
              lotProductData.unitsNumber - existingProduct.unitsNumber;
            const newLooseUnitsNumber =
              lotProductData.looseUnitsNumber -
              existingProduct.looseUnitsNumber;

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
      }

      return { ...values, id: entryDoc.id };
    });
    // Invalidate relevant queries after update
    if (queryClient) {
      queryClient.invalidateQueries(["entries"]);
      queryClient.invalidateQueries(["entry", entryId]);
      // Add more keys if you have other relevant queries
    }
    return result;
  } catch (error) {
    Logger.error(formatError("updateEntry", error, { entryId, values }));
    const t = (key: string) => key; // Fallback translation function
    const humanError = getHumanReadableError(error, t);

    if (error instanceof FirebaseError) {
      throw new APIError(humanError, error);
    }
    throw new APIError(humanError, error);
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

      // Get existing products in the subcollection
      const productsCollectionRef = collection(entryDocRef, "products");
      const existingProductsSnapshot = await getDocs(productsCollectionRef);
      const existingProducts = existingProductsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as IProductEntry[];

      // Update stock and LotProduct entries before deleting the entry
      for (const existingProduct of existingProducts) {
        // Update stock for each product
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
            unitsNumber: stockData.unitsNumber - existingProduct.unitsNumber,
            looseUnitsNumber:
              stockData.looseUnitsNumber - existingProduct.looseUnitsNumber,
            updatedAt: dateVO.now(),
          });
        }

        // Update LotProduct entry for each product
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
            lotProductData.unitsNumber - existingProduct.unitsNumber;
          const newLooseUnitsNumber =
            lotProductData.looseUnitsNumber - existingProduct.looseUnitsNumber;

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

        // Delete the product entry
        const productEntryRef = doc(
          collection(db, "entries", entryDocRef.id, "products"),
          getProductCompositeId(existingProduct)
        );
        transaction.delete(productEntryRef);
      }

      // Add to historicMovements collection
      const historicMovementsRef = collection(db, "historicMovements");
      await addDoc(historicMovementsRef, {
        type: "entry",
        operationType: "delete",
        entryId: entryId,
        data: { ...entryData, products: entryData?.productsIds },
        createdAt: dateVO.now(),
      });

      // Delete the entry
      transaction.delete(entryDocRef);
    });
  } catch (error) {
    Logger.error(formatError("removeEntry", error, { entryId }));
    const t = (key: string) => key; // Fallback translation function
    const humanError = getHumanReadableError(error, t);

    if (error instanceof ValidationError) {
      throw error;
    }
    if (error instanceof FirebaseError) throw new APIError(humanError, error);
    throw new APIError(humanError, error);
  }
};

export const getEntryById = async (entryId: string): Promise<IEntry> => {
  try {
    const entryDocRef = doc(db, "entries", entryId);
    const entryDoc = await getDoc(entryDocRef);
    if (!entryDoc.exists()) {
      throw new ValidationError("Entry not found.");
    }

    const productsCollectionRef = collection(entryDocRef, "products");
    const productsSnapshot = await getDocs(productsCollectionRef);

    const productsToEnter: IProductEntry[] = productsSnapshot.docs.map(
      (doc) => ({
        id: doc.id,
        ...doc.data(),
      })
    ) as IProductEntry[];

    return {
      id: entryDoc.id,
      ...(entryDoc.data() as IEntry),
      products: productsToEnter,
    };
  } catch (error) {
    Logger.error(formatError("getEntryById", error, { entryId }));
    const t = (key: string) => key; // Fallback translation function
    const humanError = getHumanReadableError(error, t);
    throw new APIError(humanError, error);
  }
};

export const fetchEntriesByProductId = async (
  productId: string
): Promise<IEntry[]> => {
  Logger.info("fetchEntriesByProductId", { productId });
  try {
    const entriesRef = collection(db, "entries");
    const entriesSnapshot = await getDocs(entriesRef);
    const entries = entriesSnapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as IEntry)
    );

    const entriesWithProduct = [];

    for (const entry of entries) {
      const productsRef = collection(db, "entries", entry.id!, "products");
      const q = query(productsRef, where("id", "==", productId));
      const productsSnapshot = await getDocs(q);

      if (!productsSnapshot.empty) {
        const products = productsSnapshot.docs.map(
          (doc) => ({ ...doc.data() } as IProductEntry)
        );
        entriesWithProduct.push({ ...entry, productsToEnter: products });
      }
    }

    return entriesWithProduct;
  } catch (error) {
    Logger.error(formatError("fetchEntriesByProductId", error, { productId }));
    const t = (key: string) => key; // Fallback translation function
    const humanError = getHumanReadableError(error, t);
    throw new APIError(humanError, error);
  }
};

export const fetchEntriesByProductIdAndLotId = async (
  productId?: string,
  lotId?: string
): Promise<IEntry[]> => {
  Logger.info("fetchEntriesByProductIdAndLotId", { productId, lotId });
  try {
    const entriesRef = collection(db, "entries");
    const entriesSnapshot = await getDocs(entriesRef);
    const entries = entriesSnapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as IEntry)
    );

    const entriesWithProductAndLot = [];

    for (const entry of entries) {
      const productsRef = collection(db, "entries", entry.id!, "products");
      let q;
      if (productId && lotId) {
        Logger.info("Both productId and lotId provided", [productId, lotId]);
        q = query(
          productsRef,
          where("id", "==", productId),
          where("lotId", "==", lotId)
        );
      } else if (productId) {
        Logger.info("productId provided", [productId]);
        q = query(productsRef, where("id", "==", productId));
      } else if (lotId) {
        Logger.info("lotid provided", [lotId]);
        q = query(productsRef, where("lotId", "==", lotId));
      } else {
        continue;
      }
      const productsSnapshot = await getDocs(q);

      if (!productsSnapshot.empty) {
        const products = productsSnapshot.docs.map(
          (doc) => ({ ...doc.data() } as IProductEntry)
        );
        entriesWithProductAndLot.push({ ...entry, productsToEnter: products });
      }
    }

    return entriesWithProductAndLot;
  } catch (error) {
    Logger.error(
      formatError("fetchEntriesByProductIdAndLotId", error, {
        productId,
        lotId,
      })
    );
    const t = (key: string) => key; // Fallback translation function
    const humanError = getHumanReadableError(error, t);
    throw new APIError(humanError, error);
  }
};
