import { db } from "shared/firebase";
import { EntryDTO, IEntry, IProductEntry } from "../types";
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
import { getProductCompositeId } from "./getProductCompositeId";

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
    throw new APIError("Failed to fetch entries", error);
  }
};

export const addEntry = async (entry: EntryDTO): Promise<void> => {
  delete entry.id;
  Logger.info("creating entry from data:", entry);
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
      const productRefs = entry.productsToEnter.map((product) =>
        doc(db, "products", product.id)
      );
      const productDocs = await Promise.all(
        productRefs.map((ref) => transaction.get(ref))
      );

      const placeRefs = entry.productsToEnter
        .filter(
          (product) =>
            product.placeId !== "" &&
            product.placeId !== "No especificaré un lugar"
        )
        .map((product) => doc(db, "places", product.placeId || ""));
      const placeDocs = await Promise.all(
        placeRefs.map((ref) => transaction.get(ref))
      );

      // Validate products and places
      productDocs.forEach((productDoc, index) => {
        if (!productDoc.exists()) {
          Logger.info("Product not found", {
            productId: entry.productsToEnter[index].id,
          });
          throw new ValidationError("Invalid productId.");
        }
      });

      placeDocs.forEach((placeDoc, index) => {
        if (!placeDoc.exists()) {
          Logger.info("PlaceId not found", {
            placeId: entry.productsToEnter[index].placeId,
          });
          throw new ValidationError("Invalid placeId.");
        }
      });

      // Store the entry
      const entryRef = await addDoc(entriesRef, {
        supplierId: entry.supplierId,
        docNumber: entry.docNumber,
        transporterId: entry.transporterId,
        description: entry.description,
        createdAt: now,
      });

      // Process each product in productsToEnter
      for (const product of entry.productsToEnter) {
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
          });
        } else {
          const lotProductRef = doc(collection(db, "lotProducts"));
          transaction.set(lotProductRef, {
            id: lotProductRef.id,
            lotId: lotId,
            productId: product.id,
            unitsNumber: product.unitsNumber,
            looseUnitsNumber: product.looseUnitsNumber,
          });
        }
      }
    });
  } catch (error) {
    Logger.error("Failed to add entry", { error, entry });
    if (error instanceof ValidationError) {
      throw {
        message: error.message,
        code: "400",
      };
    }
    throw new APIError("Failed to add entry", error);
  }
};

export const updateEntry = async ({
  entryId,
  values,
}: {
  entryId: string;
  values: EntryDTO;
}): Promise<IEntry> => {
  Logger.info("values", values);
  try {
    return await runTransaction(db, async (transaction) => {
      const entryDocRef = doc(db, "entries", entryId);
      const entryDoc = await transaction.get(entryDocRef);

      if (!entryDoc.exists()) {
        throw new ValidationError("Entry does not exist.");
      }

      const entryData = entryDoc.data() as IEntry;

      // Prepare reads for products and places
      const productRefs = values.productsToEnter.map((product) =>
        doc(db, "products", product.id)
      );
      const productDocs = await Promise.all(
        productRefs.map((ref) => transaction.get(ref))
      );

      const placeRefs = values.productsToEnter
        .filter(
          (product) =>
            product.placeId !== "" &&
            product.placeId !== "No especificaré un lugar"
        )
        .map((product) => doc(db, "places", product.placeId || ""));
      const placeDocs = await Promise.all(
        placeRefs.map((ref) => transaction.get(ref))
      );

      // Validate products and places
      productDocs.forEach((productDoc, index) => {
        if (!productDoc.exists()) {
          Logger.info("Product not found", {
            productId: values.productsToEnter[index].id,
          });
          throw new ValidationError("Invalid productId.");
        }
      });

      placeDocs.forEach((placeDoc, index) => {
        if (!placeDoc.exists()) {
          Logger.info("PlaceId not found", {
            placeId: values.productsToEnter[index].placeId,
          });
          throw new ValidationError("Invalid placeId.");
        }
      });

      // Update entry
      transaction.update(entryDocRef, {
        supplierId: values.supplierId,
        docNumber: values.docNumber,
        transporterId: values.transporterId,
        description: values.description,
        updatedAt: dateVO.now(),
      });

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
          !values.productsToEnter.some(
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
      for (const product of values.productsToEnter) {
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
            product.looseUnitsNumber - existingProduct.looseUnitsNumber;

          Logger.info("unitsDifference", { unitsDifference });
          Logger.info("looseUnitsDifference", { looseUnitsDifference });

          // Update stock quantities based on the difference
          transaction.update(stockRef, {
            unitsNumber: stockData.unitsNumber + unitsDifference,
            looseUnitsNumber: stockData.looseUnitsNumber + looseUnitsDifference,
            updatedAt: dateVO.now(),
          });

          // Update existing product entry
          const productEntryRef = doc(
            collection(db, "entries", entryDocRef.id, "products"),
            getProductCompositeId(product)
          );
          transaction.update(productEntryRef, {
            ...product,
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
              stockData.looseUnitsNumber + product.looseUnitsNumber,
            updatedAt: dateVO.now(),
          });

          transaction.set(productEntryRef, {
            ...product,
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
            (lotProductData.unitsNumber || 0) + unitsDifference;
          const newLooseUnitsNumber =
            (lotProductData.looseUnitsNumber || 0) + looseUnitsDifference;

          transaction.update(lotProductRef, {
            unitsNumber: Math.max(0, newUnitsNumber),
            looseUnitsNumber: Math.max(0, newLooseUnitsNumber),
          });
        } else {
          const lotProductRef = doc(collection(db, "lotProducts"));
          transaction.set(lotProductRef, {
            id: lotProductRef.id,
            lotId: lotId,
            productId: product.id,
            unitsNumber: product.unitsNumber,
            looseUnitsNumber: product.looseUnitsNumber,
          });
        }
      }

      // Delete products that are no longer in the updated entry
      for (const existingProduct of existingProducts) {
        if (
          !values.productsToEnter.some(
            (product) => product.id === existingProduct.id
          )
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

      // Delete the entry
      transaction.delete(entryDocRef);
    });
  } catch (error) {
    throw new APIError("Failed to remove entry", error);
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

    return { id: entryDoc.id, ...(entryDoc.data() as IEntry), productsToEnter };
  } catch (error) {
    throw new APIError("Failed to get entry", error);
  }
};
